import { DiscountRounding, DiscountType } from "../types/sfn/stripe";

type ApplyDiscountInput = {
    amount: number;
    discountType: DiscountType;
    discountValue: number;
    rounding?: DiscountRounding;
};

export function roundByRounding(value: number, rounding: DiscountRounding = "none"): number {
    if (!Number.isFinite(value)) return value;

    if (rounding === "round") {
        return Math.round(value);
    }
    if (rounding === "decimal") {
        return Math.round(value * 10) / 10;
    }
    return Math.round(value * 100) / 100;
}

export function roundCurrency(value: number): number {
    if (!Number.isFinite(value)) return value;
    return Math.round(value * 100) / 100;
}

export function applyDiscountToAmount({ amount, discountType, discountValue, rounding = "none" }: ApplyDiscountInput): { amount: number; discountAmount: number } {
    const safeAmount = Number.isFinite(amount) ? amount : 0;
    const safeDiscountValue = Number.isFinite(discountValue) ? discountValue : 0;

    let discountedAmount = safeAmount;
    switch (discountType) {
        case "percentage":
            discountedAmount = safeAmount * (1 - safeDiscountValue / 100);
            break;
        case "flatDiscount":
            discountedAmount = safeAmount - safeDiscountValue;
            break;
        case "newPrice":
            discountedAmount = safeDiscountValue;
            break;
        default:
            discountedAmount = safeAmount;
    }

    discountedAmount = Math.max(discountedAmount, 0);
    discountedAmount = roundByRounding(discountedAmount, rounding);
    discountedAmount = Math.max(discountedAmount, 0);

    return {
        amount: discountedAmount,
        discountAmount: roundCurrency(safeAmount - discountedAmount),
    };
}
