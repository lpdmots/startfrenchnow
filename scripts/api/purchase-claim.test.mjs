import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

const conflict = () => Object.assign(new Error("Revision conflict"), { statusCode: 409 });

function setup(beforeCommit = () => {}) {
    const user = {
        _id: "user-1", _rev: "user-rev-1", email: "buyer@example.com", isActive: true,
        credits: [{ _key: "credit-1", referenceKey: "mock_exam", totalCredits: 5, remainingCredits: 4 }],
    };
    const pending = {
        _id: "pending-1", _rev: "pending-rev-1", status: "paid",
        items: [{ quantity: 1, benefitsSnapshot: [{ benefitType: "credits", referenceKey: "mock_exam", creditAmount: 2 }] }],
    };
    const state = { user, pending, commits: 0, emails: 0, notifications: 0, reads: 0 };
    const client = {
        fetch: async (query) => {
            state.reads++;
            return structuredClone(query.includes('"pendingPurchase"') ? (pending.status === "paid" ? [pending] : []) : user);
        },
        transaction: () => {
            const patches = [];
            const tx = {
                patch: (id, callback) => {
                    const patch = { id, sets: [], appends: [] };
                    const builder = {
                        ifRevisionId: (rev) => { patch.rev = rev; return builder; },
                        setIfMissing: () => builder,
                        set: (value) => { patch.sets.push(value); return builder; },
                        append: (key, values) => { patch.appends.push({ key, values }); return builder; },
                    };
                    callback(builder);
                    patches.push(patch);
                    return tx;
                },
                commit: async () => {
                    state.commits++;
                    beforeCommit(state);
                    // Check all revisions first, just like an atomic Sanity transaction.
                    for (const patch of patches) {
                        const doc = patch.id === user._id ? user : pending;
                        assert.ok(patch.rev, "Every modified document needs a revision precondition");
                        if (doc._rev !== patch.rev) throw conflict();
                    }
                    for (const patch of patches) {
                        const doc = patch.id === user._id ? user : pending;
                        for (const values of patch.sets) {
                            for (const [key, value] of Object.entries(values)) {
                                const creditPath = /^credits\[_key=="([^"]+)"\]\.(.+)$/.exec(key);
                                if (creditPath) doc.credits.find((c) => c._key === creditPath[1])[creditPath[2]] = value;
                                else doc[key] = value;
                            }
                        }
                        for (const { key, values } of patch.appends) doc[key] = [...(doc[key] || []), ...values];
                        doc._rev += "-next";
                    }
                },
            };
            return tx;
        },
    };
    const api = loadTs("app/lib/claimPendingPurchases.ts", {
        "@/app/lib/sanity.clientServerDev": { SanityServerClient: client },
        "@/app/lib/nodemailer": {
            getDefaultMailOptions: (x) => x, htmlToText: (x) => x,
            transporter: { sendMail: async () => { state.emails++; return {}; } },
        },
        "@/app/lib/systemNotifications": { appendSystemNotification: async () => { state.notifications++; } },
        "@/app/lib/purchaseMessages": { buildPurchaseMailMessage: () => ({}), buildPurchaseSystemNotification: () => ({}) },
    }, { setTimeout: (fn) => fn(), console: { warn() {}, error() {}, info() {} } });
    return { state, claim: () => api.claimPendingPurchases({ email: user.email, userId: user._id }) };
}

test("two simultaneous claims award a purchase and send its notification only once", async () => {
    const app = setup();
    const results = await Promise.all([app.claim(), app.claim()]);
    assert.equal(results.filter((r) => r.claimed).length, 1);
    assert.equal(results.find((r) => !r.claimed).reason, "nothing_to_claim");
    assert.equal(app.state.user.credits[0].remainingCredits, 6);
    assert.equal(app.state.pending.status, "assigned");
    assert.equal(app.state.emails, 1);
    assert.equal(app.state.notifications, 1);
});

test("a concurrent credit use is preserved by re-reading the user before retry", async () => {
    const app = setup((state) => {
        if (state.commits === 1) {
            state.user._rev = "used-one-credit";
            state.user.credits[0].remainingCredits--;
        }
    });
    assert.equal((await app.claim()).claimed, true);
    assert.equal(app.state.user.credits[0].remainingCredits, 5);
    assert.equal(app.state.commits, 2);
    assert.equal(app.state.emails, 1);
});

test("a pending purchase revision change triggers a fresh read and successful retry", async () => {
    const app = setup((state) => { if (state.commits === 1) state.pending._rev = "changed"; });
    assert.equal((await app.claim()).claimed, true);
    assert.equal(app.state.commits, 2);
    assert.equal(app.state.reads, 4);
});

test("persistent conflicts stop after three attempts without notifications", async () => {
    const app = setup(() => { throw conflict(); });
    await assert.rejects(app.claim(), { statusCode: 409 });
    assert.equal(app.state.commits, 3);
    assert.equal(app.state.emails + app.state.notifications, 0);
});

test("non-conflict failures propagate without being mislabeled or retried", async () => {
    const app = setup(() => { throw Object.assign(new Error("Unavailable"), { statusCode: 503 }); });
    await assert.rejects(app.claim(), { statusCode: 503 });
    assert.equal(app.state.commits, 1);
    assert.equal(app.state.pending.status, "paid");
});

test("a webhook returns 500 when assignment fails so Stripe can retry delivery", async () => {
    const api = loadTs("app/api/stripe-webhook/route.ts", {
        stripe: class {
            webhooks = { constructEventAsync: async () => ({
                type: "payment_intent.succeeded", data: { object: {
                    id: "pi-test", created: 1789450000, amount_received: 1000, currency: "chf",
                    metadata: { productSlug: "pack", email: "buyer@example.com", userId: "user-1" },
                } },
            }) };
        },
        "@/app/lib/sanity.clientServerDev": { SanityServerClient: {
            fetch: async (query) => query.includes('"product"') ? { _id: "product-1", benefits: [{ benefitType: "credits" }] } : { _id: "user-1", isActive: true },
            createIfNotExists: async () => {},
        } },
        "@/app/lib/claimPendingPurchases": { claimPendingPurchases: async () => { throw conflict(); } },
    }, { crypto: globalThis.crypto, console: { log() {}, error() {} } });
    const response = await api.POST(new Request("http://localhost/api/stripe-webhook", { method: "POST", body: "signed-test" }));
    assert.equal(response.status, 500);
});
