"use server";
import { PricingDetails, ProductFetch, ProductInfos } from "../types/sfn/stripe";
import { getProductData } from "../lib/utils";
import { Lesson } from "../types/sfn/auth";
import { parsePaymentQuantity, PaymentValidationError, validatePaymentAmount } from "../lib/paymentValidation";

export const getAmount = async (
    product: ProductFetch,
    quantity: string,
    currency: "EUR" | "USD" | "CHF",
    userPurchasedLesson: Lesson | undefined
): Promise<{
    pricingDetails: PricingDetails;
    productInfos: ProductInfos;
}> => {
    if (!product) {
        throw new PaymentValidationError("Product not found", 404);
    }
    const { pricingDetails: details, benefits, ...productInfos } = product;
    const parsedQuantity = parsePaymentQuantity(quantity);
    if (!["EUR", "USD", "CHF"].includes(currency)) throw new PaymentValidationError("Invalid currency");
    const price = details?.find((detail) => detail.currency === currency);
    if (!price) throw new PaymentValidationError("No pricing details found for the selected currency");
    if (typeof price.originalPrice !== "number" || !Number.isFinite(price.originalPrice) || price.originalPrice < 0) {
        throw new PaymentValidationError("Product pricing is temporarily unavailable", 503);
    }

    const totalPurchasedMinutes = userPurchasedLesson?.totalPurchasedMinutes || 0;
    const minutesPerLesson = benefits?.find((benefit) => benefit.referenceKey === product?.referenceKey)?.creditAmount;

    /* if (!minutesPerLesson) {
        throw new Error("Ce produit n'ajoute pas de crédits de leçon");
    } */

    const previousPurchasedLessons = totalPurchasedMinutes / (minutesPerLesson || 1);

    const remainingQuantity = Math.max(0, product.maxQuantity - previousPurchasedLessons);

    if (parsedQuantity > product.maxQuantity || parsedQuantity < (product.minQuantity || 1) || parsedQuantity > remainingQuantity) {
        throw new PaymentValidationError("Invalid quantity");
    }

    const pricingDetails = getProductData(product, parsedQuantity, previousPurchasedLessons, currency);
    validatePaymentAmount(pricingDetails.amount);
    return { pricingDetails, productInfos };
};
