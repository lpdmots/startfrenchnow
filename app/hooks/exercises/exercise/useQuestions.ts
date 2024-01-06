import { AutomatedType, Exercise as ExerciseProps, ExerciseType, Question, QuestionPriority, TabelVocFilters, Theme, VocabItem } from "@/app/types/sfn/blog";
import { useEffect } from "react";
import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { removeDuplicates, removeTrailingPunctuation, shuffleArray, splitSentence } from "@/app/lib/utils";

const queryTheme = groq`
        *[_type=='theme' && _id in $themeIds]`;

const MAX_LOOP_COUNT = 10;

export const useQuestions = (exercise: ExerciseProps) => {
    const { _id, themes, exerciseTypes, questions, questionsPriority } = exercise;
    const { setQuestions, setStatus } = useExerciseStore();

    const fetchThemeData = async (themeIds: string[]): Promise<Theme[]> => {
        return client.fetch(queryTheme, { themeIds });
    };

    const fetchQuestions = async () => {
        let themeIds = themes.map((theme) => theme._ref);
        let themesData: Theme[] = [];
        let potentialQuestions: Question[] = questionsPriority === "automated" ? [] : questions || [];
        let automatedQuestions: Question[] = [];
        let loop = 0;

        while (themeIds.length && loop < MAX_LOOP_COUNT) {
            try {
                const themeData = await fetchThemeData(themeIds);
                themesData.push(...themeData);

                if (["manual", "mixed"].includes(questionsPriority)) {
                    const newQuestions = themeData
                        .map((theme) => theme.questions || [])
                        .flat()
                        .filter((question) => question.exerciseTypes.some((type) => (exerciseTypes || []).includes(type)) && !potentialQuestions.some((q) => q._key === question._key));
                    potentialQuestions.push(...newQuestions);
                }

                themeIds = themeData
                    .map((theme) => theme.children?.map((child) => child._ref) || [])
                    .flat()
                    .filter(Boolean);
                loop++;
            } catch (error) {
                console.error("Error fetching theme data:", error);
                break;
            }
        }

        const areAutomatedNeeded = ["automated", "mixed"].includes(questionsPriority) || (questionsPriority === "manual" && potentialQuestions.length < exercise.nbOfQuestions);
        if (areAutomatedNeeded) {
            const nbreToCreate = getNbreToCreate(potentialQuestions.length, questionsPriority, exercise.nbOfQuestions);
            automatedQuestions = await getAutomatedQuestions(exercise, nbreToCreate, themesData);
        }

        const allQuestions = shuffleArray([...automatedQuestions, ...potentialQuestions]);
        const nberOfQuestions = Math.min(allQuestions.length, exercise.nbOfQuestions);
        allQuestions.splice(nberOfQuestions);
        setQuestions(_id, allQuestions);
        setStatus(_id, "inGame");
    };

    useEffect(() => {
        fetchQuestions();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

const getNbreToCreate = (nbreOfpotentialQuestions: number, questionsPriority: QuestionPriority, nbreOfQuestions: number) => {
    return questionsPriority === "automated"
        ? nbreOfQuestions
        : questionsPriority === "mixed"
        ? Math.max(nbreOfQuestions - nbreOfpotentialQuestions, Math.ceil(nbreOfQuestions / 2))
        : nbreOfQuestions - nbreOfpotentialQuestions;
};

const getAutomatedQuestions = async (exercise: ExerciseProps, nbreToCreate: number, themesData: Theme[]) => {
    const { automatedTypes, filters } = exercise;
    const automatedTypesWithLevels = replaceLevels(automatedTypes);
    const automatedQuestions = [];
    const vocabItemsRefs = themesData.map((theme) => theme.vocabItems.map((item) => item._ref)).flat();
    const allVocabItems: VocabItem[] = await client.fetch(`*[_type=='vocabItem' && _id in $vocabItemsRefs]`, { vocabItemsRefs });
    const vocabItems = allVocabItems?.filter((item) => filterVocabItems(item, filters));
    console.log("vocabItems", vocabItems);
    const remainingVocabItems = [...vocabItems];
    const possibleCombinations = Object.assign({}, ...vocabItems.map((vocabItem) => ({ [vocabItem._id]: [...automatedTypesWithLevels] })));

    whileLoop: while (automatedQuestions.length < nbreToCreate && Object.keys(possibleCombinations).length) {
        let keyToRemoveType: string[] = [];
        // Choix du vocabulaire
        const vocabItemIndex = Math.floor(Math.random() * remainingVocabItems.length);
        const vocabItem = remainingVocabItems[vocabItemIndex];
        keyToRemoveType.push(vocabItem._id);

        // Choix du type
        const types = possibleCombinations[vocabItem._id];
        const typeIndex = Math.floor(Math.random() * types.length);
        const type = types[typeIndex];

        // Ajout de la question
        switch (type) {
            case "translateFrToEn":
                automatedQuestions.push(getTranslateFrToEnQuestion(vocabItem, vocabItems));
                break;
            case "translateEnToFr":
                automatedQuestions.push(getTranslateEnToFrQuestion(vocabItem, vocabItems));
                break;
            case "soundFrToEn":
                automatedQuestions.push(getSoundFrToEnQuestion(vocabItem, vocabItems));
                break;
            case "enToSoundFr":
                automatedQuestions.push(getEnToSoundFrQuestion(vocabItem, vocabItems));
                break;
            case "soundFrToFr":
                automatedQuestions.push(getSoundFrToFrQuestion(vocabItem, vocabItems));
                break;
            case "chooseCorrectSpelling":
                const chooseCorrectSpellingQuestion = getChooseCorrectSpellingQuestion(vocabItem, vocabItems);
                if (chooseCorrectSpellingQuestion) automatedQuestions.push(chooseCorrectSpellingQuestion);
                break;
            case "pairedWords":
                const { pairedWordsQuestion, keyToRemove } = getPairedWordsQuestion(vocabItem, vocabItems, possibleCombinations);
                keyToRemoveType.push(...keyToRemove);
                console.log("pairedWordsQuestion", pairedWordsQuestion);
                if (pairedWordsQuestion) automatedQuestions.push(pairedWordsQuestion);
                break;
            case "orderWordsEasy":
                const orderWordsEasyQuestion = getOrderWordsQuestion(vocabItem, vocabItems);
                if (orderWordsEasyQuestion) automatedQuestions.push(orderWordsEasyQuestion);
                break;
            case "orderWords":
                const orderWordsQuestion = getOrderWordsQuestion(vocabItem, vocabItems, false);
                if (orderWordsQuestion) automatedQuestions.push(orderWordsQuestion);
                break;
            case "riddleButtons":
                const riddleButtonsQuestion = getRiddleQuestion(vocabItem, vocabItems, true);
                if (riddleButtonsQuestion) automatedQuestions.push(riddleButtonsQuestion);
                break;
            case "riddleInput":
                const riddleInputQuestion = getRiddleQuestion(vocabItem, vocabItems);
                if (riddleInputQuestion) automatedQuestions.push(riddleInputQuestion);
                break;
            case "translateEnToFrInput":
                const translateEnToFrInputQuestion = getTranslateToFrInputQuestion(vocabItem, false);
                if (translateEnToFrInputQuestion) automatedQuestions.push(translateEnToFrInputQuestion);
                break;
            case "translateSoundToFrInput":
                const translateSoundToFrInputQuestion = getTranslateToFrInputQuestion(vocabItem);
                if (translateSoundToFrInputQuestion) automatedQuestions.push(translateSoundToFrInputQuestion);
                break;
            case "imageButtons":
                const imageQuestion = getImageQuestion(vocabItem, vocabItems, true);
                if (imageQuestion) automatedQuestions.push(imageQuestion);
                break;
            case "imageInput":
                const imageInputQuestion = getImageQuestion(vocabItem, vocabItems);
                if (imageInputQuestion) automatedQuestions.push(imageInputQuestion);
                break;
            default:
                break whileLoop;
        }

        // Suppression du type choisi pour les clés concernées
        keyToRemoveType.forEach((key) => {
            possibleCombinations[key] = (possibleCombinations[key] as AutomatedType[])?.filter((t) => t !== type);
            const keyIndex = remainingVocabItems.findIndex((v) => v._id === key);
            remainingVocabItems.splice(keyIndex, 1);
            if (possibleCombinations[key].length === 0) delete possibleCombinations[key];
        });

        // Check si on a bouclé sur tous les vocabItems
        if (remainingVocabItems.length === 0) remainingVocabItems.push(...vocabItems.filter((item) => Object.keys(possibleCombinations).includes(item._id)));
    }

    return automatedQuestions;
};

function replaceLevels(automatedTypes: AutomatedType[]) {
    const levelMappings = {
        level1: ["translateEnToFr", "pairedWords", "soundFrToFr", "chooseCorrectSpelling"],
        level2: ["soundFrToEn", "enToSoundFr", "orderWordsEasy", "riddleButtons", "pairedWords"],
        level3: ["translateEnToFrInput", "translateSoundToFrInput", "orderWordsEasy"],
    };

    return removeDuplicates(automatedTypes?.flatMap((type) => levelMappings[type as "level1" | "level2" | "level3"] || type));
}

const getPossibleWrongAnswers = (vocabItem: VocabItem, vocabItems: VocabItem[]) => {
    const wrongAnswerCondition = (v: VocabItem) => {
        if (vocabItem.nature === "expression") return v.nature === "expression";
        return v.nature !== "expression";
    };
    return vocabItems.filter((v) => v._id !== vocabItem._id && wrongAnswerCondition(v));
};

// Niveau 1
const getTranslateFrToEnQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[]): Question => {
    const texts = [
        `Que veut dire "${vocabItem.french}" SOUNDSPAN ?`,
        `Comment dit-on "${vocabItem.french}" SOUNDSPAN en anglais ?`,
        `Quelle est la traduction de "${vocabItem.french}" SOUNDSPAN ?`,
        `Quelle est la traduction anglaise de "${vocabItem.french}" SOUNDSPAN ?`,
    ];
    const possibleWrongAnswers = getPossibleWrongAnswers(vocabItem, vocabItems);

    return {
        _key: vocabItem._id + "translateFrToEn",
        exerciseTypes: ["buttons"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
            sounds: [vocabItem.soundFr],
        },
        options: {},
        responses: [
            { _key: "1", text: vocabItem.english, isCorrect: "1" },
            ...shuffleArray(possibleWrongAnswers)
                .slice(0, Math.min(3, possibleWrongAnswers.length))
                .map((v) => ({ _key: v._id, text: v.english })),
        ],
    };
};

// Niveau 1
const getTranslateEnToFrQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[]): Question => {
    const texts = [`Comment dit-on "${vocabItem.english}" en français ?`, `Quelle est la traduction de "${vocabItem.english}" ?`, `Quelle est la traduction française de "${vocabItem.english}" ?`];

    const possibleWrongAnswers = getPossibleWrongAnswers(vocabItem, vocabItems);

    return {
        _key: vocabItem._id + "translateEnToFr",
        exerciseTypes: ["buttons"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
        },
        options: {},
        responses: [
            { _key: "1", text: vocabItem.french, isCorrect: "1", sound: vocabItem.soundFr },
            ...shuffleArray(possibleWrongAnswers)
                .slice(0, Math.min(3, possibleWrongAnswers.length))
                .map((v) => ({ _key: v._id, text: v.french, sound: v.soundFr })),
        ],
    };
};

// Niveau 1
const getSoundFrToFrQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[]): Question => {
    const { french, soundFr } = vocabItem;
    const texts = [`Retrouve la correspondance SOUNDSPAN.`, `Écoute SOUNDSPAN et trouve la réponse.`, `Écoute SOUNDSPAN et retrouve l'écriture française correspondante.`];
    const possibleWrongAnswers = getPossibleWrongAnswers(vocabItem, vocabItems);

    return {
        _key: vocabItem._id + "soundFrToFr",
        exerciseTypes: ["buttons"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
            sounds: [soundFr],
        },
        options: {},
        responses: [
            { _key: "1", text: french, isCorrect: "1" },
            ...shuffleArray(possibleWrongAnswers)
                .slice(0, Math.min(3, possibleWrongAnswers.length))
                .map((v) => ({ _key: v._id, text: v.french })),
        ],
    };
};

