import { HeroVideo } from "./HeroVideo";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { FideCourseRatings } from "../courses/FideCourseRatings";
import { Link } from "@/i18n/navigation";
import { CalendarCheck } from "lucide-react";

export const HeroSfn = () => {
    const t = useTranslations("HeroSfn");

    return (
        <section className="section hero v1 wf-section !pb-0">
            <div className="flex justify-center w-full items-center">
                <div className="px-8" style={{ maxWidth: 1500 }}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-[20px] [grid-template-columns:1fr_0.7fr] min-[1440px]:gap-x-[90px] max-[991px]:gap-y-[60px] max-[991px]:[grid-template-columns:1fr] gap-8 xl:gap-12">
                        <div id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac" data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be" className="inner-container test" style={{ maxWidth: 650 }}>
                            <div className="text-center---tablet">
                                <div className="inner-container max-[991px]:max-w-[550px] center">
                                    <h1 className="pb-4 text-[56px] leading-[1.12] font-bold max-[1200px]:text-[46px] max-[1200px]:leading-[1.18] max-[479px]:text-[34px] max-[479px]:leading-[1.2]">
                                        {t.rich("title", intelRich())}
                                    </h1>
                                </div>
                                <p className="mb-6 text-base lg:text-2xl">{t.rich("description", intelRich())}</p>
                            </div>
                            <div className="buttons-row mb-6 min-h-[132px] max-[991px]:justify-center flex flex-col sm:gap-4 md:min-h-[64px] md:flex-row md:gap-0">
                                <Link
                                    href="#ContactForFIDECourses"
                                    className="btn-primary button-row w-button flex w-full items-center justify-center !px-4 no-underline transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.96] md:w-auto"
                                >
                                    <CalendarCheck aria-hidden="true" className="mr-2 h-5 w-5" strokeWidth={2} />
                                    {t("btn_beginner_course")}
                                </Link>
                                <Link
                                    href="#fide-hub"
                                    className="btn btn-secondary w-full !px-4 text-center no-underline transition-[background-color,border-color,color,transform] duration-150 ease-out active:scale-[0.96] md:w-auto"
                                >
                                    {t("btn_resources")}
                                </Link>
                            </div>
                            <div className="mt-6 pt-4 border-t border-neutral-300 text-sm lg:text-base font-semibold text-neutral-700 flex flex-wrap items-center gap-2 max-[991px]:justify-center">
                                <span className="text-neutral-500">{t("formats_label")}</span>
                                <Link href="/fide/mock-exams" className="hover:text-secondary-6 no-underline">
                                    {t("badges.levels")}
                                </Link>
                                <span className="text-neutral-400">›</span>
                                <Link href="/fide/pack-fide" className="hover:text-secondary-6 no-underline">
                                    {t("badges.online")}
                                </Link>
                                <span className="text-neutral-400">›</span>
                                <Link href="/fide/private-courses" className="hover:text-secondary-6 no-underline">
                                    {t("badges.swiss")}
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-4">
                            <div className="h-auto w-full mb-8">
                                <HeroVideo playLabel={t("play_video")} />
                            </div>
                            <FideCourseRatings />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
