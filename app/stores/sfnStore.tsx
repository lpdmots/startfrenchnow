import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

type PostLangProps = "en" | "fr" | null;

interface DefaultProps {
    postLang: PostLangProps;
}

interface SfnStore extends DefaultProps {
    updatePostLang: (newPostLang: PostLangProps) => void;
}

const DEFAULT_PROPS: DefaultProps = {
    postLang: null,
};

export const useSfnStore = create<SfnStore>()(
    devtools(
        persist(
            (set) => ({
                ...DEFAULT_PROPS,
                updatePostLang: (newPostLang: PostLangProps) => set((state) => ({ ...state, postLang: newPostLang }), false, "setNewPostLang"),
            }),
            {
                name: "sfn-storage",
            }
        )
    )
);
