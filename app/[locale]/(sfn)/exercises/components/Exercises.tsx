"use client";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { SimpleExercise, ThemeWithCount } from "../page";
import { useMemo, useState } from "react";
import { cn } from "@/app/lib/schadcn-utils";
import Flashcards from "@/app/components/exercises/Flashcards";
import Exercise from "@/app/components/exercises/exercise/Exercise";
import { FlashcardsProps, PrimaryCategory } from "@/app/types/sfn/blog";

export interface FlashcardPreset {
    tag: string;
    themeId: string;
    flashcardId: string;
    category?: string;
    name: string;
}

const getFiltredExercices = (exercises: SimpleExercise[], selectedCategory: string, selectedTheme: string) => {
    return exercises.filter((exercise) => {
        return (!selectedCategory || selectedCategory === "all" || exercise.category === selectedCategory) && (!selectedTheme || exercise.themes.some((theme) => theme._id === selectedTheme));
    });
};

const getFiltredFlashcards = (flashcardPresets: FlashcardPreset[], selectedCategory: string, selectedTheme: string) => {
    return flashcardPresets.filter((flashcard) => {
        return (!selectedCategory || selectedCategory === "all" || flashcard.category === selectedCategory) && (!selectedTheme || flashcard.themeId === selectedTheme);
    });
};

const getFlashcardPresets = (themes: ThemeWithCount[]): FlashcardPreset[] => {
    return themes
        .filter((theme) => theme.vocabItemsCount > 0)
        .map((theme) => {
            return [{ name: "all", french: "tous", english: "all" }, ...(theme?.tags || [])].map((tag) => {
                return {
                    tag: tag.name,
                    themeId: theme._id,
                    flashcardId: theme._id + "::" + tag.name,
                    category: theme.category,
                    name: theme.name + (tag.name !== "all" ? " - " + tag.name : ""),
                };
            });
        })
        .flat();
};

const getTrainingData = (selectedTraining: string) => {
    const splitValue = selectedTraining.split("::");
    const trainingType = splitValue[0];
    if (trainingType === "exercise") {
        return {
            trainingType,
            exerciseId: splitValue[1],
            tag: "",
            themeId: "",
        };
    } else {
        const tag = splitValue[2] === "all" ? undefined : splitValue[2];
        return {
            trainingType,
            exerciseId: "",
            tag,
            themeId: splitValue[1],
        };
    }
};

const getFlashcardsData = (trainingData: ReturnType<typeof getTrainingData>, selectedCategory: string) => {
    return {
        category: selectedCategory,
        title: "Flashcards",
        title_en: "Flashcards",
        instruction: [],
        instruction_en: [],
        filters: {
            status: "all",
            nature: "all",
            tags: trainingData.tag ? [trainingData.tag] : [],
        },
        themes: [
            {
                _ref: trainingData.themeId,
                _type: "reference",
                _key: trainingData.themeId,
            },
        ],
        options: {
            shuffle: true,
            swapFaces: true,
            withSound: true,
        },
    };
};

