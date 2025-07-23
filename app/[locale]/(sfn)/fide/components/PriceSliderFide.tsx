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
import Link from "next-intl/link";
import { groq } from "next-sanity";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaAngleRight, FaCheck, FaSpinner } from "react-icons/fa";

const PRICECATEGORIES = {
    en: {
        "fide-boost": {
            image: "/images/fide-booster.png",
            title: "FIDE",
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
            title: "FIDE",
            subtitle: "ESSENTIALS",
            description: (
                <p className="mb-0">
                    A comprehensive preparation to master both <b>exam scenarios</b> and <b>key topics</b>.
                </p>
            ),
            whatYouGet: "What we can do",
            features: ["Practice all FIDE scenarios", 'Expand "FIDE" vocabulary', "Boost your confidence", "Receive expert tips"],
            extrasTitle: "+ Exclusive FIDE resources",
            extras: [
                "Access to all A2 and B1 exam scenarios",
                <span key="en-1">
                    Access to <b>last month's</b> FIDE exam topics
                </span>,
            ],
            color: "2",
            buttonLabelSingular: "Buy {quantity} hour for ",
            buttonLabelPlural: "Buy {quantity} hours for ",
        },
        "fide-mastery": {
            image: "/images/fide-mastery.png",
            title: "FIDE",
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
            title: "FIDE",
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
            title: "FIDE",
            subtitle: "ESSENTIALS",
            description: (
                <p className="mb-0">
                    Une préparation complète pour maîtriser les <b>scénarios</b> et les <b>grands thèmes</b> de l'examen.
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
            extras: ["Accès aux scénarios A2-B1 de l'examen", "Accès à la liste des scénarios récents (mois en cours)"],
            color: "2",
            buttonLabelSingular: "Acheter {quantity} heure pour ",
            buttonLabelPlural: "Acheter {quantity} heures pour ",
        },
        "fide-mastery": {
            image: "/images/fide-mastery.png",
            title: "FIDE",
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
    es: {
        "fide-boost": {
            image: "/images/fide-booster.png",
            title: "FIDE",
            subtitle: "BOOST",
            description: (
                <p className="mb-0">
                    ¿Necesitas un <b>impulso de última hora</b> para sentirte completamente preparado para tu examen?
                </p>
            ),
            whatYouGet: "Lo que ofrecemos",
            features: ["Preparación rápida y enfocada", "Práctica de escenarios clave", "Aumenta tu confianza", "Recibe consejos de expertos"],
            extrasTitle: "¿Poco tiempo antes del examen?",
            extras: ["¡Reserva tu clase para mañana mismo!"],
            color: "1",
            buttonLabelSingular: "Compra {quantity} hora por ",
            buttonLabelPlural: "Compra {quantity} horas por ",
        },
        "fide-essentials": {
            image: "/images/fide-essentials.png",
            title: "FIDE",
            subtitle: "ESSENTIALS",
            description: (
                <p className="mb-0">
                    Una preparación completa para dominar tanto los <b>escenarios del examen</b> como los <b>temas clave</b>.
                </p>
            ),
            whatYouGet: "Lo que ofrecemos",
            features: ["Práctica de todos los escenarios FIDE", 'Ampliar el vocabulario "FIDE"', "Aumenta tu confianza", "Recibe consejos de expertos"],
            extrasTitle: "+ Recursos exclusivos para FIDE",
            extras: [
                "Acceso a todos los escenarios de examen A2 y B1",
                <span key="es-1">
                    Acceso a los <b>temas del examen del mes pasado</b>
                </span>,
            ],
            color: "2",
            buttonLabelSingular: "Compra {quantity} hora por ",
            buttonLabelPlural: "Compra {quantity} horas por ",
        },
        "fide-mastery": {
            image: "/images/fide-mastery.png",
            title: "FIDE",
            subtitle: "MASTERY",
            description: (
                <p className="mb-0">
                    Logra un <b>dominio completo</b> y <b>confianza</b> para el día del examen.
                </p>
            ),
            whatYouGet: "Lo que ofrecemos",
            features: ["Práctica de todos los escenarios FIDE", 'Ampliar el vocabulario "FIDE"', "Aumenta tu confianza", "Recibe consejos de expertos"],
            extrasTitle: "+ Recursos exclusivos para FIDE",
            extras: [
                "Acceso a todos los escenarios de examen A2 y B1",
                <span key="es-2">
                    Acceso a los <b>temas del examen del mes pasado</b>
                </span>,
                "Acceso gratuito a todos mis cursos en Udemy (50 horas de contenido, más de 100 audios)",
            ],
            color: "4",
            buttonLabelSingular: "Compra {quantity} hora por ",
            buttonLabelPlural: "Compra {quantity} horas por ",
        },
    },
    pt: {
        "fide-boost": {
            image: "/images/fide-booster.png",
            title: "FIDE",
            subtitle: "BOOST",
            description: (
                <p className="mb-0">
                    Precisa de um <b>impulso de última hora</b> para se sentir totalmente preparado para o exame?
                </p>
            ),
            whatYouGet: "O que oferecemos",
            features: ["Preparação rápida e direcionada", "Pratique cenários chave", "Ganhe confiança", "Receba dicas de especialistas"],
            extrasTitle: "Sem tempo antes do exame?",
            extras: ["Agende sua aula para amanhã mesmo!"],
            color: "1",
            buttonLabelSingular: "Compre {quantity} hora por ",
            buttonLabelPlural: "Compre {quantity} horas por ",
        },
        "fide-essentials": {
            image: "/images/fide-essentials.png",
            title: "FIDE",
            subtitle: "ESSENTIALS",
            description: (
                <p className="mb-0">
                    Uma preparação completa para dominar os <b>cenários do exame</b> e os <b>tópicos principais</b>.
                </p>
            ),
            whatYouGet: "O que oferecemos",
            features: ["Pratique todos os cenários FIDE", 'Amplie o vocabulário "FIDE"', "Ganhe confiança", "Receba dicas de especialistas"],
            extrasTitle: "+ Recursos exclusivos para FIDE",
            extras: [
                "Acesso a todos os cenários dos exames A2 e B1",
                <span key="pt-1">
                    Acesso aos <b>tópicos do exame do mês passado</b>
                </span>,
            ],
            color: "2",
            buttonLabelSingular: "Compre {quantity} hora por ",
            buttonLabelPlural: "Compre {quantity} horas por ",
        },
        "fide-mastery": {
            image: "/images/fide-mastery.png",
            title: "FIDE",
            subtitle: "MASTERY",
            description: (
                <p className="mb-0">
                    Alcance <b>domínio total</b> e <b>confiança</b> para o dia do exame.
                </p>
            ),
            whatYouGet: "O que oferecemos",
            features: ["Pratique todos os cenários FIDE", 'Amplie o vocabulário "FIDE"', "Ganhe confiança", "Receba dicas de especialistas"],
            extrasTitle: "+ Recursos exclusivos para FIDE",
            extras: [
                "Acesso a todos os cenários dos exames A2 e B1",
                <span key="pt-2">
                    Acesso aos <b>tópicos do exame do mês passado</b>
                </span>,
                "Acesso gratuito a todos os meus cursos no Udemy (50 horas de conteúdo, mais de 100 áudios)",
            ],
            color: "4",
            buttonLabelSingular: "Compre {quantity} hora por ",
            buttonLabelPlural: "Compre {quantity} horas por ",
        },
    },
    tr: {
        "fide-boost": {
            image: "/images/fide-booster.png",
            title: "FIDE",
            subtitle: "BOOST",
            description: (
                <p className="mb-0">
                    Sınava tamamen hazır hissetmek için <b>son dakika</b> bir desteğe mi ihtiyacınız var?
                </p>
            ),
            whatYouGet: "Neler sunuyoruz?",
            features: ["Hızlı ve hedefe yönelik hazırlık", "Ana senaryoları pratik yapın", "Kendinize güven kazanın", "Uzman ipuçları alın"],
            extrasTitle: "Sınav öncesinde zamanınız mı yok?",
            extras: ["Yarına dersinizi hemen ayırtın!"],
            color: "1",
            buttonLabelSingular: "{quantity} saat için satın alın ",
            buttonLabelPlural: "{quantity} saat için satın alın ",
        },
        "fide-essentials": {
            image: "/images/fide-essentials.png",
            title: "FIDE",
            subtitle: "ESSENTIALS",
            description: (
                <p className="mb-0">
                    Hem <b>sınav senaryolarını</b> hem de <b>temel konuları</b> ustalıkla öğrenmek için kapsamlı bir hazırlık.
                </p>
            ),
            whatYouGet: "Neler sunuyoruz?",
            features: ["Tüm FIDE senaryolarını pratik yapın", "FIDE kelime dağarcığınızı geliştirin", "Kendinize güven kazanın", "Uzman ipuçları alın"],
            extrasTitle: "+ Özel FIDE kaynakları",
            extras: [
                "A2 ve B1 sınav senaryolarına erişim",
                <span key="tr-1">
                    Geçen ayın <b>sınav konularına</b> erişim
                </span>,
            ],
            color: "2",
            buttonLabelSingular: "{quantity} saat için satın alın ",
            buttonLabelPlural: "{quantity} saat için satın alın ",
        },
        "fide-mastery": {
            image: "/images/fide-mastery.png",
            title: "FIDE",
            subtitle: "MASTERY",
            description: (
                <p className="mb-0">
                    Sınav gününe <b>tam hakimiyet</b> ve <b>güven</b> kazanın.
                </p>
            ),
            whatYouGet: "Neler sunuyoruz?",
            features: ["Tüm FIDE senaryolarını pratik yapın", "FIDE kelime dağarcığınızı geliştirin", "Kendinize güven kazanın", "Uzman ipuçları alın"],
            extrasTitle: "+ Özel FIDE kaynakları",
            extras: [
                "A2 ve B1 sınav senaryolarına erişim",
                <span key="tr-2">
                    Geçen ayın <b>sınav konularına</b> erişim
                </span>,
                "Tüm Udemy kurslarıma ücretsiz erişim (50 saatlik içerik, 100+ ses kaydı)",
            ],
            color: "4",
            buttonLabelSingular: "{quantity} saat için satın alın ",
            buttonLabelPlural: "{quantity} saat için satın alın ",
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
type PlanName = "fide-boost" | "fide-essentials" | "fide-mastery";

export default function PriceSliderFide({ locale }: { locale: Locale }) {
    const { data: session } = useSession();
    const [quantity, setQuantity] = useState<number>(6);
    const [previousPurchasedLessons, setPreviousPurchasedLessons] = useState<number>(0);
    const [product, setProduct] = useState<ProductFetch | null>(null);
    const [productData, setProductData] = useState<null | ProductData>(null);
    const max = product?.maxQuantity || 20;
    const min = product?.minQuantity || 1;
    const userId = session?.user._id;
    const t = useTranslations("PriceSliderFide");

    useEffect(() => {
        (async () => {
            if (userId) {
                const userPurchases = await getUserPurchases(userId, "Fide Preparation Class");
                setPreviousPurchasedLessons(toHours(userPurchases?.totalPurchasedMinutes || 0));
            }
        })();
    }, [session]);

    useEffect(() => {
        (async () => {
            const product: ProductFetch = await client.fetch(groq`*[_type == "product" && referenceKey == $referenceKey][0]`, { referenceKey: "Fide Preparation Class" });
            setProduct(product);
        })();
    }, []);

    useEffect(() => {
        if (!product) return;
        const pricingDetails = getProductData(product, quantity, previousPurchasedLessons, "CHF");
        const planName = (pricingDetails?.planName || "fide-booster") as PlanName;
        const categoryData = PRICECATEGORIES[locale as keyof typeof PRICECATEGORIES][planName];
        setProductData({ ...categoryData, ...pricingDetails });
    }, [product, quantity]);

    const handleChange = (val: number[]) => {
        setQuantity(val[0]); // Le slider retourne un tableau, on prend la première valeur
    };

    const hours = {
        single: t("slider.hours.single"),
        plural: t("slider.hours.plural"),
    };

    return (
        <>
            <div id="priceSliderFide" className="max-w-5xl m-auto py-24 px-4 lg:px-8 flex flex-col items-center w-full gap-4">
                <SlideFromBottom>
                    <h2 className="display-2 w-full text-center mb-0">{t.rich("title", intelRich())}</h2>
                </SlideFromBottom>
                {previousPurchasedLessons ? (
                    <p className="mb-0 max-w-3xl text-center">
                        {t("purchasedLessons1")}
                        <span className="font-bold underline">
                            {previousPurchasedLessons} {previousPurchasedLessons > 1 ? t("purchasedLessonsHours") : t("purchasedLessonsHour")}
                        </span>{" "}
                        {t("purchasedLessons2")}.
                    </p>
                ) : session ? (
                    <p className="mb-0 max-w-3xl text-center">{t("session")}</p>
                ) : (
                    <p className="mb-0 max-w-3xl text-center">
                        {t("notConnected")}
                        <LinkArrow url="/auth/signIn?callbackUrl=/fide#priceSliderFide" className="inline-block">
                            {t("connectLink")}
                        </LinkArrow>
                    </p>
                )}
                <div className="relative w-full max-w-3xl mt-20">
                    <div className="w-full">
                        <Slider
                            defaultValue={[quantity]}
                            max={max}
                            min={min}
                            step={1}
                            onValueChange={handleChange}
                            value={[quantity]}
                            displayValue={true}
                            color={`secondary-${productData?.color}`}
                            hours={hours}
                        />
                    </div>
                </div>
                <div className="w-full max-w-3xl mt-6 mb-12">
                    {productData ? (
                        <SlideFromBottom>
                            <PriceCategory productData={productData} quantity={quantity} slug={product?.slug.current} />
                        </SlideFromBottom>
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
}

const PriceCategory = ({ productData, quantity, slug }: PriceCategoryProps) => {
    const { image, title, subtitle, description, features, extras, color, amount, unitPrice, whatYouGet, extrasTitle, buttonLabelPlural, buttonLabelSingular, initialUnitPrice, initialAmount } =
        productData;
    const bgColor = `bg-secondary-${color}`;
    const textColor = `text-${color}`;
    const isDiscounted = initialUnitPrice !== unitPrice;
    const t = useTranslations("PriceSliderFide");

    return (
        <div className="card grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2 relative">
            {isDiscounted && (
                <div className={cn("new-banner py-1", bgColor)} style={{ border: "solid 1px black", boxShadow: "3px 3px 0px 0px var(--neutral-800)" }}>
                    - {Math.abs(amount - initialAmount)}.- CHF
                </div>
            )}
            <div className="flex flex-col gap-4 lg:gap-8 p-4 md:p-8">
                <div className="flex gap-4 w-full">
                    <div className={cn("p-4 rounded-xl", bgColor)}>
                        <Image className="h-14 w-14 object-contain" src={image} alt={"image du cours"} height={150} width={150} />
                    </div>
                    <div>
                        <p className="mb-0 text-4xl font-bold">{title}</p>
                        <p className="mb-0 text-4xl font-bold w-full text-center">{subtitle}</p>
                    </div>
                </div>
                <div className="md:min-h-[100px]">{description}</div>
                <p className="mb-0 text-5xl font-bold">
                    CHF {unitPrice}.-<span className="text-2xl font-thin">/{t("purchasedLessonsHour")}</span>
                </p>
                <Link href={`/checkout/${slug}?quantity=${quantity}&callbackUrl=/fide`} className="btn btn-primary p-4 min-h-[76px] flex items-center">
                    <div>
                        {quantity > 1 ? buttonLabelPlural.replace("{quantity}", quantity.toString()) : buttonLabelSingular.replace("{quantity}", quantity.toString())}
                        <span className={cn("underline underline-offset-4", `decoration-secondary-${color}`)} style={{ whiteSpace: "nowrap" }}>
                            CHF {amount}.-
                        </span>
                    </div>
                </Link>
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
