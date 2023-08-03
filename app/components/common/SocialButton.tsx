"use client";
import { m } from "framer-motion";

interface Props {
    children: React.ReactNode;
    bg?: string;
    bgHover?: string;
    border?: boolean;
    onClickFunction?: any;
}

export const SocialButton = ({ children, bg, bgHover, border = true, onClickFunction }: Props) => {
    return (
        <m.button
            whileHover={{ y: -4 }} // orange sur hover
            whileTap={{ scale: 0.4 }} // réduit la taille à 90% sur click
            transition={{ duration: 0.1 }}
            onClick={onClickFunction}
            className={`roundButton relative ${bgHover}`}
            style={{ border: border ? "3px solid var(--neutral-800)" : "none", backgroundColor: bg }}
        >
            {children}
        </m.button>
    );
};
