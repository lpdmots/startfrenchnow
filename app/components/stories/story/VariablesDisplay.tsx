import { convertMinutesToTime } from "@/app/lib/utils";
import { useStoryStore } from "@/app/stores/storiesStore";
import React from "react";
import { BiTime } from "react-icons/bi";

export const VariablesDisplay = () => {
    const { variables } = useStoryStore();
    const variablesToDisplay = Object.values(variables).filter((variable) => ["static", "dynamique"].includes(variable.data?.nature || "") && variable.data?.display?.name);

    return (
        <div>
            {variablesToDisplay.map((variable) => (
                <VariableDisplay key={variable.data?._id} variable={variable} />
            ))}
        </div>
    );
};

const VariableDisplay = ({ variable }: { variable: any }) => {
    if (variable.data.name === "time") return <TimeDisplay variable={variable} />;
    return <p>Affichage à faire</p>;
};

const TimeDisplay = ({ variable }: { variable: any }) => {
    return (
        <div className="flex items-center justify-start">
            <BiTime className="mr-2 text-2xl" />
            <p className="m-0 font-bold">{convertMinutesToTime(parseInt(variable.value))}</p>
        </div>
    );
};