// Niveau 1
const getPairedWordsQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[], possibleCombinations: { [key: string]: AutomatedType[] }) => {
    const sameNature = (voc: VocabItem) => {
        const isVocabItemExpression = vocabItem.nature === "expression";
        const isVocExpression = voc.nature === "expression";
        return isVocabItemExpression === isVocExpression;
    };

    const potentialWordsToPair = Object.entries(possibleCombinations)
        .filter(([key, value]) => value.includes("pairedWords") && key !== vocabItem._id)
        .map(([key]) => vocabItems.find((v) => v._id === key && sameNature(v)))
        .filter(Boolean) as VocabItem[];
    console.log("potentialWordsToPair", potentialWordsToPair);
    if (potentialWordsToPair.length === 0) return { pairedWordsQuestion: null, keyToRemove: [] };

    const wordsToPair = shuffleArray(potentialWordsToPair).slice(0, Math.min(3, potentialWordsToPair.length));
    const texts = [`Associe les paires.`, `Associe les mots avec leur traduction.`];
    console.log("wordsToPair", wordsToPair);
    const pairedWordsQuestion = {
        _key: vocabItem._id + "pairedWords",
        exerciseTypes: ["link"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
        },
        options: {},
        responses: [...wordsToPair, vocabItem]
            .map((v, index) => [
                { _key: v._id, text: v.french, isCorrect: `{"column": "left", "value": "${index}"}` },
                { _key: v._id + "english", text: v.english, isCorrect: `{"column": "right", "value": "${index}"}` },
            ])
            .flat(),
    } as Question;

    return { pairedWordsQuestion, keyToRemove: wordsToPair.map((v) => v._id) };
};

