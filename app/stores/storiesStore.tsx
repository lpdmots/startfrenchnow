import { Adventure, Heros, VariableState } from "@/app/types/stories/adventure";
import { Choice } from "@/app/types/stories/element";
import { AccessState, ChoiceProps, ElementDataProps, ElementsDataProps, LayoutProps } from "@/app/types/stories/state";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface DefaultProps {
    story: null | Adventure;
    chapter: string;
    actualElementId: string;
    inheritedChoices: Choice[];
    layouts: LayoutProps[];
    slideIndex: number;
    elementsData: ElementsDataProps;
    selectedHerosIndex: 0;
    heros: null | Heros;
    variables: { [key: string]: VariableState };
    access: AccessState;
    count: { [key: string]: number };
    selectedStoryTabsIndex: number;
}

interface StoryState extends DefaultProps {
    resetData: () => void;
    setNewStates: (newStates: { [key: string]: any }) => void;
    updateVariables: (newVariables: { [key: string]: VariableState }) => void;
    addElementsData: (key: string, elementData: ElementDataProps) => void;
    updateOnChoice: (choice: ChoiceProps) => void;
    setSelectedStoryTabsIndex: (index: number) => void;
}

const DEFAULT_PROPS: DefaultProps = {
    story: null,
    chapter: "",
    actualElementId: "",
    inheritedChoices: [],
    layouts: [],
    slideIndex: 0,
    elementsData: {},
    heros: null,
    variables: {},
    selectedHerosIndex: 0,
    selectedStoryTabsIndex: 0,
    access: {},
    count: {},
};

export const useStoryStore = create<StoryState>()(
    devtools(
        persist(
            (set) => ({
                ...DEFAULT_PROPS,
                resetData: () => set((state) => ({ ...state, ...DEFAULT_PROPS }), true, "resetData"),
                setNewStates: (newStates) => set((state) => ({ ...state, ...newStates }), false, "setNewStates"),
                updateVariables: (newVariables) => set((state) => ({ ...state, variables: { ...state.variables, ...newVariables } }), false, "updateVariables"),
                addElementsData: (key, elementData) => set((state) => ({ ...state, elementsData: { ...state.elementsData, [key]: elementData } }), false, "addElementsData"),
                setSelectedStoryTabsIndex: (index) => set((state) => ({ ...state, selectedStoryTabsIndex: index }), false, "setSelectedStoryTabsIndex"),
                updateOnChoice: (choice) =>
                    set(
                        (state) => {
                            return {
                                ...state,
                                layouts: state.elementsData[choice._id].layouts,
                                elementsData: {},
                                chapter: choice.code,
                                actualElementId: choice.elementId || state.actualElementId,
                                inheritedChoices: state.elementsData[choice._id].inheritedChoices,
                                slideIndex: 0,
                                count: getNewCount(state, choice),
                                variables: { ...state.variables, ...state.elementsData[choice._id].variablesToUpdate },
                                access: { ...state.access, ...state.elementsData[choice._id].access },
                            };
                        },
                        false,
                        "updateOnChoice"
                    ),
            }),
            {
                name: "story-storage",
            }
        )
    )
);

const getNewCount = (state: StoryState, choice: ChoiceProps) => {
    const count = { ...state.count };
    state.elementsData[choice._id].countIds.forEach((id) => {
        count[id] = (count[id] || 0) + 1;
    });
    return count;
};
