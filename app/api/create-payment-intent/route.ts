import { applyDiscountToAmount, roundCurrency } from "@/app/lib/pricing";
import { convertToSubcurrency } from "@/app/lib/utils";
import { getAmount } from "@/app/serverActions/stripeActions";
import { CouponFeedback, CurrencyCode, DiscountRounding, DiscountType, PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { groq } from "next-sanity";
import { getUserPurchases } from "@/app/serverActions/productActions";

if (process.env.STRIPE_SECRET_KEY === undefined) {
    throw new Error("STRIPE_SECRET_KEY is not defined");
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-09-30.acacia",
});

const queryUser = `*[_type == "user" && email == $sessionEmail][0] { stripeCustomerId, _id, alias }`;

const queryProduct = groq`
        *[_type=='product' && slug.current == $slug][0] 
    `;

const queryUserIdByEmail = groq`
    *[_type == "user" && lower(email) == $email][0]{
        _id
    }
`;

const queryMockExamPurchaseSnapshot = groq`
    *[_type == "user" && _id == $userId][0]{
        "remainingCredits": coalesce(credits[referenceKey == "mock_exam"][0].remainingCredits, 0),
        "ownedCompilations": count(examCompilations)
    }
`;

const queryActiveMockExamCompilationCount = groq`
    count(*[_type == "examCompilation" && isActive == true])
`;

const queryCouponByCode = groq`
    *[_type == "coupon" && lower(code) == $code][0]{
        _id,
        code,
        isActive,
        maxUsesPerUser,
        maxUsesGlobal,
        validFrom,
        validUntil,
        "assignedUserIds": assignedUsers[]._ref,
        "legacyAssignedUserId": assignedUser._ref,
        rules[]{
            discountType,
            discountValue,
            stackable,
            discountValuesByCurrency{
                eur,
                usd,
                chf
            },
            rounding,
            "productIds": products[]->_id
        }
    }
`;

const queryCouponGlobalUsageCount = groq`
    count(*[_type == "couponRedemption" && status == "consumed" && couponRef._ref == $couponId])
`;

const queryCouponUsageCountByUser = groq`
    count(*[_type == "couponRedemption" && status == "consumed" && couponRef._ref == $couponId && userRef._ref == $userId])
`;

const queryCouponUsageCountByEmail = groq`
    count(*[_type == "couponRedemption" && status == "consumed" && couponRef._ref == $couponId && lower(userEmail) == $email])
`;

type CouponLocale = "fr" | "en";

type CouponCurrencyValues = {
    eur?: number;
    usd?: number;
    chf?: number;
};

type CouponRule = {
    discountType?: DiscountType;
    discountValue?: number;
    stackable?: boolean;
    discountValuesByCurrency?: CouponCurrencyValues;
    rounding?: DiscountRounding;
    productIds?: string[];
};

type CouponDocument = {
    _id: string;
    code?: string;
    isActive?: boolean;
    maxUsesPerUser?: number;
    maxUsesGlobal?: number;
    validFrom?: string;
    validUntil?: string;
    assignedUserIds?: string[];
    legacyAssignedUserId?: string;
    rules?: CouponRule[];
};

const couponMessages = {
    fr: {
        invalid: "Ce code coupon est invalide.",
        inactive: "Ce coupon est désactivé.",
        notStarted: "Ce coupon n'est pas encore actif.",
        expired: "Ce coupon a expiré.",
        requiresLogin: "Ce coupon est réservé à un compte précis. Connectez-vous avec le bon compte.",
        wrongUser: "Ce coupon est réservé à un autre utilisateur.",
        missingIdentity: "Renseignez un email valide pour utiliser ce coupon.",
        maxGlobalReached: "Ce coupon n'est plus disponible.",
        maxPerUserReached: "Vous avez déjà atteint la limite d'utilisation de ce coupon.",
        noProductRule: "Ce coupon n'est pas valable pour ce produit.",
        missingCurrency: "Ce coupon n'est pas disponible pour cette devise.",
        noBenefit: "Ce coupon n'apporte pas de réduction supplémentaire.",
        notBetter: "Coupon insuffisant: la réduction produit actuelle est plus avantageuse.",
        applied: "Coupon appliqué.",
    },
    en: {
        invalid: "This coupon code is invalid.",
        inactive: "This coupon is disabled.",
        notStarted: "This coupon is not active yet.",
        expired: "This coupon has expired.",
        requiresLogin: "This coupon is tied to a specific account. Sign in with the right account.",
        wrongUser: "This coupon is tied to another user.",
        missingIdentity: "Please provide a valid email to use this coupon.",
        maxGlobalReached: "This coupon is no longer available.",
        maxPerUserReached: "You have reached this coupon usage limit.",
        noProductRule: "This coupon does not apply to this product.",
        missingCurrency: "This coupon is not available for this currency.",
        noBenefit: "This coupon does not provide additional savings.",
        notBetter: "Coupon not applied: current product discount is already better.",
        applied: "Coupon applied.",
    },
} as const;

