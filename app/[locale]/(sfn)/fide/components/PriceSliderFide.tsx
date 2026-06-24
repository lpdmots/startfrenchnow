"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import LinkArrow from "@/app/components/common/LinkArrow";
import { Slider } from "@/app/components/common/Slider";
import { Separator } from "@/app/components/ui/separator";
import { intelRich } from "@/app/lib/intelRich";
import { client } from "@/app/lib/sanity.client";
import { cn } from "@/app/lib/schadcn-utils";
import { getProductData, toHours } from "@/app/lib/utils";
import { getUserPurchases } from "@/app/serverActions/productActions";
import { PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { Locale } from "@/i18n";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { groq } from "next-sanity";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaAngleRight, FaCheck, FaSpinner } from "react-icons/fa";

const PRICECATEGORIES = {
    en: {
        "fide-boost": {
            image: "/images/fide-booster.png",
            title: "TEST",
            subtitle: "BOOST",
            description: (
                <p className="mb-0">
                    Need a <b>last-minute</b> boost to feel fully prepared for your exam?
                </p>
            ),
            whatYouGet: "What we can do",
            features: ["Quick, targeted preparation", "Practice key scenarios", "Boost your confidence", "Receive expert tips"],
            extrasTitle: "No time before the exam?",
            extras: ["Book your class for tomorrow!"],
            color: "1",
            buttonLabelSingular: "Buy {quantity} hour for ",
            buttonLabelPlural: "Buy {quantity} hours for ",
        },
        "fide-essentials": {
            image: "/images/fide-essentials.png",
            title: "TEST",
            subtitle: "ESSENTIALS",
            description: (
                <p className="mb-0">
                    A complete preparation to master the <b>main themes</b> of the FIDE exam and practice <b>oral scenarios</b>.
                </p>
            ),
            whatYouGet: "What we can do",
            features: ["Master all the main themes of the FIDE exam", "Build and use vocabulary specific to the FIDE exam", "Boost your confidence", "Receive expert tips"],
            extrasTitle: "+ Exclusive resources",
            extras: [
                "Access to training scenarios: Speaking (A1 to B1)",
                "Access to training scenarios: Listening (A1 to B1)",
            ],
            color: "2",
            buttonLabelSingular: "Buy {quantity} hour for ",
            buttonLabelPlural: "Buy {quantity} hours for ",
        },
        "fide-mastery": {
            image: "/images/fide-mastery.png",
            title: "TEST",
            subtitle: "MASTERY",
            description: (
                <p className="mb-0">
                    Gain <b>complete mastery</b> and <b>confidence</b> for exam day.
                </p>
            ),
            whatYouGet: "What we can do",
            features: ["Practice all FIDE scenarios", 'Expand "FIDE" vocabulary', "Boost your confidence", "Receive expert tips"],
            extrasTitle: "+ Exclusive FIDE resources",
            extras: [
                "Access to all A2 and B1 exam scenarios",
                <span key="en-2">
                    Access to <b>last month's</b> FIDE exam topics
                </span>,
                "Free access to all my Udemy courses (50 hours of content, 100+ audios)",
            ],
            color: "4",
            buttonLabelSingular: "Buy {quantity} hour for ",
            buttonLabelPlural: "Buy {quantity} hours for ",
        },
    },
    fr: {
        "fide-boost": {
            image: "/images/fide-booster.png",
            title: "TEST",
            subtitle: "BOOST",
            description: (
                <p className="mb-0">
                    1 heure pour <b>booster</b> votre français et gagner en <b>confiance</b> avant l'examen.
                </p>
            ),
            whatYouGet: "Objectifs visés",
            features: ["Préparation rapide et ciblée", "Pratiquez 1 ou 2 scénarios clés", "Boostez votre confiance", "Recevez des conseils d'expert"],
            extrasTitle: "La date de l'examen est proche ?",
            extras: ["Réservez votre cours pour demain !"],
            color: "1",
            buttonLabelSingular: "Acheter {quantity} heure pour ",
            buttonLabelPlural: "Acheter {quantity} heures pour ",
        },
        "fide-essentials": {
            image: "/images/fide-essentials.png",
            title: "TEST",
            subtitle: "ESSENTIALS",
            description: (
                <p className="mb-0">
                    Une préparation complète pour maîtriser les grands thèmes de l'examen FIDE et pratiquer les scénarios oraux.
                </p>
            ),
            whatYouGet: "Objectifs visés",
            features: [
                "Maîtrisez tous les thèmes de l'examen FIDE.",
                "Élargissez et mettez en pratique le vocabulaire spécifique à l'examen FIDE.",
                "Abordez la partie orale avec confiance",
                "Recevez des conseils d'expert",
            ],
            extrasTitle: "+ Ressources exclusives",
            extras: ["Accès aux scénarios d'entraînement : Parler (A1 à B1)", "Accès aux scénarios d'entraînement : Écouter (A1 à B1)"],
            color: "2",
            buttonLabelSingular: "Acheter {quantity} heure pour ",
            buttonLabelPlural: "Acheter {quantity} heures pour ",
        },
        "fide-mastery": {
            image: "/images/fide-mastery.png",
            title: "TEST",
            subtitle: "MASTERY",
            description: (
                <p className="mb-0">
                    Pour une préparation <b>la plus complète</b> possible de l'examen FIDE.
                </p>
            ),
            whatYouGet: "Objectifs visés",
            features: [
                "Maîtrisez tous les scénarios et sujets récents",
                'Élargissez et mettez en pratique le vocabulaire "Fide"',
                "Abordez la partie orale avec confiance",
                "Recevez des conseils d'expert",
            ],
            extrasTitle: "+ Ressources exclusives FIDE",
            extras: ["Accès aux scénarios A2-B1 de l'examen", "Accès à la liste des scénarios récents (mois en cours)", "Accès gratuit à 50 heures de cours Udemy"],
            color: "4",
            buttonLabelSingular: "Acheter {quantity} heure pour ",
            buttonLabelPlural: "Acheter {quantity} heures pour ",
        },
    },
};

