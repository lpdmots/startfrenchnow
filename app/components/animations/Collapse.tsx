"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    content: JSX.Element;
    children: JSX.Element;
}

const Collapse = ({ content, children }: Props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div>
            <AnimatePresence>
                <motion.div key="question" onClick={() => setIsOpen(!isOpen)}>
                    {children}
                </motion.div>

                {isOpen && (
                    <motion.div
                        key="answer"
                        initial={{ maxHeight: 0, overflow: "hidden" }}
                        animate={{
                            maxHeight: [0, 3000],
                            transition: {
                                duration: 1,
                            },
                        }}
                        exit={{ maxHeight: 0 }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Collapse;
