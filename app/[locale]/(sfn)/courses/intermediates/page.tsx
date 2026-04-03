//import { previewData } from "next/headers";
//import PreviewSuspense from "../../../components/sanity/PreviewSuspense";
//import PreviewBlogListe from "../../../components/sanity/PreviewBlogList";

import { SlideFromBottom, SlideFromLeft, SlideFromRight, SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import { LastComments } from "@/app/components/sfn/courses/LastComments";
import Image from "next/image";
import { MdOndemandVideo } from "react-icons/md";
import { IoDocumentTextOutline } from "react-icons/io5";
import { RiFolderDownloadLine } from "react-icons/ri";
import { HiOutlineDevicePhoneMobile } from "react-icons/hi2";
import { BsInfinity, BsTrophy } from "react-icons/bs";
import Link from "next-intl/link";
import { CourseRatings } from "@/app/components/sfn/courses/CourseRatings";
import LinkArrow from "@/app/components/common/LinkArrow";
import { useLocale, useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import CoursesOtherChoices from "@/app/components/sfn/courses/CoursesOtherChoices";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { FidePackSommaire, getPackSommaire } from "@/app/serverActions/productActions";
import { Locale } from "@/i18n";
import { HeroData, buildHeroData } from "../../fide/dashboard/components/dashboardUtils";
import { client } from "@/app/lib/sanity.client";
import { FRENCH_USER_PROGRESS_QUERY } from "@/app/lib/groqQueries";
import { Progress } from "@/app/types/sfn/auth";
import { CoursesAccordionClient } from "../../fide/components/CoursesAccordionClient";
import { getAmount } from "@/app/serverActions/stripeActions";
import { PricingDetails, ProductFetch } from "@/app/types/sfn/stripe";
import { groq } from "next-sanity";

const COURSE_ID = "4931486";
const PRODUCT_REFERENCE_KEY = "udemy_course_intermediate";
const CHECKOUT_URL = `/checkout/udemy_course_intermediate?quantity=1&callbackUrl=${encodeURIComponent("/courses/intermediates")}&currency=EUR`;
const queryProduct = groq`
    *[_type=='product' && referenceKey == $referenceKey][0]
`;

export default async function IntermediatesPage({ params: { locale } }: { params: { locale: Locale } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id ?? null;
    const hasIntermediateCourse = !!session?.user?.permissions?.some((p) => p.referenceKey === "udemy_course_intermediate");

    const [frenchIntermediateSommaire, frenchIntermediateUserProgress, product] = await Promise.all([
        getPackSommaire(locale, "udemy_course_intermediate"),
        userId ? client.fetch<Progress>(FRENCH_USER_PROGRESS_QUERY, { userId, courseKey: "udemy_course_intermediate" }) : Promise.resolve(null),
        client.fetch<ProductFetch>(queryProduct, { referenceKey: PRODUCT_REFERENCE_KEY }),
    ]);

    const hero = buildHeroData(frenchIntermediateUserProgress, frenchIntermediateSommaire, []);
    let pricingDetails: PricingDetails | null = null;
    if (product) {
        try {
            const { pricingDetails: pricing } = await getAmount(product, "1", "EUR", undefined);
            pricingDetails = pricing;
        } catch (error) {
            console.error("Failed to load pricing details:", error);
        }
    }

    return (
        <IntermediatesPageNoAsync
            hero={hero}
            locale={locale}
            hasIntermediateCourse={hasIntermediateCourse}
            frenchIntermediateSommaire={frenchIntermediateSommaire}
            pricingDetails={pricingDetails}
        />
    );
}

function IntermediatesPageNoAsync({
    hero,
    locale,
    hasIntermediateCourse,
    frenchIntermediateSommaire,
    pricingDetails,
}: {
    hero: HeroData;
    locale: Locale;
    hasIntermediateCourse: boolean;
    frenchIntermediateSommaire: FidePackSommaire;
    pricingDetails: PricingDetails | null;
}) {
    const t = useTranslations("Courses.Intermediates.PrimaryPage");
    const tLastCom = useTranslations("Courses.Intermediates.LastComments");
    const baseNumbers = {
        subscribers: 1500,
        rating: 0,
        reviews: 100,
    };
    const tLastComments = {
        title: tLastCom.rich("title", intelRich()),
        description: tLastCom("description"),
        buyNow: tLastCom("buyNow"),
        continue: tLastCom("continue"),
    };

    const renderPricingCallout = (align: "left" | "center", className?: string) => {
        if (hasIntermediateCourse || !pricingDetails) return null;
        return <PricingCallout pricingDetails={pricingDetails} locale={locale} align={align} className={className} />;
    };

    return (
        <div className="page-wrapper">
            <section className="section hero v5 wf-section !pb-0">
                <div className="container-default w-container">
                    <div className="inner-container _920px center">
                        <div className="inner-container _700px---tablet center">
                            <div className="inner-container _600px---mbl center">
                                <div data-w-id="fdb28f9a-b843-42ff-6712-94a9cd3389a9" className="text-center mg-bottom-40px">
                                    <h1 className="display-1 mb-4">{t.rich("title", intelRich())}</h1>
                                    <div className="inner-container _500px---mbl center">{t("description")}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div data-w-id="57239c1c-abea-04c2-40ac-578156c65de2" className="cms-featured-image-wrapper mb-8 md:mb-12">
                        <div className="image-wrapper border-radius-30px">
                            <Image width={1186} height={667.67} src="/images/cours2.jpg" loading="eager" alt="the first course" className="image" />
                        </div>
                    </div>
                    <CourseRatings courseIds={[COURSE_ID]} baseNumbers={baseNumbers} isUdemy={false} />
                </div>
            </section>
            <div className="flex flex-col items-center justify-center w-full my-24 md:my-36">
                <YouLearn />
            </div>
            <div className="section pd-bottom-92px pd-top-0 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _700px---tablet center">
                        <div className="inner-container _600px---mbl center">
                            <div className="grid-2-columns post-rigth-sidebar gap-48px items-start">
                                <div id="w-node-_37753ff7-31f0-69be-55cd-ec34f268f026-7a543d63" className="col-span-2 lg:col-span-1 order-2 lg:order-1 mt-24 lg:mt-0">
                                    <Description hasIntermediateCourse={hasIntermediateCourse} frenchIntermediateSommaire={frenchIntermediateSommaire} hero={hero} />
                                </div>
                                <div id="w-node-_5477c579-dd4f-3f5a-c700-1cd0a30d540b-7a543d63" className="lg:sticky lg:top-11 col-span-2 lg:col-span-1 order-1 lg:order-2 overflow-hidden">
                                    <SlideFromRight>
                                        <Infos hasIntermediateCourse={hasIntermediateCourse} pricingSlot={renderPricingCallout("left", "mb-3")} />
                                    </SlideFromRight>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <IsForYou hasIntermediateCourse={hasIntermediateCourse} pricingSlot={renderPricingCallout("left", "mt-4 mb-3")} />
            <LastComments
                courseId={COURSE_ID}
                locale={locale}
                t={tLastComments}
                courseUrl={CHECKOUT_URL}
                hasCourse={hasIntermediateCourse}
                udemyCourseUrl="https://www.udemy.com/course/the-complete-french-course-learn-french-low-intermediate/"
                ctaExtra={renderPricingCallout("center", "mb-4")}
            />
            <CoursesOtherChoices courseUrl={"/courses/intermediates"} courseRef="Intermediates" />
        </div>
    );
}

const YouLearn = () => {
    const t = useTranslations("Courses.Intermediates.YouLearn");
    return (
        <div className="container-default w-container">
            <div className="flex flex-col items-center max-w-4xl">
                <SlideFromBottom>
                    <h2 className="display-3 mb-4 sm:mb-8 w-full text-center">{t.rich("title", intelRich())}</h2>
                </SlideFromBottom>
                <div className="grid grid-cols-2 md:gap-8">
                    <div className="col-span-2 md:col-span-1">
                        <SlideInOneByOneParent>
                            <div className="flex flex-col gap-4 md:gap-8">
                                <SlideInOneByOneChild>
                                    <div className="mg-bottom-12px">
                                        <div className="flex-horizontal align-top---justify-left gap-16px">
                                            <div className="bullet bg-secondary-4 white mt-2"></div>
                                            <p className="mg-bottom-0">{t.rich("learn1", intelRich())}</p>
                                        </div>
                                    </div>
                                </SlideInOneByOneChild>
                                <SlideInOneByOneChild>
                                    <div className="mg-bottom-12px">
                                        <div className="flex-horizontal align-top---justify-left gap-16px">
                                            <div className="bullet bg-secondary-4 white mt-2"></div>
                                            <p className=" mg-bottom-0">{t.rich("learn2", intelRich())}</p>
                                        </div>
                                    </div>
                                </SlideInOneByOneChild>
                                <SlideInOneByOneChild>
                                    <div>
                                        <div className="flex-horizontal align-top---justify-left gap-16px">
                                            <div className="bullet bg-secondary-4 white mt-2"></div>
                                            <p className=" mg-bottom-0">{t.rich("learn3", intelRich())}</p>
                                        </div>
                                    </div>
                                </SlideInOneByOneChild>
                            </div>
                        </SlideInOneByOneParent>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <SlideInOneByOneParent>
                            <div className="mg-bottom-40px">
                                <SlideInOneByOneChild>
                                    <div className="mg-bottom-12px">
                                        <div className="flex-horizontal align-top---justify-left gap-16px">
                                            <div className="bullet bg-secondary-4 white mt-2"></div>
                                            <p className=" mg-bottom-0">{t.rich("learn4", intelRich())}</p>
                                        </div>
                                    </div>
                                </SlideInOneByOneChild>
                                <SlideInOneByOneChild>
                                    <div className="mg-bottom-12px">
                                        <div className="flex-horizontal align-top---justify-left gap-16px">
                                            <div className="bullet bg-secondary-4 white mt-2"></div>
                                            <p className=" mg-bottom-0">{t.rich("learn5", intelRich())}</p>
                                        </div>
                                    </div>
                                </SlideInOneByOneChild>
                                <SlideInOneByOneChild>
                                    <div>
                                        <div className="flex-horizontal align-top---justify-left gap-16px">
                                            <div className="bullet bg-secondary-4 white mt-2"></div>
                                            <p className="mg-bottom-0">{t.rich("learn6", intelRich())}</p>
                                        </div>
                                    </div>
                                </SlideInOneByOneChild>
                            </div>
                        </SlideInOneByOneParent>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PricingCallout = ({
    pricingDetails,
    locale,
    align,
    className,
}: {
    pricingDetails: PricingDetails;
    locale: Locale;
    align: "left" | "center";
    className?: string;
}) => {
    const t = useTranslations("Courses.Intermediates.Pricing");
    const formatAmount = (value: number) => {
        const normalized = Math.round(value * 100) / 100;
        const hasCents = Math.abs(normalized % 1) > 0;
        return new Intl.NumberFormat(locale === "fr" ? "fr-CH" : "en-US", {
            minimumFractionDigits: hasCents ? 2 : 0,
            maximumFractionDigits: hasCents ? 2 : 0,
        }).format(normalized);
    };
    const formatPrice = (value: number) => {
        const symbol = pricingDetails.currency === "EUR" ? "€" : pricingDetails.currency === "USD" ? "$" : "CHF";
        return `${formatAmount(value)} ${symbol}`;
    };

    const hasDiscount = pricingDetails.amount < pricingDetails.initialAmount;
    const discountAmount = pricingDetails.initialAmount - pricingDetails.amount;
    const isPercentage = pricingDetails.discountType === "percentage" && typeof pricingDetails.discountValue === "number";
    const discountBadge = hasDiscount
        ? isPercentage
            ? t("savePercent", { percent: pricingDetails.discountValue })
            : t("saveAmount", { amount: formatPrice(discountAmount) })
        : null;

    const alignText = align === "center" ? "text-center" : "text-left";
    const alignRow = align === "center" ? "justify-center" : "justify-start";

    return (
        <div className={`${alignText} ${className || ""}`.trim()}>
            {hasDiscount && <div className="text-xs uppercase tracking-[0.12em] text-secondary-4 font-extrabold">{t("offerLabel")}</div>}
            <div className={`${hasDiscount ? "mt-2" : "mt-0"} flex flex-wrap items-baseline gap-x-3 ${alignRow}`}>
                <span className="text-4xl sm:text-5xl font-extrabold">{formatPrice(pricingDetails.amount)}</span>
                {hasDiscount && <span className="text-base sm:text-lg text-neutral-500 line-through">{formatPrice(pricingDetails.initialAmount)}</span>}
                {discountBadge && (
                    <span className="inline-flex rounded-full bg-secondary-4/10 text-sm font-semibold text-secondary-4">{discountBadge}</span>
                )}
            </div>
        </div>
    );
};

const Description = ({ hasIntermediateCourse, frenchIntermediateSommaire, hero }: { hasIntermediateCourse: boolean; frenchIntermediateSommaire: FidePackSommaire; hero: HeroData }) => {
    const t = useTranslations("Courses.Intermediates.Description");
    const defaultModuleKeyIndex = frenchIntermediateSommaire?.packages[0]?.modules.findIndex((mod) => mod.posts.some((p) => p._id === hero.video?.main?.postId)) ?? 0;
    return (
        <div data-w-id="373dab4e-675b-8306-ad45-ad12f418b14c" className="rich-text-v2 w-richtext">
            <SlideFromBottom>
                <p>
                    {t.rich("para1", intelRich())} <LinkArrow url="https://www.startfrenchnow.com/courses/intermediates/">ici</LinkArrow>
                </p>
            </SlideFromBottom>
            <SlideFromBottom>
                <div>
                    <h2 className="display-3 mb-4 mt-4 sm:mt-8">{t.rich("header1", intelRich())}</h2>
                    <ul>
                        <li>{t("listItem1")}</li>
                        <li>{t("listItem2")}</li>
                        <li>{t("listItem3")}</li>
                        <li>{t("listItem4")}</li>
                    </ul>
                </div>
            </SlideFromBottom>
            <SlideFromBottom>
                <div>
                    <h2 className="display-3 mb-4 mt-4 sm:mt-8">{t.rich("header2", intelRich())}</h2>
                    <p>{t.rich("para2", intelRich())}</p>
                    <p>{t("para3")}</p>
                    <p>{t.rich("para4", intelRich())}</p>
                </div>
            </SlideFromBottom>
            <SlideFromBottom>
                <h2 className="display-3 mb-4 mt-4 sm:mt-8">{t.rich("header3", intelRich())}</h2>
            </SlideFromBottom>

            <CoursesAccordionClient
                fidePackSommaire={frenchIntermediateSommaire}
                hasPack={hasIntermediateCourse}
                expandAll={false}
                defaultModuleKeyIndex={defaultModuleKeyIndex}
                currentPostSlug={hero.video?.main?.slug}
                linkPrefix="/courses/intermediates/"
            />
        </div>
    );
};

const Infos = ({ hasIntermediateCourse, pricingSlot }: { hasIntermediateCourse: boolean; pricingSlot?: React.ReactNode }) => {
    const t = useTranslations("Courses.Intermediates.Infos");
    return (
        <div data-w-id="58b3cf56-b90f-933e-2320-8780e9f6f100" className="card project-card p-4 sm:p-8">
            <h3 className="mg-bottom-32px underline">{t("header")}</h3>
            <p className="mb-3 flex items-center">
                <MdOndemandVideo className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t.rich("video", intelRich())}</span>
            </p>
            <p className="mb-3 flex items-center">
                <RiFolderDownloadLine className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t.rich("resources", intelRich())}</span>
            </p>
            <p className="mb-3 flex items-center">
                <HiOutlineDevicePhoneMobile className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t("accessMobileTV")}</span>
            </p>
            <p className="mb-4 flex items-center">
                <BsInfinity className="text-2xl mr-2 sm:mr-4 shrink-0" />
                <span>{t("unlimitedAccess")}</span>
            </p>
            {pricingSlot}
            <Link href={hasIntermediateCourse ? "/courses/dashboard" : CHECKOUT_URL} className="btn-primary full-width project-btn w-inline-block">
                <span className="line-rounded-icon link-icon-right"> {hasIntermediateCourse ? t("continue") : t("buyNow")}</span>
            </Link>
        </div>
    );
};

const IsForYou = ({ hasIntermediateCourse, pricingSlot }: { hasIntermediateCourse: boolean; pricingSlot?: React.ReactNode }) => {
    const t = useTranslations("Courses.Intermediates.IsForYou");
    return (
        <div className="section pd-top-150px---bottom-150px wf-section pt-0">
            <div className="container-default w-container">
                <div className="inner-container _700px---tablet center">
                    <div className="inner-container _600px---mbl center">
                        <div data-w-id="7d793e39-0063-6541-01fd-68629184b003" className="inner-container _630px center">
                            <div data-w-id="7d793e39-0063-6541-01fd-68629184b004" className="text-center mg-bottom-64px">
                                <SlideFromBottom>
                                    <div>
                                        <h2 className="display-3 display-2 mg-bottom-12px mb-4">{t.rich("title", intelRich())}</h2>
                                        <p>
                                            {t("description")} <LinkArrow url={"/contact"}>{t("help")}</LinkArrow>
                                        </p>
                                    </div>
                                </SlideFromBottom>
                            </div>
                        </div>
                        <div data-w-id="7d793e39-0063-6541-01fd-68629184b009" className="bg-neutral-800 card px-4 sm:px-8 lg:px-16 py-8 sm:py-12 lg:py-24" style={{ color: "var(--neutral-100)" }}>
                            <div className="w-layout-grid grid-1-column gap-y-12">
                                <div id="w-node-_4d54b44b-957c-7870-a34e-e78a701c8743-7a543d63">
                                    <div data-w-id="7d793e39-0063-6541-01fd-68629184b00c" className="w-layout-grid grid-2-columns text-left-default v2">
                                        <div id="w-node-dbdbe503-3091-d9cb-3241-b22c59d152da-7a543d63" className="inner-container _556px _100---tablet">
                                            <div className="mg-bottom--32px">
                                                <div className="rich-text-white w-richtext">
                                                    <SlideFromBottom>
                                                        <h2 className="display-3 mb-4" style={{ color: "var(--neutral-100)" }}>{t.rich("prerequisitesTitle", intelRich())}</h2>
                                                    </SlideFromBottom>
                                                    <SlideInOneByOneParent>
                                                        <div className="mg-bottom-40px">
                                                            <SlideInOneByOneChild>
                                                                <div className="mg-bottom-12px">
                                                                    <div className="flex-horizontal align-top---justify-left gap-16px">
                                                                        <div className="bullet bg-secondary-4 white mg-top-5px"></div>
                                                                        <p className="color-neutral-100 mg-bottom-0">{t("prerequisite1")}</p>
                                                                    </div>
                                                                </div>
                                                            </SlideInOneByOneChild>
                                                            <SlideInOneByOneChild>
                                                                <div className="mg-bottom-12px">
                                                                    <div className="flex-horizontal align-top---justify-left gap-16px">
                                                                        <div className="bullet bg-secondary-4 white mg-top-5px"></div>
                                                                        <p className="color-neutral-100 mg-bottom-0">{t("prerequisite2")}</p>
                                                                    </div>
                                                                </div>
                                                            </SlideInOneByOneChild>
                                                        </div>
                                                    </SlideInOneByOneParent>
                                                </div>
                                            </div>
                                            {pricingSlot}
                                            <SlideFromBottom>
                                                <Link
                                                    href={hasIntermediateCourse ? "/courses/dashboard" : CHECKOUT_URL}
                                                    className="btn-secondary full-width project-btn w-inline-block hover:bg-secondary-4"
                                                >
                                                    <span className="line-rounded-icon link-icon-right">{hasIntermediateCourse ? t("continue") : t("buyNow")}</span>
                                                </Link>
                                            </SlideFromBottom>
                                        </div>
                                        <div id="w-node-_5bb3ab87-9318-b7e8-6001-6380f57edcdf-7a543d63" className="inner-container _416px _100---tablet overflow-hidden">
                                            <SlideFromRight>
                                                <div className="image-wrapper overflow-hidden border-radius-30px">
                                                    <Image src="/images/imageCourse1-red.png" width={500} height={500} alt="brand identity" loading="eager" className="image" />
                                                </div>
                                            </SlideFromRight>
                                        </div>
                                    </div>
                                </div>
                                <div id="w-node-_9619ce7d-1b81-19ea-690e-4fb6b9f83929-7a543d63">
                                    <div data-w-id="7d793e39-0063-6541-01fd-68629184b01a" className="w-layout-grid grid-2-columns text-right-default v2">
                                        <div id="w-node-fba3c1f0-6c21-4124-f2de-8449bc89976e-7a543d63" className="inner-container _416px _100---tablet order-3 md:order-1 overflow-hidden">
                                            <SlideFromLeft>
                                                <div className="image-wrapper overflow-hidden border-radius-30px">
                                                    <Image src="/images/imageCourse2-red.png" width={500} height={500} alt="brand identity" loading="eager" className="image" />
                                                </div>
                                            </SlideFromLeft>
                                        </div>
                                        <div id="w-node-_65791f95-9510-3558-84dd-6a8f77a9870f-7a543d63" className="inner-container _556px _100---tablet order-1 md:order-3">
                                            <div id="w-node-_7d793e39-0063-6541-01fd-68629184b01d-7a543d63" className="mg-bottom--32px">
                                                <SlideFromBottom>
                                                    <div>
                                                        <h2 className="display-3 mb-4" style={{ color: "var(--neutral-100)" }}>{t.rich("levelTitle", intelRich())}</h2>
                                                        <p>{t.rich("levelDescription", intelRich())}</p>
                                                    </div>
                                                </SlideFromBottom>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