// Niveau 2
const getSoundFrToEnQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[]): Question => {
    const texts = [`Écoute SOUNDSPAN et retrouve la traduction.`, `Que signifie SOUNDSPAN ?`, `Que veut dire SOUNDSPAN en anglais ?`];
    const possibleWrongAnswers = getPossibleWrongAnswers(vocabItem, vocabItems);

    return {
        _key: vocabItem._id + "soundFrToEn",
        exerciseTypes: ["buttons"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
            sounds: [vocabItem.soundFr],
        },
        options: {},
        responses: [
            { _key: "1", text: vocabItem.english, isCorrect: "1" },
            ...shuffleArray(possibleWrongAnswers)
                .slice(0, Math.min(3, possibleWrongAnswers.length))
                .map((v) => ({ _key: v._id, text: v.english })),
        ],
    };
};

// Niveau 2
const getEnToSoundFrQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[]): Question => {
    const { english, soundFr } = vocabItem;
    const texts = [`Comment dit-on "${english}" en français ?`, `Quelle est la traduction de "${english}" ?`];
    const possibleWrongAnswers = getPossibleWrongAnswers(vocabItem, vocabItems);

    return {
        _key: vocabItem._id + "enToSoundFr",
        exerciseTypes: ["buttons"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
        },
        options: {},
        responses: [
            { _key: "1", text: "", sound: soundFr, isCorrect: "1" },
            ...shuffleArray(possibleWrongAnswers)
                .slice(0, Math.min(3, possibleWrongAnswers.length))
                .map((v) => ({ _key: v._id, text: "", sound: v.soundFr })),
        ],
    };
};

