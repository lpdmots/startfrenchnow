import { VideoFide } from "./VideoFide";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { intelRich } from "@/app/lib/intelRich";
import { BookFirstMeeting } from "./BookFirstMeeting";
import { FideCourseRatings } from "@/app/components/sfn/courses/FideCourseRatings";
import type { ReactNode } from "react";

type HeroFideProps = {
    showCtas?: boolean;
    headingTag?: "h1" | "h2";
    customTitle?: ReactNode;
    customProof?: ReactNode;
    sectionClassName?: string;
    headingSpanClassName?: string;
    centerBulletsVertically?: boolean;
    proofClassName?: string;
};

const heroFideRich = (headingSpanClassName: string) => {
    const rich = intelRich();
    const headingSpan = (chunks: ReactNode) => <span className={headingSpanClassName}>{chunks}</span>;
    return {
        ...rich,
        hs1: headingSpan,
        hs2: headingSpan,
        hs3: headingSpan,
        hs4: headingSpan,
        hs5: headingSpan,
        hs6: headingSpan,
    };
};

export const HeroFide = ({
    showCtas = true,
    headingTag = "h1",
    customTitle,
    customProof,
    sectionClassName = "",
    headingSpanClassName = "heading-span-secondary-2",
    centerBulletsVertically = false,
    proofClassName = "",
}: HeroFideProps = {}) => {
    const t = useTranslations("Fide.HeroFide");
    const HeadingTag = headingTag;
    const rich = heroFideRich(headingSpanClassName);

    return (
        <section id="HeroFide" className={`section hero v1 wf-section !pb-12 !pt-6 ${sectionClassName}`}>
            <div className="flex justify-center w-full items-center">
                <div className="px-4 lg:px-8 flex flex-col gap-4 lg:gap-8" style={{ maxWidth: 1500 }}>
                    <HeadingTag className="text-[var(--neutral-800)] text-[72px] leading-[1.181em] font-bold self-end text-[var(--neutral-100)] pb-4 max-[1200px]:text-[48px] max-[1200px]:leading-[1.188em] max-[479px]:text-[34px] max-[479px]:leading-[1.353em] w-full text-center sm:text-left">
                        {customTitle ?? t.rich("title", rich)}
                    </HeadingTag>
                    <div className="grid grid-cols-1 lg:grid-cols-10 lg:items-center gap-x-[20px] [grid-template-columns:1fr_0.7fr] min-[1440px]:gap-x-[90px] max-[991px]:gap-y-[60px] max-[991px]:[grid-template-columns:1fr] gap-8 xl:gap-12">
                        <div
                            id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac"
                            data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be"
                            className={`inner-container test lg:col-span-5 flex flex-col gap-2 sm:gap-4 lg:gap-8 w-full order-2 lg:order-1 ${centerBulletsVertically && !showCtas ? "lg:h-full lg:justify-center" : ""}`}
                            style={{ maxWidth: 650 }}
                        >
                            <div className="flex gap-2 lg:gap-4">
                                <div className="bullet bg-secondary-4 mt-[1px] md:mt-2"></div>
                                <p className="text-lg lg:text-2xl">{t.rich("li1", rich)}</p>
                            </div>
                            <div className="flex gap-2 lg:gap-4">
                                <div className="bullet bg-secondary-5 mt-[1px] md:mt-2"></div>
                                <p className="text-lg lg:text-2xl">{t.rich("li2", rich)}</p>
                            </div>
                            <div className="flex gap-2 lg:gap-4">
                                <div className="bullet bg-secondary-2 mt-[1px] md:mt-2"></div>
                                <p className="text-lg lg:text-2xl">{t.rich("li3", rich)}</p>
                            </div>
                            {showCtas && (
                                <div className="flex w-full gap-2 md:gap-4 items-center justify-center lg:justify-start flex-wrap md:flex-nowrap">
                                    <Link href="#plans" className="btn btn-secondary small shrink-0 !py-5">
                                        {t("buttonSecondary")}
                                    </Link>
                                    <BookFirstMeeting label={t("buttonPrimary")} small={true} />
                                </div>
                            )}
                        </div>
                        <div className="grid lg:col-span-5 relative order-1 lg:order-2">
                            <div className="h-auto w-full">
                                <VideoFide videoKey="fide/videopresentation-soustitres-encode.mp4" subtitle={t("videoSubtitle")} poster="/images/fide-presentation-thumbnail.png" isAnimated={false} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-around items-center w-full">
                        <p className={`mb-0 display-3 shrink-0 text-center font-bold w-full sm:w-auto ${proofClassName}`}>{customProof ?? t.rich("proof", rich)}</p>
                        <div className="flex justify-center items-center">
                            <FideCourseRatings />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