interface PriceCategory {
    image: string;
    title: string;
    subtitle: string;
    whatYouGet: string;
    description: JSX.Element;
    features: (string | JSX.Element)[];
    extrasTitle: string;
    extras: (string | JSX.Element)[];
    color: string;
    buttonLabelSingular: string;
    buttonLabelPlural: string;
}

type ProductData = PriceCategory & PricingDetails;
type PlanName = keyof (typeof PRICECATEGORIES)["en"];
const LOG_PREFIX = "[PriceSliderFide]";

const getFallbackCategory = (locale: Locale): PriceCategory => {
    const localeCategories = PRICECATEGORIES[locale as keyof typeof PRICECATEGORIES] ?? PRICECATEGORIES.en;
    console.log(`${LOG_PREFIX} getFallbackCategory`, {
        locale,
        availablePlans: Object.keys(localeCategories),
    });
    return localeCategories["fide-boost"];
};

const getCategoryDataForPlan = (locale: Locale, planName?: string): PriceCategory => {
    const localeCategories = PRICECATEGORIES[locale as keyof typeof PRICECATEGORIES] ?? PRICECATEGORIES.en;
    const normalizedPlanName = planName?.trim().toLowerCase();
    console.log(`${LOG_PREFIX} getCategoryDataForPlan:start`, {
        locale,
        rawPlanName: planName,
        normalizedPlanName,
        availablePlans: Object.keys(localeCategories),
    });

    if (normalizedPlanName && normalizedPlanName in localeCategories) {
        console.log(`${LOG_PREFIX} getCategoryDataForPlan:direct-match`, {
            locale,
            normalizedPlanName,
        });
        return localeCategories[normalizedPlanName as PlanName];
    }

    if (normalizedPlanName?.includes("boost")) {
        console.log(`${LOG_PREFIX} getCategoryDataForPlan:boost-fuzzy-match`, {
            locale,
            normalizedPlanName,
        });
        return localeCategories["fide-boost"];
    }

    if (normalizedPlanName?.includes("essential")) {
        console.log(`${LOG_PREFIX} getCategoryDataForPlan:essentials-fuzzy-match`, {
            locale,
            normalizedPlanName,
        });
        return localeCategories["fide-essentials"];
    }

    if (normalizedPlanName?.includes("master")) {
        console.log(`${LOG_PREFIX} getCategoryDataForPlan:mastery-fuzzy-match`, {
            locale,
            normalizedPlanName,
        });
        return localeCategories["fide-mastery"];
    }

    console.warn(`${LOG_PREFIX} getCategoryDataForPlan:fallback`, {
        locale,
        rawPlanName: planName,
        normalizedPlanName,
        availablePlans: Object.keys(localeCategories),
    });
    return getFallbackCategory(locale);
};

