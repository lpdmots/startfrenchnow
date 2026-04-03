import { VideoFide } from "./VideoFide";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import { intelRich } from "@/app/lib/intelRich";
import { BookFirstMeeting } from "./BookFirstMeeting";
import { FideCourseRatings } from "@/app/components/sfn/courses/FideCourseRatings";

export const HeroFide = () => {
    const t = useTranslations("Fide.HeroFide");
    const baseNumbers = {
        subscribers: 23000,
        rating: 0,
        reviews: 3500,
    };

    return (
        <section id="HeroFide" className="section hero v1 wf-section !pb-12 !pt-6">
            <div className="flex justify-center w-full items-center">
                <div className="px-4 lg:px-8 flex flex-col gap-4 lg:gap-8" style={{ maxWidth: 1500 }}>
                    <h1 className="text-[var(--neutral-800)] text-[72px] leading-[1.181em] font-bold self-end text-[var(--neutral-100)] pb-4 max-[1200px]:text-[48px] max-[1200px]:leading-[1.188em] max-[479px]:text-[34px] max-[479px]:leading-[1.353em] w-full text-center sm:text-left">{t.rich("title", intelRich())}</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-x-[20px] [grid-template-columns:1fr_0.7fr] min-[1440px]:gap-x-[90px] max-[991px]:gap-y-[60px] max-[991px]:[grid-template-columns:1fr] gap-8 xl:gap-12">
                        <div
                            id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac"
                            data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be"
                            className="inner-container test lg:col-span-5 flex flex-col gap-2 sm:gap-4 lg:gap-8 w-full order-2 lg:order-1"
                            style={{ maxWidth: 650 }}
                        >
                            <div className="flex gap-2 lg:gap-4">
                                <div className="bullet bg-secondary-4 mt-[1px] md:mt-2"></div>
                                <p className="text-lg lg:text-2xl">{t.rich("li1", intelRich())}</p>
                            </div>
                            <div className="flex gap-2 lg:gap-4">
                                <div className="bullet bg-secondary-5 mt-[1px] md:mt-2"></div>
                                <p className="text-lg lg:text-2xl">{t.rich("li2", intelRich())}</p>
                            </div>
                            <div className="flex gap-2 lg:gap-4">
                                <div className="bullet bg-secondary-2 mt-[1px] md:mt-2"></div>
                                <p className="text-lg lg:text-2xl">{t.rich("li3", intelRich())}</p>
                            </div>
                            <div className="flex w-full gap-2 md:gap-4 items-center justify-center lg:justify-start flex-wrap md:flex-nowrap">
                                <Link href="#plans" className="btn btn-secondary small shrink-0 !py-5">
                                    {t("buttonSecondary")}
                                </Link>
                                <BookFirstMeeting label={t("buttonPrimary")} small={true} />
                            </div>
                        </div>
                        <div className="grid lg:col-span-5 relative order-1 lg:order-2">
                            <div className="h-auto w-full">
                                <VideoFide videoKey="fide/videopresentation-soustitres-encode.mp4" subtitle={t("videoSubtitle")} poster="/images/fide-presentation-thumbnail.png" isAnimated={false} />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-around items-center w-full">
                        <p className="mb-0 display-3 shrink-0 text-center font-bold w-full sm:w-auto">{t.rich("proof", intelRich())}</p>
                        <div className="flex justify-center items-center">
                            <FideCourseRatings />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