// Niveau 2
const getChooseCorrectSpellingQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[]): Question | null => {
    const { french } = vocabItem;
    const wrongSpelling = vocabItem.exerciseData?.chooseCorrectSpelling;
    if (!wrongSpelling) return null;

    const texts = [`Choisis la bonne orthographe.`, `Quelle est la bonne orthographe ?`, `Comment l'écris-tu ?`];
    return {
        _key: vocabItem._id + "chooseCorrectSpelling",
        exerciseTypes: ["buttons"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
        },
        options: {},
        responses: [{ _key: "1", text: french, isCorrect: "1" }, ...wrongSpelling.map((wrongString, index) => ({ _key: (index + 2).toString(), text: wrongString }))],
    };
};

// Niveau 2-3
const getOrderWordsQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[], help: boolean = true): Question | null => {
    const { french, soundFr, nature, example, soundExample, _id } = vocabItem;
    const isExpression = nature === "expression";
    const textToSplit = isExpression ? french : example;
    if (!textToSplit || (!isExpression && help && !soundExample)) return null;

    const texts = help
        ? [`SOUNDBLOCKÉcoute et remets les mots dans le bon ordre.`, `SOUNDBLOCKRéorganise les mots pour former la phrase.`, `SOUNDBLOCKRéorganise les mots pour former la phrase correcte.`]
        : [`Réorganise les mots dans le bon ordre.`, `Réorganise les mots pour former la phrase correcte.`];
    const wordsList = removeTrailingPunctuation(textToSplit).trim().split(" ");
    const nbreOfWords = [...wordsList].length;

    const minimumWords = help ? 5 : 7;
    if (wordsList.length < 3) return null;
    if (wordsList.length < minimumWords) {
        while (wordsList.length < minimumWords) {
            let randomVoc = shuffleArray(vocabItems.filter((v) => v._id !== _id && nature === "expression"))[0] || shuffleArray(vocabItems.filter((v) => v._id !== _id))[0];
            if (!randomVoc) break;
            const randomWordText = shuffleArray(
                removeTrailingPunctuation(randomVoc.example || randomVoc.french)
                    .trim()
                    .split(" ")
            )
                .filter((w) => !wordsList.includes(w))
                .filter((_, index) => index % 2);
            wordsList.push(...randomWordText);
        }
        wordsList.length = minimumWords;
    }

    // Revoir isCorrect pour les mots en plus qu'ils ne soient pas pris en compte dans le résultat.

    return {
        _key: vocabItem._id + "orderWords" + (help ? "Easy" : ""),
        exerciseTypes: ["order"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
            sounds: [isExpression ? soundFr : soundExample || ""],
        },
        options: {},
        responses: wordsList.map((word, index) => ({ _key: (index + 1).toString(), text: word, isCorrect: index < nbreOfWords ? (index + 1).toString() : undefined })),
    };
};

