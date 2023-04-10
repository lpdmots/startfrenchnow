import { Adventure } from "@/app/types/stories/adventure";
import { useStoryStore } from "@/stores/storiesStore";
import { useVariable } from "./useVariable";

export const useSetStartData = () => {
    const { selectedHerosIndex, setNewStates } = useStoryStore();
    const { addVariables } = useVariable();

    const setStartData = (story: Adventure) => {
        const selectedHeros = story.heros[selectedHerosIndex];
        const { statistics, variables: herosVariables, ...herosData } = selectedHeros;

        // Treat variables
        const variablesData = [...(story?.variables || []), ...(herosVariables || [])];
        addVariables(variablesData);

        // Add heros data, story and chapter to the state
        setNewStates({ heros: { ...herosData, ...statsListToObject(statistics) }, story, chapter: "1" });
    };

    return setStartData;
};

const statsListToObject = (stats: { [key: string]: string | number }[]) => {
    return stats.reduce((acc, cur) => {
        return { ...acc, [cur.name]: cur.value };
    }, {});
};
