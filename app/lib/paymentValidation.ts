export class PaymentValidationError extends Error {
    constructor(message: string, public readonly status = 400) {
        super(message);
        this.name = "PaymentValidationError";
    }
}

export function parsePaymentQuantity(value: unknown): number {
    if ((typeof value !== "string" && typeof value !== "number") || !/^\d+$/.test(String(value).trim())) {
        throw new PaymentValidationError("Invalid quantity");
    }
    const quantity = Number(value);
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw new PaymentValidationError("Invalid quantity");
    return quantity;
}

export function validatePaymentAmount(amount: number): number {
    const cents = Math.round(amount * 100);
    if (!Number.isFinite(amount) || !Number.isSafeInteger(cents) || cents > 99999999) {
        throw new PaymentValidationError("Product pricing is temporarily unavailable", 503);
    }
    if (cents < 1) throw new PaymentValidationError("The payment amount must be positive", 422);
    return cents;
}
