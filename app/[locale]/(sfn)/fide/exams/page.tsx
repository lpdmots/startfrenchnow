import { StackedCarousel } from "@/app/components/ui/stacked-carousel";
import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Exercise, Theme } from "@/app/types/sfn/blog";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import ExpandableCardDemo from "@/app/components/ui/expandable-card-demo-standard";
import { Exam } from "@/app/types/fide/exam";

const queryExams = groq`
        *[_type=='fideExam']
        {
            ...
        }
    `;

async function FideExamPage() {
    const exams: Exam[] = await client.fetch(queryExams);

    return <FideExamPageNoAsync exams={exams} />;
}

export default FideExamPage;

const FideExamPageNoAsync = ({ exams }: { exams: Exam[] }) => {
    /* const t = useTranslations("ExercisesPage"); */

    return (
        <div className="w-full flex flex-col items-center py-12 px-2 sm:px-4 overflow-x-hidden">
            <div className="w-full max-w-7xl">
                <ExpandableCardDemo exams={exams} />
            </div>
        </div>
    );
};