// Niveau 1-3
const getRiddleQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[], buttons: boolean = false): Question | null => {
    const { french, soundFr, nature, soundExample, exerciseData } = vocabItem;
    const riddle = exerciseData?.riddle;
    if (!riddle) return null;
    console.log("reponses", getPossibleAnswers(vocabItem));
    const isExpression = nature === "expression";
    const possibleWrongAnswers = getPossibleWrongAnswers(vocabItem, vocabItems);
    const otherAnswers = buttons
        ? shuffleArray(possibleWrongAnswers)
              .slice(0, Math.min(3, possibleWrongAnswers.length))
              .map((v, index) => ({ _key: (index + 2).toString(), text: v.french, sound: v.soundFr }))
        : getPossibleAnswers(vocabItem).map((answer, index) => ({ _key: index.toString(), text: answer, isCorrect: "1" }));

    return {
        _key: vocabItem._id + "riddle",
        exerciseTypes: [buttons ? "buttons" : "input"],
        prompt: {
            text: riddle,
            sounds: [isExpression ? soundFr : soundExample || ""],
        },
        options: {},
        responses: [{ _key: "1", text: french, isCorrect: "1", sound: buttons ? soundFr : undefined }, ...otherAnswers],
    };
};

// Niveau 1-3
const getImageQuestion = (vocabItem: VocabItem, vocabItems: VocabItem[], buttons: boolean = false): Question | null => {
    const { french, soundFr, exerciseData } = vocabItem;
    const image = vocabItem.image;
    if (!image) return null;

    const possibleWrongAnswers = getPossibleWrongAnswers(vocabItem, vocabItems);
    const otherAnswers = buttons
        ? shuffleArray(possibleWrongAnswers)
              .slice(0, Math.min(3, possibleWrongAnswers.length))
              .map((v, index) => ({ _key: (index + 2).toString(), text: v.french, sound: v.soundFr }))
        : getPossibleAnswers(vocabItem).map((answer, index) => ({ _key: index.toString(), text: answer, isCorrect: "1" }));

    return {
        _key: vocabItem._id + "riddle",
        exerciseTypes: [buttons ? "buttons" : "input"],
        prompt: {
            text: "De quoi s'agit-il ?IMAGEBLOCK",
            images: [image],
        },
        options: {},
        responses: [{ _key: "1", text: french, isCorrect: "1", sound: buttons ? soundFr : undefined }, ...otherAnswers],
    };
};

