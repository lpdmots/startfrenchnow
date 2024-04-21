"use client";
import SimpleButton from "../../animations/SimpleButton";
import { motion } from "framer-motion";
import { useExerciseStore } from "@/app/stores/exerciseStore";
import { LevelChoice } from "@/app/types/sfn/blog";
import { useSfnStore } from "@/app/stores/sfnStore";

export const LevelChoiceButtons = ({ _id }: { _id: string }) => {
    const { postLang } = useSfnStore();
    const { getExercise, setLevelChoice, setStatus, resetScore } = useExerciseStore();
    const { levelChoice } = getExercise(_id);

    const handleLevel = (value: LevelChoice) => {
        if (levelChoice !== value) {
            resetScore(_id);
            setLevelChoice(_id, value);
            setStatus(_id, "fetching");
        }
    };

    return (
        <div className="flex w-full justify-center gap-4 mb-4">
            <p className="underline text-bold mb-0">{postLang === "fr" ? "Difficulté :" : "Difficulty:"}</p>
            <SimpleButton>
                <div className="tab-lang">
                    <span className={`flex items-center ${levelChoice === "level1" && "text-secondary-5 bold"}`} onClick={() => handleLevel("level1")} style={{ maxWidth: 200, padding: 8 }}>
                        <span>{postLang === "fr" ? "1" : "1"}</span>
                    </span>
                    {levelChoice === "level1" ? <motion.div className="tab-underline bg-secondary-5" style={{ height: 2 }} layoutId="underline-2" /> : null}
                </div>
            </SimpleButton>
            <SimpleButton>
                <div className="tab-lang">
                    <span className={`flex items-center ${levelChoice === "level2" && "text-secondary-1 bold"}`} onClick={() => handleLevel("level2")} style={{ maxWidth: 200, padding: 8 }}>
                        <span>{postLang === "fr" ? "2" : "2"}</span>
                    </span>
                    {levelChoice === "level2" ? <motion.div className="tab-underline bg-secondary-1" style={{ height: 2 }} layoutId="underline-2" /> : null}
                </div>
            </SimpleButton>
            <SimpleButton>
                <div className="tab-lang">
                    <span className={`flex items-center ${levelChoice === "level3" && "text-secondary-4 bold"}`} onClick={() => handleLevel("level3")} style={{ maxWidth: 200, padding: 8 }}>
                        <span>{postLang === "fr" ? "3" : "3"}</span>
                    </span>
                    {levelChoice === "level3" ? <motion.div className="tab-underline bg-secondary-4" style={{ height: 2 }} layoutId="underline-2" /> : null}
                </div>
            </SimpleButton>
        </div>
    );
};
