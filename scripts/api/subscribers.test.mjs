import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { loadTs } from "./load-ts.mjs";

const require = createRequire(import.meta.url);
const source = readFileSync(new URL("../../app/api/subscribers/route.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
});

function setup({ status = 201, body = {}, token = "test-token", networkFailure = false } = {}) {
    const logs = [];
    const calls = [];
    const context = {
        exports: {},
        require,
        process: { env: { MAILERLITE_API_ACCESS_TOKEN: token } },
        console: {
            warn: (...args) => logs.push(args),
            error: (...args) => logs.push(args),
        },
        fetch: async (url, options) => {
            calls.push({ url, options });
            if (networkFailure) throw new Error("Sensitive upstream error");
            return new Response(typeof body === "string" ? body : JSON.stringify(body), { status });
        },
    };
    const mailerlite = loadTs("app/lib/mailerlite.ts", {}, { ...context, setTimeout: (fn) => fn() });
    context.require = (name) => name === "@/app/lib/mailerlite" ? mailerlite : require(name);
    vm.runInNewContext(outputText, context);
    return {
        logs,
        calls,
        post: (body = { email: "test@example.com" }) => context.exports.POST(new Request("http://localhost/api/subscribers", {
            method: "POST",
            body: typeof body === "string" ? body : JSON.stringify(body),
        })),
    };
}

test("successful subscriptions preserve the group and trim the email", async () => {
    const app = setup();
    assert.equal((await app.post({ email: " test@example.com " })).status, 200);
    assert.deepEqual(JSON.parse(app.calls[0].options.body), { email: "test@example.com", groups: ["79392045100173113"] });
    assert.equal(app.logs.length, 0);
});

test("invalid JSON and invalid email return 400 without contacting MailerLite", async () => {
    for (const body of ["{broken", null, {}, { email: "invalid" }]) {
        const app = setup();
        assert.equal((await app.post(body)).status, 400);
        assert.equal(app.calls.length, 0);
    }
});

test("honeypot submissions still return success without contacting MailerLite", async () => {
    const app = setup();
    assert.equal((await app.post({ email: "test@example.com", website: "spam" })).status, 200);
    assert.equal(app.calls.length, 0);
});

test("missing credentials are diagnosed without an upstream request", async () => {
    const app = setup({ token: "" });
    assert.equal((await app.post()).status, 503);
    assert.equal(app.calls.length, 0);
    assert.match(JSON.stringify(app.logs), /Missing MAILERLITE_API_ACCESS_TOKEN/);
});

for (const [name, status, errors, expected] of [
    ["email rejection", 422, { email: ["Rejected test@example.com"] }, 422],
    ["invalid group", 422, { "groups.0": ["Unknown group"] }, 502],
    ["mixed validation failure", 422, { email: ["Invalid"], groups: ["Invalid"] }, 502],
    ["unclassified validation failure", 422, undefined, 502],
    ["authentication failure", 401, undefined, 502],
    ["authorization failure", 403, undefined, 502],
    ["rate limit", 429, undefined, 429],
    ["upstream outage", 500, undefined, 502],
]) {
    test(`${name} returns ${expected} and logs the original status without sensitive data`, async () => {
        const app = setup({ status, body: { message: "Private test@example.com test-token", errors } });
        const response = await app.post();
        assert.equal(response.status, expected);
        assert.equal(app.logs[0][1].upstreamStatus, status);
        assert.doesNotMatch(JSON.stringify(app.logs) + await response.text(), /test@example.com|test-token|Private/);
    });
}

test("non-JSON upstream failures retain the original status in logs", async () => {
    const app = setup({ status: 503, body: "<html>Unavailable</html>" });
    assert.equal((await app.post()).status, 502);
    assert.equal(app.logs[0][1].upstreamStatus, 503);
});

test("network failures return a generic 502 and produce a diagnostic log", async () => {
    const app = setup({ networkFailure: true });
    const response = await app.post();
    assert.equal(response.status, 502);
    assert.match(JSON.stringify(app.logs), /network request failed/);
    assert.doesNotMatch(await response.text(), /Sensitive/);
});
