import { StackedCarousel } from "@/app/components/ui/stacked-carousel";
import { Exercises } from "./components/Exercises";
import { groq } from "next-sanity";
import { client } from "@/app/lib/sanity.client";
import { Exercise, Theme } from "@/app/types/sfn/blog";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

const SLIDES = [
    {
        quote: "",
        name: "",
        designation: "",
        src: "/images/exercise-order2.png",
    },
    {
        quote: "",
        name: "",
        designation: "",
        src: "/images/exercise-pairs2.png",
    },
    {
        quote: "",
        name: "",
        designation: "",
        src: "/images/exercise-flashcards2.png",
    },
];

const queryExercises = groq`
        *[_type=='exercise']
        {
            _id,
            name,
            title,
            title_en,
            category,
            themes[]->{
                _id,
                name,
            }
        }
    `;

const queryThemes = groq`
        *[_type=='theme']
        {
            _id,
            name,
            tags,
            "vocabItemsCount": count(vocabItems),
            category
        } | order(name asc)
    `;

export interface SimpleExercise extends Omit<Exercise, "themes"> {
    themes: { _id: string; name: string }[];
}

export interface ThemeWithCount extends Theme {
    vocabItemsCount: number;
}

async function ExercisesPage() {
    const exercises: SimpleExercise[] = await client.fetch(queryExercises);
    const allThemes: ThemeWithCount[] = await client.fetch(queryThemes);

    return <ExercisePageNoAsync exercises={exercises} allThemes={allThemes} />;
}

export default ExercisesPage;

const ExercisePageNoAsync = ({ exercises, allThemes }: { exercises: SimpleExercise[]; allThemes: ThemeWithCount[] }) => {
    const t = useTranslations("ExercisesPage");

    return (
        <div className="w-full flex flex-col items-center py-12 px-2 sm:px-4 overflow-x-hidden">
            <div className="w-full max-w-7xl">
                <div className="flex justify-center w-full items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 hero-v1 md:gap-12">
                        <div style={{ maxWidth: 650 }} className="h-full flex flex-col justify-center items-start gap-4 md:gap-8">
                            <h1 className="display-1">{t.rich("title", intelRich())}</h1>
                            <p className="mb-8">{t("description")}</p>
                        </div>
                        <div className="flex flex-col justify-center items-center">
                            <div className="h-auto w-full mb-8">
                                <StackedCarousel slides={SLIDES} autoplay={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-7xl">
                <Exercises exercises={exercises} allThemes={allThemes} />
            </div>
        </div>
    );
};