function normalizeCouponCode(raw: unknown): string {
    return String(raw || "")
        .trim()
        .toUpperCase();
}

function getCouponMessage(locale: CouponLocale, key: keyof typeof couponMessages["fr"]): string {
    return couponMessages[locale][key];
}

function resolveCouponDiscountValue(rule: CouponRule, currency: CurrencyCode): number | null {
    if (!rule.discountType) return null;

    if (rule.discountType === "percentage") {
        return typeof rule.discountValue === "number" ? rule.discountValue : null;
    }

    const values = rule.discountValuesByCurrency;
    if (!values) return null;

    const map: Record<CurrencyCode, number | undefined> = {
        EUR: values.eur,
        USD: values.usd,
        CHF: values.chf,
    };

    const amount = map[currency];
    return typeof amount === "number" ? amount : null;
}

function withCouponFeedback(pricingDetails: PricingDetails, couponFeedback: CouponFeedback): PricingDetails {
    return {
        ...pricingDetails,
        couponFeedback,
    };
}

async function evaluateCouponForPricing({
    couponCode,
    locale,
    userId,
    effectiveEmail,
    productId,
    currency,
    quantity,
    pricingDetails,
}: {
    couponCode?: string;
    locale: CouponLocale;
    userId?: string;
    effectiveEmail?: string;
    productId?: string;
    currency: CurrencyCode;
    quantity: number;
    pricingDetails: PricingDetails;
}): Promise<{ pricingDetails: PricingDetails; couponFeedback?: CouponFeedback; metadata: Record<string, string> }> {
    const normalizedCode = normalizeCouponCode(couponCode);
    if (!normalizedCode) {
        return { pricingDetails, couponFeedback: undefined, metadata: {} };
    }

    const reject = (key: keyof typeof couponMessages["fr"]): { pricingDetails: PricingDetails; couponFeedback: CouponFeedback; metadata: Record<string, string> } => {
        const couponFeedback: CouponFeedback = {
            code: normalizedCode,
            status: "rejected",
            message: getCouponMessage(locale, key),
        };
        return {
            pricingDetails: withCouponFeedback(pricingDetails, couponFeedback),
            couponFeedback,
            metadata: {},
        };
    };

    const coupon = await client.fetch<CouponDocument | null>(queryCouponByCode, { code: normalizedCode.toLowerCase() });
    if (!coupon?._id) {
        return reject("invalid");
    }

    if (coupon.isActive === false) {
        return reject("inactive");
    }

    const now = Date.now();
    if (coupon.validFrom && new Date(coupon.validFrom).getTime() > now) {
        return reject("notStarted");
    }
    if (coupon.validUntil && new Date(coupon.validUntil).getTime() < now) {
        return reject("expired");
    }

    const cleanUserId = String(userId || "").trim();
    const cleanEmail = String(effectiveEmail || "").trim().toLowerCase();

    const assignedUserIds = Array.from(
        new Set(
            [
                ...(Array.isArray(coupon.assignedUserIds) ? coupon.assignedUserIds : []),
                coupon.legacyAssignedUserId,
            ].filter((id): id is string => typeof id === "string" && id.trim().length > 0),
        ),
    );

    if (assignedUserIds.length > 0) {
        if (!cleanUserId) {
            return reject("requiresLogin");
        }
        if (!assignedUserIds.includes(cleanUserId)) {
            return reject("wrongUser");
        }
    }

    const maxUsesGlobal = Number(coupon.maxUsesGlobal);
    if (Number.isFinite(maxUsesGlobal) && maxUsesGlobal > 0) {
        const globalCount = Number(await client.fetch<number>(queryCouponGlobalUsageCount, { couponId: coupon._id }));
        if (globalCount >= maxUsesGlobal) {
            return reject("maxGlobalReached");
        }
    }

    const maxUsesPerUser = Number.isFinite(Number(coupon.maxUsesPerUser)) && Number(coupon.maxUsesPerUser) > 0 ? Number(coupon.maxUsesPerUser) : 1;
    if (maxUsesPerUser > 0) {
        if (!cleanUserId && !cleanEmail) {
            return reject("missingIdentity");
        }

        let userUsageCount = 0;
        if (cleanUserId) {
            userUsageCount = Number(await client.fetch<number>(queryCouponUsageCountByUser, { couponId: coupon._id, userId: cleanUserId }));
        } else {
            userUsageCount = Number(await client.fetch<number>(queryCouponUsageCountByEmail, { couponId: coupon._id, email: cleanEmail }));
        }

        if (userUsageCount >= maxUsesPerUser) {
            return reject("maxPerUserReached");
        }
    }

    if (!productId) {
        return reject("noProductRule");
    }

    const rules = Array.isArray(coupon.rules) ? coupon.rules : [];
    const matchedRuleIndex = rules.findIndex((rule) => Array.isArray(rule.productIds) && rule.productIds.includes(productId));
    if (matchedRuleIndex < 0) {
        return reject("noProductRule");
    }

    const matchedRule = rules[matchedRuleIndex];
    if (!matchedRule?.discountType) {
        return reject("invalid");
    }

    const resolvedDiscountValue = resolveCouponDiscountValue(matchedRule, currency);
    if (resolvedDiscountValue === null) {
        return reject("missingCurrency");
    }

    const rounding = matchedRule.rounding || "none";
    const baseAmount = pricingDetails.amount;

    if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
        return reject("invalid");
    }

    let finalAmount = baseAmount;
    if (matchedRule.stackable) {
        const computed = applyDiscountToAmount({
            amount: baseAmount,
            discountType: matchedRule.discountType,
            discountValue: resolvedDiscountValue,
            rounding,
        });

        if (computed.amount >= baseAmount) {
            return reject("noBenefit");
        }

        finalAmount = computed.amount;
    } else {
        const couponOnly = applyDiscountToAmount({
            amount: pricingDetails.initialAmount,
            discountType: matchedRule.discountType,
            discountValue: resolvedDiscountValue,
            rounding,
        });

        if (couponOnly.amount >= baseAmount) {
            return reject("notBetter");
        }

        finalAmount = couponOnly.amount;
    }

    const clampedFinalAmount = Math.max(roundCurrency(finalAmount), 0);
    const discountAmount = roundCurrency(baseAmount - clampedFinalAmount);

    if (discountAmount <= 0) {
        return reject("noBenefit");
    }

    const finalPricingDetails: PricingDetails = {
        ...pricingDetails,
        amountBeforeCoupon: baseAmount,
        amount: clampedFinalAmount,
        unitPrice: quantity > 0 ? roundCurrency(clampedFinalAmount / quantity) : pricingDetails.unitPrice,
        discountType: undefined,
        discountValue: undefined,
    };

    const couponFeedback: CouponFeedback = {
        code: coupon.code || normalizedCode,
        status: "applied",
        message: getCouponMessage(locale, "applied"),
        discountType: matchedRule.discountType,
        discountValue: resolvedDiscountValue,
        discountAmount,
        stackable: !!matchedRule.stackable,
    };

    const metadata: Record<string, string> = {
        couponId: coupon._id,
        couponCode: coupon.code || normalizedCode,
        couponRuleIndex: String(matchedRuleIndex),
        couponStackable: matchedRule.stackable ? "1" : "0",
        couponDiscountType: matchedRule.discountType,
        couponDiscountValue: String(resolvedDiscountValue),
        couponDiscountAmount: String(discountAmount),
        couponAmountBefore: String(baseAmount),
        couponAmountAfter: String(clampedFinalAmount),
    };

    return {
        pricingDetails: withCouponFeedback(finalPricingDetails, couponFeedback),
        couponFeedback,
        metadata,
    };
}

