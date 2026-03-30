import { LESSONS_CREDITS_PERMISSIONS, PACKAGES_KEYS } from "@/app/lib/constantes";
import { Block, Image, Level, Reference, Slug } from "./blog";

export type CurrencyCode = "EUR" | "USD" | "CHF";
export type DiscountType = "percentage" | "flatDiscount" | "newPrice";
export type DiscountRounding = "round" | "none" | "decimal";

export interface CouponFeedback {
    code: string;
    status: "applied" | "rejected";
    message: string;
    discountType?: DiscountType;
    discountValue?: number;
    discountAmount?: number;
    stackable?: boolean;
}

export interface PricingDetails {
    initialUnitPrice: number;
    unitPrice: number;
    amount: number;
    initialAmount: number;
    discountType?: DiscountType;
    discountValue?: number;
    currency: CurrencyCode;
    currencies: CurrencyCode[];
    planName?: string;
    amountBeforeCoupon?: number;
    couponFeedback?: CouponFeedback;
}

export interface ProductFetch {
    referenceKey: (typeof LESSONS_CREDITS_PERMISSIONS)[number];
    title: MultiLangString;
    description: MultiLangString;
    slug: Slug;
    defaultLangage: "fr" | "en";
    maxQuantity: number;
    minQuantity: number;
    image: Image;
    paymentMode: "unique" | "subscription";
    pricingDetails: PricingDetailsFetch[];
    benefits: BenefitFetch[];
    onSuccessUrl: string;
    packages: ProductPackage[];
}

export type PackagesKey = (typeof PACKAGES_KEYS)[number];
export interface ProductPackage {
    title: string;
    title_en: string;
    referenceKey: PackagesKey;
    modules: PackageModule[];
}

export interface PackageModule {
    _key?: string;
    title: string;
    title_en: string;
    subtitle?: string;
    subtitle_en?: string;
    level?: Level[];
    posts: Reference[];
}

export interface PricingDetailsFetch {
    originalPrice: number;
    currency: CurrencyCode;
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
    discountType: DiscountType;
    rounding: DiscountRounding;
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
    defaultLangage: "fr" | "en";
    onSuccessUrl: string;
}

export interface MultiLangString {
    fr: string;
    en: string;
}
