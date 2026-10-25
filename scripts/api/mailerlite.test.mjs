import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

function setup(outcomes) {
    const calls = [];
    const logs = [];
    const api = loadTs("app/lib/mailerlite.ts", {}, {
        process: { env: { MAILERLITE_API_ACCESS_TOKEN: "secret-token" } },
        console: { warn: (...args) => logs.push(args) },
        setTimeout: (fn) => fn(),
        fetch: async (_url, options) => {
            calls.push(options);
            const outcome = outcomes[Math.min(calls.length - 1, outcomes.length - 1)];
            if (typeof outcome !== "number") throw outcome;
            return new Response("{}", { status: outcome });
        },
    });
    return { ...api, calls, logs };
}

test("a TLS connection reset is retried with the same subscription and a timeout", async () => {
    const app = setup([{ cause: { code: "ECONNRESET" } }, 201]);
    assert.equal((await app.upsertMailerLiteSubscriber("subscriber@example.com")).status, 201);
    assert.equal(app.calls.length, 2);
    assert.equal(app.calls[0].body, app.calls[1].body);
    assert.ok(app.calls.every((call) => call.signal instanceof AbortSignal));
    assert.doesNotMatch(JSON.stringify(app.logs), /subscriber@example.com|secret-token/);
});

test("persistent transient failures stop after three attempts", async () => {
    const app = setup([{ cause: { code: "ECONNRESET" } }]);
    await assert.rejects(app.upsertMailerLiteSubscriber("subscriber@example.com"));
    assert.equal(app.calls.length, 3);
});

test("timeouts and temporary upstream outages can recover", async () => {
    for (const failure of [{ name: "TimeoutError" }, 502, 503, 504]) {
        const app = setup([failure, 201]);
        assert.equal((await app.upsertMailerLiteSubscriber("subscriber@example.com")).status, 201);
        assert.equal(app.calls.length, 2);
    }
});

test("validation, authentication, rate-limit and certificate errors are not retried", async () => {
    for (const status of [401, 403, 422, 429]) {
        const app = setup([status]);
        assert.equal((await app.upsertMailerLiteSubscriber("subscriber@example.com")).status, status);
        assert.equal(app.calls.length, 1);
    }
    const app = setup([{ cause: { code: "CERT_HAS_EXPIRED" } }]);
    await assert.rejects(app.upsertMailerLiteSubscriber("subscriber@example.com"));
    assert.equal(app.calls.length, 1);
});

test("signup schedules newsletter work after the response and tolerates its failure", async () => {
    for (const subscribeNewsletter of [true, false]) {
        const scheduled = [];
        let subscriptions = 0;
        const api = loadTs("app/serverActions/authActions.ts", {
            bcrypt: { hash: async () => "hashed-password" },
            "../lib/constantes": { getTokenExpiration: () => "2099-01-01" },
            "../lib/nodemailer": {
                getDefaultMailOptions: (x) => x, htmlToText: (x) => x, transporter: { sendMail: async () => ({}) },
            },
            "../lib/sanity.clientServerDev": { SanityServerClient: { fetch: async () => [], create: async (data) => ({ ...data, _id: "new-user" }) } },
            "../lib/utils": { getActivateToken: () => "token", isStrongPassword: () => true, isValidEmail: () => true, replaceInString: (x) => x },
            "next/server": { after: (callback) => scheduled.push(callback) },
            "../lib/mailerlite": {
                upsertMailerLiteSubscriber: async () => { subscriptions++; throw new Error("fetch failed"); },
                mailerLiteNetworkCode: () => "ECONNRESET",
            },
        }, { console: { info() {}, error() {} } });
        const result = await api.handleSignup({ email: "buyer@example.com", name: "Buyer", password1: "strong-password", password2: "strong-password", subscribeNewsletter }, { body: "Activate", subject: "Activate" });
        assert.equal(result.status, 201);
        assert.equal(subscriptions, 0);
        assert.equal(scheduled.length, subscribeNewsletter ? 1 : 0);
        if (subscribeNewsletter) {
            await assert.doesNotReject(scheduled[0]());
            assert.equal(subscriptions, 1);
        }
    }
});
