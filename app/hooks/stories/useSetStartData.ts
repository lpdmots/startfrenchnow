import { Adventure, Variable } from "@/app/types/stories/adventure";
import { useStoryStore } from "@/app/stores/storiesStore";
import { useVariable } from "./useVariable";

export const useSetStartData = () => {
    const { selectedHerosIndex, setNewStates } = useStoryStore();
    const { addVariables } = useVariable();

    const setStartData = (story: Adventure) => {
        const selectedHeros = story.heros[selectedHerosIndex];
        const { statistics, variables: herosVariables, ...herosData } = selectedHeros;

        // Treat variables
        const timeVariable = getTimeVariable(story) as Variable[];
        const variablesData = [...(story?.variables || []), ...(herosVariables || []), ...timeVariable];
        addVariables(variablesData);

        // Add heros data, story and chapter to the state
        setNewStates({ gameDate: Date.now(), heros: { ...herosData, ...statsListToObject(statistics) }, story, chapter: "1" });
    };

    return setStartData;
};

const statsListToObject = (stats: { [key: string]: string | number }[]) => {
    return stats.reduce((acc, cur) => {
        return { ...acc, [cur.name]: cur.value };
    }, {});
};

const getTimeVariable = (story: Adventure) => {
    if (!story.startTime) return [];

    return [
        {
            _id: "time",
            name: "time",
            nature: "static",
            defaultValue: story.startTime,
            onMountEffects: [],
            unMountEffects: [],
            display: { name: "time" },
        },
    ] as unknown as Variable[];
};
