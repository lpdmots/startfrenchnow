import { SlideFromBottom, SlideInOneByOneChild } from "@/app/components/animations/Slides";
import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Exam } from "@/app/types/fide/exam";
import { PreviewLevelSwitcher } from "./PreviewLevelSwitcher";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

const queryExams = groq`*[_type == "fideExam" && isPreview == true] { 
    ... 
}`;

export async function PreviewsSection() {
    const exams: Exam[] = await client.fetch(queryExams);

    const videosUrl = {
        // Ce contenu sera fetch quand il sera créé
        A1: {
            videoKey: "fide/video-presentation-fide.mp4",
            poster: "/images/fide-presentation-thumbnail.png",
            subtitleFRUrl: "/fide/video-presentation-fide.vtt",
            subtitleENUrl: "/fide/video-presentation-fide-en.vtt",
        },
        A2: {
            videoKey: "fide/video-presentation-fide.mp4",
            poster: "/images/fide-presentation-thumbnail.png",
            subtitleFRUrl: "/fide/video-presentation-fide.vtt",
            subtitleENUrl: "/fide/video-presentation-fide-en.vtt",
        },
        B1: {
            videoKey: "fide/video-presentation-fide.mp4",
            poster: "/images/fide-presentation-thumbnail.png",
            subtitleFRUrl: "/fide/video-presentation-fide.vtt",
            subtitleENUrl: "/fide/video-presentation-fide-en.vtt",
        },
    };

    return <PreviewsSectionNoAsync exams={exams} videosUrl={videosUrl} />;
}

function PreviewsSectionNoAsync({
    exams,
    videosUrl,
}: {
    exams: Exam[];
    videosUrl: {
        A1: { videoKey: string; poster: string; subtitleFRUrl: string; subtitleENUrl: string };
        A2: { videoKey: string; poster: string; subtitleFRUrl: string; subtitleENUrl: string };
        B1: { videoKey: string; poster: string; subtitleFRUrl: string; subtitleENUrl: string };
    };
}) {
    const t = useTranslations("Fide.PreviewsSection");

    return (
        <div id="previews-section" className="max-w-7xl m-auto pt-24 pb-12 px-4 lg:px-8">
            <div className="flex flex-col justify-center items-center xl:items-start w-full">
                <div className="lg:mb-6 max-w-3xl xl:max-w-none">
                    <SlideFromBottom>
                        <h2 className="display-2">{t.rich("title", intelRich())}</h2>
                    </SlideFromBottom>
                    <SlideFromBottom>
                        <p className="color-neutral-700 ">{t("subtitle")}</p>
                    </SlideFromBottom>
                </div>
            </div>
            <PreviewLevelSwitcher exams={exams} videosUrl={videosUrl} />
        </div>
    );
}