interface PriceSliderFideProps {
    locale: Locale;
    callbackPath?: string;
}

export default function PriceSliderFide({ locale, callbackPath = "/fide/private-courses#plans" }: PriceSliderFideProps) {
    const { data: session } = useSession();
    const [quantity, setQuantity] = useState<number>(7);
    const [previousPurchasedLessons, setPreviousPurchasedLessons] = useState<number | null>(null);
    const [product, setProduct] = useState<ProductFetch | null>(null);
    const [productData, setProductData] = useState<null | ProductData>(null);
    const userId = session?.user._id;
    const isLoggedIn = Boolean(userId);
    const t = useTranslations("Fide.PriceSliderFide");
    const purchasedLessons = previousPurchasedLessons ?? 0;
    const productMaxQuantity = product?.maxQuantity ?? 25;
    const remainingQuantity = Math.max(0, productMaxQuantity - purchasedLessons);
    const sliderMax = previousPurchasedLessons === null ? productMaxQuantity : remainingQuantity;
    const sliderMin = sliderMax === 0 ? 0 : isLoggedIn ? Math.max(product?.minQuantity ?? 1, 1) : 0;
    const safeQuantity = previousPurchasedLessons === null ? quantity : Math.min(Math.max(quantity, sliderMin), sliderMax);

    console.log(`${LOG_PREFIX} render`, {
        locale,
        callbackPath,
        sessionStatus: session ? "authenticated" : "anonymous",
        userId,
        quantity,
        safeQuantity,
        previousPurchasedLessons,
        purchasedLessons,
        productMaxQuantity,
        remainingQuantity,
        sliderMin,
        sliderMax,
        productSlug: product?.slug?.current,
        productLoaded: Boolean(product),
        productDataLoaded: Boolean(productData),
    });

    useEffect(() => {
        (async () => {
            console.log(`${LOG_PREFIX} purchases:fetch:start`, {
                userId,
            });
            if (userId) {
                const userPurchases = await getUserPurchases(userId, "Fide Preparation Class");
                console.log(`${LOG_PREFIX} purchases:fetch:success`, {
                    userId,
                    totalPurchasedMinutes: userPurchases?.totalPurchasedMinutes || 0,
                    totalPurchasedHours: toHours(userPurchases?.totalPurchasedMinutes || 0),
                    userPurchases,
                });
                setPreviousPurchasedLessons(toHours(userPurchases?.totalPurchasedMinutes || 0));
            } else {
                console.log(`${LOG_PREFIX} purchases:anonymous`, {
                    userId,
                });
                setPreviousPurchasedLessons(0);
            }
        })();
    }, [userId]);

    useEffect(() => {
        (async () => {
            const products: ProductFetch[] = await client.fetch(
                groq`*[_type == "product" && referenceKey == $referenceKey] | order(maxQuantity desc, _updatedAt desc)`,
                { referenceKey: "Fide Preparation Class" }
            );

            const product =
                products.find((candidate) => {
                    const hasVariableQuantity = (candidate?.maxQuantity || 0) > 1;
                    const hasMultiplePlans = (candidate?.pricingDetails || []).some((detail) => (detail?.plans || []).length > 1);
                    return hasVariableQuantity || hasMultiplePlans;
                }) || products[0] || null;

            console.log(`${LOG_PREFIX} product:fetch:success`, {
                productsFound: products.length,
                selectedProduct: product,
                allProducts: products.map((candidate) => ({
                    referenceKey: candidate?.referenceKey,
                    slug: candidate?.slug?.current,
                    minQuantity: candidate?.minQuantity,
                    maxQuantity: candidate?.maxQuantity,
                    planNames: candidate?.pricingDetails?.flatMap((detail) => (detail?.plans || []).map((plan) => plan?.name)) || [],
                })),
            });

            setProduct(product);
        })();
    }, []);

    useEffect(() => {
        if (!product || previousPurchasedLessons === null) return;

        setQuantity((currentQuantity) => {
            let nextQuantity = currentQuantity;
            if (remainingQuantity === 0) return 0;
            if (currentQuantity < sliderMin) nextQuantity = sliderMin;
            if (currentQuantity > sliderMax) nextQuantity = sliderMax;
            console.log(`${LOG_PREFIX} quantity:clamp`, {
                currentQuantity,
                nextQuantity,
                remainingQuantity,
                sliderMin,
                sliderMax,
            });
            return nextQuantity;
        });
    }, [product, previousPurchasedLessons, remainingQuantity, sliderMax, sliderMin]);

    useEffect(() => {
        if (!product || previousPurchasedLessons === null) return;
        const pricingDetails = getProductData(product, safeQuantity, previousPurchasedLessons, "CHF");
        const categoryData = getCategoryDataForPlan(locale, pricingDetails?.planName);
        console.log(`${LOG_PREFIX} pricing:computed`, {
            locale,
            safeQuantity,
            previousPurchasedLessons,
            pricingDetails,
            planName: pricingDetails?.planName,
            categoryData,
        });
        setProductData({ ...categoryData, ...pricingDetails });
    }, [locale, product, previousPurchasedLessons, safeQuantity]);

    const handleChange = (val: number[]) => {
        console.log(`${LOG_PREFIX} slider:onValueChange`, {
            previousQuantity: quantity,
            nextValue: val[0],
            rawValue: val,
        });
        setQuantity(val[0]); // Le slider retourne un tableau, on prend la première valeur
    };

    const hours = {
        single: t("slider.hours.single"),
        plural: t("slider.hours.plural"),
    };

    return (
        <>
            <div id="priceSliderFide" className="max-w-5xl m-auto pb-4 px-4 lg:px-8 flex flex-col items-center w-full gap-2">
                {/* <h3 className="w-full text-center mb-0 text-xl">{t.rich("title", intelRich())}</h3> */}
                {previousPurchasedLessons ? (
                    <p className="mb-0 text-center">
                        {t("purchasedLessons1")}
                        <span className="font-bold underline">
                            {previousPurchasedLessons} {previousPurchasedLessons > 1 ? t("purchasedLessonsHours") : t("purchasedLessonsHour")}
                        </span>{" "}
                        {t("purchasedLessons2")}.
                    </p>
                ) : session ? (
                    <p className="mb-0 text-center">{t("session")}</p>
                ) : (
                    <p className="mb-0 bs text-center">
                        {/* {t("notConnected")} */}
                        <LinkArrow url={`/auth/signIn?callbackUrl=${encodeURIComponent(callbackPath)}`} className="inline-block">
                            {t("connectLink")}
                        </LinkArrow>
                    </p>
                )}
                <div className="relative w-full max-w-3xl mt-20">
                    <div className="w-full">
                        <Slider
                            defaultValue={[quantity]}
                            max={sliderMax}
                            min={sliderMin}
                            step={1}
                            onValueChange={handleChange}
                            value={[quantity]}
                            displayValue={true}
                            color={`secondary-${productData?.color}`}
                            hours={hours}
                        />
                    </div>
                </div>
                <div className="w-full max-w-3xl mt-6 mb-6">
                    {productData ? (
                        <PriceCategory
                            productData={productData}
                            quantity={quantity}
                            slug={product?.slug.current}
                            callbackPath={callbackPath}
                            canCheckout={quantity >= 1 && Boolean(product?.slug.current)}
                            hasReachedMaximum={sliderMax === 0}
                        />
                    ) : (
                        <div className="flex flex-col justify-center items-center w-full gap-4">
                            <FaSpinner className="animate-spin text-neutral-400 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />
                            <p className="text-neutral-400">Chargement...</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

interface PriceCategoryProps {
    productData: ProductData;
    quantity: number;
    slug?: string;
    callbackPath: string;
    canCheckout: boolean;
    hasReachedMaximum: boolean;
}

const PriceCategory = ({ productData, quantity, slug, callbackPath, canCheckout, hasReachedMaximum }: PriceCategoryProps) => {
    const { image, title, subtitle, description, features, extras, color, amount, unitPrice, whatYouGet, extrasTitle, buttonLabelPlural, buttonLabelSingular, initialUnitPrice, initialAmount } =
        productData;
    const bgColor = `bg-secondary-${color}`;
    const textColor = `text-${color}`;
    const isDiscounted = initialUnitPrice !== unitPrice;
    const t = useTranslations("Fide.PriceSliderFide");
    const ctaLabel = quantity > 1 ? buttonLabelPlural : buttonLabelSingular;

    console.log(`${LOG_PREFIX} PriceCategory:render`, {
        slug,
        quantity,
        callbackPath,
        canCheckout,
        hasReachedMaximum,
        title,
        subtitle,
        color,
        unitPrice,
        amount,
        initialUnitPrice,
        initialAmount,
        ctaLabel,
        buttonLabelSingular,
        buttonLabelPlural,
        productData,
    });

    return (
        <div className="card grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2 relative">
            {isDiscounted && (
                <div className={cn("new-banner py-1", bgColor)} style={{ border: "solid 1px black", boxShadow: "3px 3px 0px 0px var(--neutral-800)" }}>
                    - {Math.abs(amount - initialAmount)}.- CHF
                </div>
            )}
            <div className="flex flex-col gap-4 lg:gap-8 p-4 md:p-8">
                <div className="flex gap-4 w-full">
                    <div className={cn("p-4 rounded-xl shrink-0", bgColor)}>
                        <Image className="h-14 w-14 object-contain" src={image} alt={"image du cours"} height={150} width={150} />
                    </div>
                    <div>
                        <p className="mb-0 text-3xl md:text-4xl font-bold">{title}</p>
                        <p className="mb-0 text-3xl md:text-4xl font-bold w-full text-center">{subtitle}</p>
                    </div>
                </div>
                <div className="md:min-h-[100px]">{description}</div>
                <p className="mb-0 text-5xl font-bold">
                    CHF {unitPrice}.-<span className="text-2xl font-thin">/{t("purchasedLessonsHour")}</span>
                </p>
                {canCheckout ? (
                    <Link href={`/checkout/${slug}?quantity=${quantity}&callbackUrl=${encodeURIComponent(callbackPath)}`} className="btn btn-primary p-4 min-h-[76px] flex items-center">
                        <div>
                            {ctaLabel ? ctaLabel.replace("{quantity}", quantity.toString()) : null}
                            <span className={cn("underline underline-offset-4", `decoration-secondary-${color}`)} style={{ whiteSpace: "nowrap" }}>
                                CHF {amount}.-
                            </span>
                        </div>
                    </Link>
                ) : (
                    <div className="btn btn-primary p-4 min-h-[76px] flex items-center justify-center pointer-events-none opacity-60">
                        <div>{hasReachedMaximum ? t("ctaMaxReached") : t("ctaChooseOneHour")}</div>
                    </div>
                )}
            </div>
            <div className={cn("h-full p-4 md:p-8 flex flex-col gap-4 justify-center bg-neutral-300")}>
                <div className="flex flex-col gap-2 grow justify-center">
                    <p className="mb-0 font-bold">{whatYouGet}</p>
                    {features.map((feature, index) => (
                        <React.Fragment key={index}>
                            <div className="grid grid-cols-6 gap-2">
                                <FaCheck className={cn("text-xl col-span-1", textColor)} />
                                <p className="col-span-5 mb-0 text-sm">{feature}</p>
                            </div>
                            {index !== features.length - 1 && <Separator />}
                        </React.Fragment>
                    ))}
                </div>
                <div className={cn("flex flex-col gap-2")}>
                    <p className="mb-0 font-bold">{extrasTitle}</p>
                    {extras.map((extra, index) => (
                        <div className="flex gap-2" key={index}>
                            <div className="max-h-6">
                                <FaAngleRight className="text-2xl min-w-6" />
                            </div>
                            <p className="mb-0 text-sm">{extra}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
