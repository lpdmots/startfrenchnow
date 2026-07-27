import "server-only";

const CHF_TO_EUR_URL = "https://api.frankfurter.dev/v2/rate/CHF/EUR?providers=ECB";

export async function fetchChfToEurRate(): Promise<number | null> {
    try {
        const response = await fetch(CHF_TO_EUR_URL, {
            next: { revalidate: 24 * 60 * 60 },
        });
        if (!response.ok) {
            throw new Error(`Frankfurter API ${response.status}`);
        }

        const data = (await response.json()) as { rate?: number };
        const rate = Number(data.rate);
        if (!Number.isFinite(rate) || rate <= 0) {
            throw new Error("Taux CHF/EUR invalide");
        }

        return rate;
    } catch (error) {
        console.error("[SalesReport] CHF/EUR conversion unavailable", error);
        return null;
    }
}
