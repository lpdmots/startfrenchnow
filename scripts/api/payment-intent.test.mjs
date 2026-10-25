import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

function setup({ price = 12.5, missingProduct = false } = {}) {
    const stripeCalls = [];
    const product = {
        _id: "product-1", referenceKey: "pack_fide", minQuantity: 1, maxQuantity: 10,
        benefits: [], pricingDetails: [{ currency: "CHF", originalPrice: price, plans: [] }],
    };
    const api = loadTs("app/api/create-payment-intent/route.ts", {
        stripe: class {
            customers = { create: async (params) => { stripeCalls.push(params); return { id: "customer-1" }; } };
            paymentIntents = { create: async (params) => { stripeCalls.push(params); return { id: "pi-test", client_secret: "test-secret" }; } };
        },
        "@/app/lib/sanity.clientServerDev": { SanityServerClient: { fetch: async () => missingProduct ? null : product } },
        "next-sanity": { groq: String.raw },
        "@/app/serverActions/productActions": { getUserPurchases: async () => undefined },
    }, { process: { env: { STRIPE_SECRET_KEY: "test" } }, console: { error() {} } });
    return {
        stripeCalls,
        post: (data) => api.POST(new Request("http://localhost/api/create-payment-intent", {
            method: "POST", body: JSON.stringify({ productSlug: "pack", currency: "CHF", ...data }),
        })),
    };
}

test("missing, malformed, fractional, unsafe and out-of-range quantities never reach Stripe", async () => {
    for (const quantity of [undefined, null, "", "abc", "2items", "1.5", 0, -1, true, [], {}, 11, "999999999999999999"]) {
        const app = setup();
        const response = await app.post({ quantity, email: "buyer@example.com" });
        assert.equal(response.status, 400, `quantity=${JSON.stringify(quantity)}`);
        assert.equal(app.stripeCalls.length, 0);
    }
});

test("valid quantities use the server price and normalize Stripe metadata", async () => {
    for (const quantity of ["2", 2]) {
        const app = setup();
        assert.equal((await app.post({ quantity })).status, 200);
        assert.equal(app.stripeCalls[0].amount, 2500);
        assert.equal(app.stripeCalls[0].metadata.quantity, "2");
    }
});

test("missing products and unsupported currencies are rejected without Stripe calls", async () => {
    const missing = setup({ missingProduct: true });
    assert.equal((await missing.post({ quantity: "1" })).status, 404);
    const app = setup();
    assert.equal((await app.post({ quantity: "1", currency: "JPY" })).status, 400);
    assert.equal(app.stripeCalls.length + missing.stripeCalls.length, 0);
});

test("invalid catalogue prices never create customers or payment intents", async () => {
    for (const price of [null, NaN, Infinity, "12.50", -1, 1000000]) {
        const app = setup({ price });
        assert.equal((await app.post({ quantity: "1", email: "buyer@example.com" })).status, 503);
        assert.equal(app.stripeCalls.length, 0);
    }
});

test("a zero total is handled before Stripe", async () => {
    const app = setup({ price: 0 });
    assert.equal((await app.post({ quantity: "1" })).status, 422);
    assert.equal(app.stripeCalls.length, 0);
});
