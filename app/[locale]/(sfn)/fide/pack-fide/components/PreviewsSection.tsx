import { SlideFromBottom, SlideInOneByOneChild } from "@/app/components/animations/Slides";
import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Exam } from "@/app/types/fide/exam";
import { PreviewLevelSwitcher } from "./PreviewLevelSwitcher";

const queryExams = groq`
{
  "A1": *[_type == "fideExam" && level == "A1" ][0...3] | order(_createdAt desc) { ... },
  "A2": *[_type == "fideExam" && level == "A2" ][0...3] | order(_createdAt desc) { ... },
  "B1": *[_type == "fideExam" && level == "B1" ][0...3] | order(_createdAt desc) { ... }
}
`;

interface AllExams {
    A1: Exam[];
    A2: Exam[];
    B1: Exam[];
}

export async function PreviewsSection() {
    const exams: AllExams = await client.fetch(queryExams);
    const videosUrl = {
        // Ce contenu seraà fetch quand il sera créé
        A1: {
            videoKey: "fide/video-presentation-fide.mp4",
            poster: "/images/fide-presentation-thumbnail.png",
        },
        A2: {
            videoKey: "fide/video-presentation-fide.mp4",
            poster: "/images/fide-presentation-thumbnail.png",
        },
        B1: {
            videoKey: "fide/video-presentation-fide.mp4",
            poster: "/images/fide-presentation-thumbnail.png",
        },
    };

    return (
        <div id="previews-section" className="max-w-7xl m-auto pt-24 pb-12 px-4 lg:px-8">
            <div className="flex flex-col justify-center items-center xl:items-start w-full">
                <div className="lg:mb-6 max-w-3xl xl:max-w-none">
                    <SlideFromBottom>
                        <h2 className="display-2">
                            <span className="heading-span-secondary-2">Essayez</span> <u>gratuitement</u> le Pack FIDE
                        </h2>
                    </SlideFromBottom>
                    <SlideFromBottom>
                        <p className="color-neutral-700 ">Accédez gratuitement à un cours complet et passez des examens blancs comme au jour J.</p>
                    </SlideFromBottom>
                </div>
            </div>
            <PreviewLevelSwitcher exams={exams} videosUrl={videosUrl} />
        </div>
    );
}
