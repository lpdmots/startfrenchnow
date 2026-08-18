import assert from "node:assert/strict";
import test from "node:test";

import { fetchHistoricalChfToEurRates } from "../../app/lib/reporting/exchangeRateClient.mjs";

const range = {
    from: "2026-08-10",
    to: "2026-08-16",
};

test("uses the ECB fallback and converts CHF-per-EUR rates to EUR-per-CHF when Frankfurter fails", async () => {
    const requestedUrls = [];
    const fetchImpl = async (input) => {
        const url = String(input);
        requestedUrls.push(url);

        if (url.includes("api.frankfurter.dev")) {
            return new Response("Connection timed out", { status: 522 });
        }

        return new Response(
            [
                "KEY,FREQ,CURRENCY,CURRENCY_DENOM,EXR_TYPE,EXR_SUFFIX,TIME_PERIOD,OBS_VALUE",
                "EXR.D.CHF.EUR.SP00.A,D,CHF,EUR,SP00,A,2026-08-14,0.939",
            ].join("\n"),
            { status: 200 },
        );
    };

    const rates = await fetchHistoricalChfToEurRates(range, { fetchImpl, logger: { warn() {} } });

    assert.equal(requestedUrls.length, 2);
    assert.match(requestedUrls[1], /data-api\.ecb\.europa\.eu/);
    assert.deepEqual(rates, [{ date: "2026-08-14", rate: 1 / 0.939 }]);
});

test("does not call the ECB fallback when Frankfurter returns valid rates", async () => {
    const requestedUrls = [];
    const fetchImpl = async (input) => {
        requestedUrls.push(String(input));
        return Response.json([{ date: "2026-08-14", base: "CHF", quote: "EUR", rate: 1.065 }]);
    };

    const rates = await fetchHistoricalChfToEurRates(range, { fetchImpl, logger: { warn() {} } });

    assert.equal(requestedUrls.length, 1);
    assert.deepEqual(rates, [{ date: "2026-08-14", rate: 1.065 }]);
});

test("fails only after both Frankfurter and the ECB fallback are unavailable", async () => {
    const fetchImpl = async () => new Response("Unavailable", { status: 503 });

    await assert.rejects(
        fetchHistoricalChfToEurRates(range, { fetchImpl, logger: { warn() {} } }),
        /Frankfurter API 503; ECB API 503/,
    );
});
