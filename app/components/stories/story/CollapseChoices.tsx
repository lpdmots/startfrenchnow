"use client";
import useOutsideClick from "@/app/hooks/useOutsideClick";
import { AnimatePresence, m } from "framer-motion";
import { useRef, useState } from "react";
import { IoCaretDown, IoCaretUp, IoFootstepsOutline } from "react-icons/io5";
import { MdOutlineAdsClick } from "react-icons/md";

interface Props {
    collapseData: JSX.Element;
    type: "primary" | "secondary";
    label: string;
}

export const CollapseChoices = ({ collapseData, type, label }: Props) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const ref = useRef(null);
    const buttonClass = type === "primary" ? "btn-select-primary" : "btn-select-secondary";

    useOutsideClick(ref, () => {
        setExpanded(false);
    });

    return (
        <div className="col-span-2 sm:col-span-1 relative" ref={ref}>
            <AnimatePresence initial={false}>
                {expanded && (
                    <m.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1 },
                            collapsed: { opacity: 0 },
                        }}
                        transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="absolute w-full pb-3 md:pb-6"
                        style={{ zIndex: 1000, transform: "translateY(-100%)", maxHeight: "70vh", overflowY: "auto" }}
                    >
                        {collapseData}
                    </m.div>
                )}
            </AnimatePresence>
            <m.div initial={false} onClick={() => setExpanded((state) => !state)}>
                <button className={`${buttonClass} btn-choice small`}>
                    <span className="flex items-center">{type === "primary" ? <MdOutlineAdsClick className="mr-2 text-3xl" /> : <IoFootstepsOutline className="mr-2 text-3xl" />}</span>
                    {label}
                    <span className="flex items-center">{!expanded ? <IoCaretUp className="ml-2" /> : <IoCaretDown className="ml-2" />}</span>
                </button>
            </m.div>
        </div>
    );
};
