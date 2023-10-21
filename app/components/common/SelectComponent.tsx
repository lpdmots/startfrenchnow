import React, { FC, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import useOutsideClick from "@/app/hooks/useOutsideClick";

interface Option {
    value: string;
    label: string;
}

interface SelectComponentProps {
    options: Option[];
    label?: string;
    onChange: any;
    value: string;
    minWidth?: number;
}

const SelectComponent: FC<SelectComponentProps> = ({ options, label, onChange, value, minWidth = 150 }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find((option) => option.value === value);
    const ref = useRef(null);

    const handleOptionClick = (option: Option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    useOutsideClick(ref, () => {
        setIsOpen(false);
    });

    const content = useMemo(
        () =>
            options.map((option, index) => {
                return (
                    <div key={index} className="text-left m-0 p-4 select-option" onClick={() => handleOptionClick(option)}>
                        <p className="bs mb-0">{option.label}</p>
                    </div>
                );
            }),
        [handleOptionClick, options]
    );

    return (
        <div ref={ref} className="select-container" style={{ minWidth }}>
            {label && <label>{label}</label>}
            <div className="select-selected badge-secondary small cursor-pointer w-full text-left" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex justify-between w-full">
                    <p className="mb-0">{selectedOption?.label}</p>
                    {isOpen ? <FaCaretUp /> : <FaCaretDown />}
                </div>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="select-options badge-secondary block p-0 overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{
                            opacity: 1,
                            height: "auto",
                            transition: {
                                ease: "linear",
                                duration: 0.2,
                            },
                        }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SelectComponent;
