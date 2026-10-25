const RETRYABLE_NETWORK_CODES = new Set(["ECONNRESET", "ETIMEDOUT", "EAI_AGAIN", "UND_ERR_CONNECT_TIMEOUT", "UND_ERR_SOCKET"]);

export function mailerLiteNetworkCode(error: unknown): string {
    const failure = error as { name?: string; code?: string; cause?: { code?: string } } | null;
    const code = failure?.cause?.code || failure?.code || "";
    if (RETRYABLE_NETWORK_CODES.has(code)) return code;
    return failure?.name === "TimeoutError" ? "TIMEOUT" : "NETWORK_ERROR";
}

// MailerLite upserts by email, so retrying the same payload does not create a second subscriber.
export async function upsertMailerLiteSubscriber(email: string): Promise<Response> {
    const token = process.env.MAILERLITE_API_ACCESS_TOKEN;
    if (!token) throw new Error("Missing MAILERLITE_API_ACCESS_TOKEN");

    for (let attempt = 1; ; attempt++) {
        try {
            const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify({ email, groups: ["79392045100173113"] }),
                signal: AbortSignal.timeout(8000),
            });
            if (attempt >= 3 || ![502, 503, 504].includes(response.status)) return response;
            console.warn("[MailerLite] Retrying temporary HTTP failure", { attempt, upstreamStatus: response.status });
            await response.body?.cancel();
        } catch (error) {
            const code = mailerLiteNetworkCode(error);
            if (attempt >= 3 || code === "NETWORK_ERROR") throw error;
            console.warn("[MailerLite] Retrying network failure", { attempt, code });
        }
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
}
