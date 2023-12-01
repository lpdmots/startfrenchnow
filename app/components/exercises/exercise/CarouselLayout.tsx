import { AnimatePresence, m } from "framer-motion";
import { useState } from "react";

export const CarouselLayout = ({ currentQuestionIndex, children, delay = 0 }: { currentQuestionIndex: number; children: JSX.Element; delay?: number }) => {
    const [initialKey] = useState(Date.now()); // pour éviter l'animation à chaque rerender.

    return (
        <AnimatePresence mode="wait">
            <m.div
                className="w-full grow flex-col flex justify-around items-center gap-8"
                key={currentQuestionIndex ? currentQuestionIndex : initialKey}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, type: "spring", delay }}
            >
                {children}
            </m.div>
        </AnimatePresence>
    );
};
