import { LESSONS_CREDITS_PERMISSIONS } from "@/app/lib/constantes";
import { Block, Image, Slug } from "./blog";

export interface PricingDetails {
    initialUnitPrice: number;
    unitPrice: number;
    amount: number;
    initialAmount: number;
    discountType?: "percentage" | "flatDiscount" | "newPrice";
    currency: "EUR" | "USD" | "CHF";
    currencies: ("EUR" | "USD" | "CHF")[];
    planName?: string;
}

export interface ProductFetch {
    referenceKey: (typeof LESSONS_CREDITS_PERMISSIONS)[number];
    title: MultiLangString;
    description: MultiLangString;
    slug: Slug;
    defaultLangage: "fr" | "en" | "es" | "pt" | "tr";
    maxQuantity: number;
    minQuantity: number;
    image: Image;
    paymentMode: "unique" | "subscription";
    pricingDetails: PricingDetailsFetch[];
    benefits: BenefitFetch[];
    onSuccessUrl: string;
}

export interface PricingDetailsFetch {
    originalPrice: number;
    currency: "EUR" | "USD" | "CHF";
    plans: Plan[];
}

export interface Plan {
    name: string;
    minimumQuantity: number;
    maximumQuantity: number;
    discount: Discount;
    isCountingPreviousPurchases: boolean;
}

export interface Discount {
    discountValue: number;
    discountType: "percentage" | "flatDiscount" | "newPrice";
    rounding: "round" | "none" | "decimal";
}

export interface BenefitFetch {
    benefitType: "lessons" | "credits" | "permission";
    referenceKey: (typeof LESSONS_CREDITS_PERMISSIONS)[number];
    creditAmount: number;
    accessDuration: number;
}

export interface ProductInfos {
    title: MultiLangString;
    description: MultiLangString;
    maxQuantity: number;
    image: Image;
    defaultLangage: "fr" | "en" | "es" | "pt" | "tr";
    onSuccessUrl: string;
}

export interface MultiLangString {
    fr: string;
    en: string;
    es: string;
    pt: string;
    tr: string;
}
