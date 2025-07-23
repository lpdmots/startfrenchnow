import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { PrivateLesson } from "../types/sfn/lessons";

type PostLangProps = "en" | "fr" | null;

interface DefaultProps {
    postLang: PostLangProps;
    privateLessons: PrivateLesson[];
}

interface SfnStore extends DefaultProps {
    updatePostLang: (newPostLang: PostLangProps) => void;
    setPrivateLesson: (newPrivateLessons: PrivateLesson) => void;
}

const DEFAULT_PROPS: DefaultProps = {
    postLang: null,
    privateLessons: [],
};

export const useSfnStore = create<SfnStore>()(
    devtools(
        persist(
            (set) => ({
                ...DEFAULT_PROPS,
                updatePostLang: (newPostLang: PostLangProps) => set((state) => ({ ...state, postLang: newPostLang }), false, "setNewPostLang"),
                setPrivateLesson: (newPrivateLessons: PrivateLesson) =>
                    set(
                        (state) => ({ ...state, privateLessons: [...state.privateLessons.filter((lesson) => lesson.eventType !== newPrivateLessons.eventType), newPrivateLessons] }),
                        false,
                        "setNewPrivateLesson"
                    ),
            }),
            {
                name: "sfn-storage",
            }
        )
    )
);