// Niveau 2-3
const getTranslateToFrInputQuestion = (vocabItem: VocabItem, sound: boolean = true): Question | null => {
    const { english, soundFr } = vocabItem;
    const texts = sound
        ? ["Écris ce que tu entends.SOUNDBLOCK", "Écoute SOUNDSPAN et écris ce que tu as entendu."]
        : [`Écris la traduction de "${english}" en français.`, `Comment dit-on "${english}" en français ?`, `Quelle est la traduction de "${english}" ?`];
    const possibleAnswers = getPossibleAnswers(vocabItem);
    console.log("possibleAnswers", possibleAnswers);
    return {
        _key: vocabItem._id + "translateEnToFrInput" + (sound ? "Sound" : ""),
        exerciseTypes: ["input"],
        prompt: {
            text: texts[Math.floor(Math.random() * texts.length)],
            sounds: sound ? [soundFr] : undefined,
        },
        options: {},
        responses: possibleAnswers.map((answer, index) => ({ _key: index.toString(), text: answer, isCorrect: "1" })),
    };
};

const filterVocabItems = (item: VocabItem, filters: TabelVocFilters) => {
    const { status: filterStatus, tags: filterTags, nature: filterNature } = filters;
    const itemNature = (item.nature === "expression" ? "expressions" : "words") as "expressions" | "words" | "all";
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterTags?.length && !filterTags?.some((tag) => item.tags?.includes(tag))) return false;
    if (filterNature !== "all" && itemNature !== filterNature) return false;
    return true;
};

const PAIREDARTICLES = {
    le: "un ",
    la: "une ",
    un: "le ",
    une: "la ",
    les: "des ",
    des: "les ",
    apostrophe: "l'",
};

const getPossibleAnswers = (vocabItem: VocabItem) => {
    const { french, alternatives, exerciseData, nature } = vocabItem;
    const originalAnswers = [french, ...(alternatives || []), ...(exerciseData?.inputAnswers || [])];
    if (nature === "expression") return originalAnswers;

    const allAnswers = [];
    const articles = ["le", "la", "une", "un", "des", "les", "l"];

    for (let rohAnswer of originalAnswers) {
        const answer = rohAnswer.trim();
        allAnswers.push(answer);
        const firstWord = answer.split(" ")[0];
        const apostrophe = answer.split("'")[0];
        let article = articles.includes(firstWord) ? firstWord : apostrophe === "l" ? "l'" : null;
        if (article) {
            const noArticle = answer.replace(article, "").trim();
            allAnswers.push(noArticle);
            if (["un", "une"].includes(article) && ["a", "e", "i", "o", "u", "î", "ô", "â", "ê", "é", "è", "h"].includes(noArticle[0])) {
                article = "apostrophe";
            }
            if (article === "l'") allAnswers.push("un " + noArticle, "une " + noArticle);
            else allAnswers.push(PAIREDARTICLES[article as keyof typeof PAIREDARTICLES] + noArticle);
        }
    }

    return allAnswers;
};