export function Exercises({ exercises, allThemes }: { exercises: SimpleExercise[]; allThemes: ThemeWithCount[] }) {
    const flashcardPresets = useMemo(() => getFlashcardPresets(allThemes), [allThemes]);

    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedTheme, setSelectedTheme] = useState<string>("");
    const [selectedTraining, setSelectedTraining] = useState<string>("");

    const [filtredExercises, setFiltredExercises] = useState<SimpleExercise[]>([]);
    const [filtredFlashcards, setFiltredFlashcards] = useState<FlashcardPreset[]>([]);
    const [filtredThemes, setFiltredThemes] = useState<ThemeWithCount[]>(allThemes);

    const handleChangeCategory = (category: string) => {
        if (category === selectedCategory) return;

        setSelectedCategory(category);

        const newFiltredThemes = allThemes.filter((theme) => category === "all" || theme.category === category);
        setFiltredThemes(newFiltredThemes);

        setSelectedTheme("");
        setSelectedTraining("");
        setFiltredExercises([]);
        setFiltredFlashcards([]);
    };

    const handleChangeTheme = (theme: string) => {
        if (theme === selectedTheme) return;

        setSelectedTheme(theme);
        setSelectedTraining("");

        const filtredExercises = getFiltredExercices(exercises, selectedCategory, theme);
        const filtredFlashcards = getFiltredFlashcards(flashcardPresets, selectedCategory, theme);
        setFiltredExercises(filtredExercises);
        setFiltredFlashcards(filtredFlashcards);
    };

    const isThemeDisabled = filtredThemes.length < 1;
    const isTrainingDisabled = filtredExercises.length < 1 && filtredFlashcards.length < 1;

    const trainingData = getTrainingData(selectedTraining);

    return (
        <div className="flex flex-col w-full items-center md:mt-24 mb-12 md:mb-24">
            <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
                <Select name="category" onValueChange={handleChangeCategory} value={selectedCategory}>
                    <SelectTrigger className="col-span-3 md:col-span-1 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--neutral-800)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--neutral-800)]">
                        <SelectValue placeholder={"Choisissez une catégorie"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className="text-lg">Catégories</SelectLabel>
                            <SelectItem className="hover:bg-neutral-200" value="all">
                                Toutes
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="grammar">
                                Grammaire
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="vocabulary">
                                Vocabulaire
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="expressions">
                                Expressions
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="cultur">
                                Culture
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select name="theme" onValueChange={handleChangeTheme} value={selectedTheme || ""} disabled={isThemeDisabled}>
                    <SelectTrigger
                        className={cn(
                            "col-span-3 md:col-span-1 card rounded-xl p-4 transition-shadow duration-300 color-neutral-800",
                            !isThemeDisabled && "hover:!shadow-[5px_5px_0_0_var(--neutral-800)] data-[state=open]:!shadow-[5px_5px_0_0_var(--neutral-800)]",
                            isThemeDisabled && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        <SelectValue className="color-neutral-600" placeholder={"Choisissez un thème"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className="text-lg">Thèmes</SelectLabel>
                            {filtredThemes.map((theme) => (
                                <SelectItem className="hover:bg-neutral-200" value={theme._id} key={theme._id}>
                                    {theme.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Select name="training" onValueChange={(val) => setSelectedTraining(val)} value={selectedTraining} disabled={isTrainingDisabled}>
                    <SelectTrigger
                        className={cn(
                            "col-span-3 md:col-span-1 card rounded-xl p-4 transition-shadow duration-300 color-neutral-800",
                            !isTrainingDisabled && "hover:!shadow-[5px_5px_0_0_var(--neutral-800)] data-[state=open]:!shadow-[5px_5px_0_0_var(--neutral-800)]",
                            isTrainingDisabled && "opacity-70 cursor-not-allowed"
                        )}
                    >
                        <SelectValue className="color-neutral-600" placeholder={"Sélectionnez un exercice"} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {!!filtredFlashcards.length && (
                                <>
                                    <SelectLabel className="text-lg">Flashcards</SelectLabel>
                                    {filtredFlashcards.map((flashcard) => (
                                        <SelectItem className="hover:bg-neutral-200" value={"flashcard::" + flashcard.flashcardId} key={flashcard.flashcardId}>
                                            {flashcard.name}
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                            {!!filtredExercises.length && (
                                <>
                                    <SelectLabel className="text-lg">Exercices</SelectLabel>
                                    {filtredExercises.map((exercise) => (
                                        <SelectItem className="hover:bg-neutral-200" value={"exercise::" + exercise._id} key={exercise._id}>
                                            {exercise.name}
                                        </SelectItem>
                                    ))}
                                </>
                            )}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="w-full flex justify-center max-w-4xl">
                <div className="w-full min-h-[600px]">
                    {!selectedTraining ? (
                        <p className="text-neutral-400 font-bold w-full text-center mt-24">Veuillez sélectionner un exercice...</p>
                    ) : trainingData.trainingType === "flashcard" ? (
                        <Flashcards data={getFlashcardsData(trainingData, selectedCategory || "vocabulary") as unknown as FlashcardsProps} />
                    ) : (
                        <Exercise _ref={trainingData.exerciseId} />
                    )}
                </div>
            </div>
        </div>
    );
}
