import { VideoFide } from "./VideoFide";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import Link from "next-intl/link";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { MdPlayLesson } from "react-icons/md";
import { NotebookPen } from "lucide-react";

export const HeroFide = () => {
    const t = useTranslations("Fide.HeroFide");

    return (
        <section id="HeroFide" className="section hero v1 wf-section !py-12">
            <div className="flex justify-center w-full items-center">
                <div className="px-4 lg:px-8 flex flex-col gap-6 lg:gap-12" style={{ maxWidth: 1500 }}>
                    <h1 className="hero-title w-full text-center">{t.rich("title", intelRich())}</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-9 hero-v1 gap-8 xl:gap-12">
                        <div
                            id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac"
                            data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be"
                            className="inner-container test lg:col-span-4 flex flex-col gap-4 lg:gap-8 w-full items-center order-2 lg:order-1"
                            style={{ maxWidth: 650 }}
                        >
                            <div className="flex gap-2 lg:gap-4">
                                <div className="bullet bg-secondary-2 mt-[1px] md:mt-2"></div>
                                <p className="text-lg lg:text-2xl">{t.rich("li1", intelRich())}</p>
                            </div>
                            <div className="flex gap-2 lg:gap-4">
                                <div className="bullet bg-secondary-4 mt-[1px] md:mt-2"></div>
                                <p className="text-lg lg:text-2xl">{t.rich("li2", intelRich())}</p>
                            </div>
                            <Link href="#ContactForFIDECourses" className="no-underline w-full sm:w-auto">
                                <ShimmerButton className="btn-primary button-row w-button flex items-center justify-center">
                                    <NotebookPen className="mr-2 text-xl" />
                                    {t("button")}
                                </ShimmerButton>
                            </Link>
                        </div>
                        <div className="grid lg:col-span-5 relative order-1 lg:order-2">
                            <div className="h-auto w-full">
                                <VideoFide videoKey="fide/video-presentation-fide.mp4" subtitle={t("videoSubtitle")} poster="/images/fide-presentation-thumbnail.png" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
