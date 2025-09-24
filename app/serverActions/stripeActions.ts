"use server";
import { PricingDetails, ProductFetch, ProductInfos } from "../types/sfn/stripe";
import { getProductData } from "../lib/utils";
import { Lesson } from "../types/sfn/auth";

export const getAmount = async (
    product: ProductFetch,
    quantity: string,
    currency: "EUR" | "USD" | "CHF",
    userPurchasedLesson: Lesson | undefined
): Promise<{
    pricingDetails: PricingDetails;
    productInfos: ProductInfos;
}> => {
    const { pricingDetails: details, benefits, ...productInfos } = product;

    if (!product) {
        throw new Error("Product not found");
    }

    const totalPurchasedMinutes = userPurchasedLesson?.totalPurchasedMinutes || 0;
    const minutesPerLesson = benefits?.find((benefit) => benefit.referenceKey === product?.referenceKey)?.creditAmount;

    /* if (!minutesPerLesson) {
        throw new Error("Ce produit n'ajoute pas de crédits de leçon");
    } */

    const previousPurchasedLessons = totalPurchasedMinutes / (minutesPerLesson || 1);

    if (parseInt(quantity) > product.maxQuantity || parseInt(quantity) < 1) {
        throw new Error("Invalid quantity");
    }

    const pricingDetails = getProductData(product, parseInt(quantity), previousPurchasedLessons, currency);
    return { pricingDetails, productInfos };
};