async function getOrCreateCustomer(sessionEmail: string): Promise<string> {
    const user = await client.fetch(queryUser, { sessionEmail });

    if (user && user.stripeCustomerId) {
        return user.stripeCustomerId;
    }

    // Crée un customer Stripe même si le user n'existe pas encore côté Sanity
    const customer = await stripe.customers.create({
        email: sessionEmail,
        ...(user?._id
            ? {
                  metadata: {
                      userId: user._id,
                  },
              }
            : {}),
    });

    // Patch uniquement si user existe
    if (user?._id) {
        await client.patch(user._id).set({ stripeCustomerId: customer.id }).commit();
    }

    return customer.id;
}

export async function POST(request: NextRequest) {
    try {
        const { productSlug, quantity, currency, email, sessionEmail, userId, locale, couponCode } = await request.json();

        // Email “effectif” : si pas de session (guest), on utilise l’email du form
        const effectiveEmail = (sessionEmail || email || "").trim().toLowerCase();

        const normalizedLocale = String(locale || "").trim().toLowerCase().startsWith("en") ? "en" : "fr";

        const product = (await client.fetch(queryProduct, { slug: productSlug })) as ProductFetch & { _id?: string };
        const requestedQuantity = Number.parseInt(String(quantity || "1"), 10) || 1;

        if (product?.referenceKey === "mock_exam") {
            const activeCompilationCount = Number(await client.fetch<number>(queryActiveMockExamCompilationCount));

            if (!Number.isFinite(activeCompilationCount) || activeCompilationCount <= 0) {
                return NextResponse.json({ error: "Aucun examen blanc n'est disponible pour le moment." }, { status: 409 });
            }

            let targetUserId = String(userId || "").trim();
            if (!targetUserId && effectiveEmail) {
                const existingUser = await client.fetch<{ _id?: string } | null>(queryUserIdByEmail, { email: effectiveEmail });
                targetUserId = String(existingUser?._id || "").trim();
            }

            if (targetUserId) {
                const snapshot = await client.fetch<{ remainingCredits?: number; ownedCompilations?: number } | null>(queryMockExamPurchaseSnapshot, { userId: targetUserId });
                const remainingCredits = Number(snapshot?.remainingCredits || 0);
                const ownedCompilations = Number(snapshot?.ownedCompilations || 0);

                if (remainingCredits > 0) {
                    return NextResponse.json({ error: "Vous avez déjà un crédit disponible. Utilisez-le avant un nouvel achat." }, { status: 409 });
                }

                const totalAfterPurchase = ownedCompilations + remainingCredits + requestedQuantity;
                if (totalAfterPurchase > activeCompilationCount) {
                    return NextResponse.json(
                        {
                            error: "Impossible d'acheter plus de crédits que le nombre de templates disponibles.",
                        },
                        { status: 409 }
                    );
                }
            } else if (requestedQuantity > activeCompilationCount) {
                return NextResponse.json({ error: "Impossible d'acheter plus de crédits que le nombre de templates disponibles." }, { status: 409 });
            }
        }

        // ✅ Guest-safe : si pas de userId, on considère “pas d’achats précédents”
        const userPurchasedLesson = userId ? ((await getUserPurchases(userId, product.referenceKey)) ?? undefined) : undefined;

        const { pricingDetails: productPricingDetails, productInfos } = await getAmount(product, quantity, currency, userPurchasedLesson);

        const { pricingDetails, couponFeedback, metadata: couponMetadata } = await evaluateCouponForPricing({
            couponCode,
            locale: normalizedLocale,
            userId: String(userId || "").trim() || undefined,
            effectiveEmail,
            productId: product?._id,
            currency: pricingDetailsCurrency(productPricingDetails.currency),
            quantity: requestedQuantity,
            pricingDetails: productPricingDetails,
        });

        const stripeCustomerId = effectiveEmail ? await getOrCreateCustomer(effectiveEmail) : undefined;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: convertToSubcurrency(pricingDetails.amount),
            currency: pricingDetails.currency,
            ...(effectiveEmail ? { receipt_email: effectiveEmail } : {}),
            ...(stripeCustomerId ? { customer: stripeCustomerId } : {}),
            automatic_payment_methods: { enabled: true },
            metadata: {
                productSlug,
                quantity,
                locale: normalizedLocale,
                ...(effectiveEmail ? { email: effectiveEmail } : {}),
                ...(userId ? { userId: String(userId) } : {}),
                ...couponMetadata,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            pricingDetails,
            productInfos,
            paymentIntentId: paymentIntent.id,
            couponFeedback: couponFeedback || null,
        });
    } catch (error) {
        console.error("Internal Error:", error);
        return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
    }
}

function pricingDetailsCurrency(currency: PricingDetails["currency"]): CurrencyCode {
    if (currency === "EUR" || currency === "USD" || currency === "CHF") {
        return currency;
    }
    return "CHF";
}
