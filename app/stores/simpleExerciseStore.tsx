import { create, StateCreator } from "zustand";
import { devtools } from "zustand/middleware";
import { SimpleQuestion } from "../types/sfn/blog";

type Status = "off" | "fetching" | "inGame" | "finished";

interface ExerciseData {
    status: Status;
    score: number;
    questions: SimpleQuestion[];
    questionIndex: number;
}

interface SimpleExerciseStore {
    exercises: Record<string, ExerciseData>;
    getExercise: (id: string) => ExerciseData;
    initializeExercise: (id: string) => void;
    setStatus: (id: string, status: Status) => void;
    setQuestions: (id: string, questions: SimpleQuestion[]) => void;
    setQuestionIndex: (id: string, index: number) => void;
    addScore: (id: string) => void;
    resetScore: (id: string) => void;
    restart: (id: string) => void;
}

const DEFAULT_PROPS: ExerciseData = {
    status: "off",
    score: 0,
    questions: [],
    questionIndex: 0,
};

const updateExercise = (state: SimpleExerciseStore, id: string, changes: Partial<ExerciseData>): SimpleExerciseStore => {
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

const createStore: StateCreator<SimpleExerciseStore> = (set, get) => ({
    exercises: {},
    getExercise: (id: string) => get().exercises[id] || DEFAULT_PROPS,
    initializeExercise: (id: string) => {
        if (!get().exercises[id]) {
            set((state) => ({ exercises: { ...state.exercises, [id]: DEFAULT_PROPS } }));
        }
    },
    setStatus: (id: string, status: Status) => {
        set((state) => updateExercise(state, id, { status }));
    },
    setQuestions: (id: string, questions: SimpleQuestion[]) => {
        set((state) => updateExercise(state, id, { questions }));
    },
    setQuestionIndex: (id: string, index: number) => {
        set((state) => updateExercise(state, id, { questionIndex: index }));
    },
    addScore: (id: string) => {
        const exercise = get().exercises[id];
        if (exercise) {
            set((state) => updateExercise(state, id, { score: exercise.score + 1 }));
        }
    },
    resetScore: (id: string) => {
        set((state) => updateExercise(state, id, { score: 0 }));
    },
    restart: (id: string) => {
        set((state) => updateExercise(state, id, { ...DEFAULT_PROPS, status: "fetching" }));
    },
});

const useSimpleExerciseStore = process.env.NODE_ENV === "development" ? create<SimpleExerciseStore>()(devtools(createStore)) : create<SimpleExerciseStore>(createStore);
export { useSimpleExerciseStore };
