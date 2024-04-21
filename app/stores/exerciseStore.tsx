import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { Exercise, LevelChoice, Question } from "../types/sfn/blog";

type Status = "off" | "fetching" | "inGame" | "finished";

interface ExerciseData {
    status: Status;
    levelChoice: LevelChoice;
    score: number;
    scoreMax: number;
    currentMaxScore: number;
    questions: Question[];
    questionIndex: number;
    data: Exercise | null;
    showAnswers: { [key: string]: boolean | undefined };
}

interface ExerciseStore {
    exercises: Record<string, ExerciseData>;
    getExercise: (id: string) => ExerciseData;
    initializeExercise: (id: string, data: Exercise) => void;
    setScoreMax: (id: string, scoreMax: number) => void;
    setStatus: (id: string, status: Status) => void;
    setLevelChoice: (id: string, levelChoice: LevelChoice) => void;
    setQuestions: (id: string, questions: Question[]) => void;
    setQuestionIndex: (id: string, index: number) => void;
    setShowAnswers: (id: string, questionKey: string, isShowed: boolean) => void;
    updateScore: (id: string, toAdd: number, shouldBe: number) => void;
    resetScore: (id: string) => void;
    restart: (id: string) => void;
}

const DEFAULT_PROPS: ExerciseData = {
    status: "off",
    levelChoice: "level1",
    score: 0,
    scoreMax: 0,
    currentMaxScore: 0,
    questions: [],
    questionIndex: 0,
    data: null,
    showAnswers: {},
};

const updateExercise = (state: ExerciseStore, id: string, changes: Partial<ExerciseData>): ExerciseStore => {
    if (state.exercises[id]) {
        return {
            ...state,
            exercises: {
                ...state.exercises,
                [id]: {
                    ...state.exercises[id],
                    ...changes,
                },
            },
        };
    }
    return state;
};

const createStore: StateCreator<ExerciseStore> = (set, get) => ({
    exercises: {},
    getExercise: (id: string) => get().exercises[id] || DEFAULT_PROPS,
    initializeExercise: (id: string, data: Exercise) => {
        if (!get().exercises[id]) {
            set((state) => ({ exercises: { ...state.exercises, [id]: { ...DEFAULT_PROPS, data } } }));
        }
    },
    setScoreMax: (id: string, scoreMax: number) => {
        set((state) => updateExercise(state, id, { scoreMax }));
    },
    setStatus: (id: string, status: Status) => {
        set((state) => updateExercise(state, id, { status }));
    },
    setLevelChoice: (id: string, levelChoice: LevelChoice) => {
        set((state) => updateExercise(state, id, { levelChoice }));
    },
    setQuestions: (id: string, questions: Question[]) => {
        set((state) => updateExercise(state, id, { questions }));
    },
    setQuestionIndex: (id: string, index: number) => {
        set((state) => updateExercise(state, id, { questionIndex: index }));
    },
    setShowAnswers: (id: string, questionKey: string, isShowed: boolean) => {
        set((state) => updateExercise(state, id, { showAnswers: { ...state.exercises[id].showAnswers, [questionKey]: isShowed } }));
    },
    updateScore: (id: string, toAdd: number, shouldBe: number) => {
        const exercise = get().exercises[id];
        if (exercise) {
            set((state) => updateExercise(state, id, { score: exercise.score + toAdd, currentMaxScore: exercise.currentMaxScore + shouldBe }));
        }
    },
    resetScore: (id: string) => {
        set((state) => updateExercise(state, id, { score: 0, currentMaxScore: 0, questionIndex: 0, showAnswers: {}, scoreMax: 0 }));
    },
    restart: (id: string) => {
        const { data } = get().exercises[id];
        set((state) => updateExercise(state, id, { ...DEFAULT_PROPS, data, status: "fetching" }));
    },
});

const useExerciseStore = process.env.NODE_ENV === "development" ? create<ExerciseStore>()(devtools(createStore)) : create<ExerciseStore>(createStore);
export { useExerciseStore };
