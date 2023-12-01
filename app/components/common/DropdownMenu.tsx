"use client";
import React, { ReactNode, useRef, useState } from "react";
import { ContentRenderer, Popover } from "react-tiny-popover";

interface DropdownProps {
    content: ReactNode;
    children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownProps> = ({ content, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMouseOverPopover, setIsMouseOverPopover] = useState(false);
    const closeTimer = useRef<NodeJS.Timeout | null>(null); // pour stocker le timer

    const handleContentMouseEnter = () => {
        setIsMouseOverPopover(true);
        if (closeTimer.current) {
            clearTimeout(closeTimer.current);
        }
    };

    const handleContentMouseLeave = () => {
        setIsMouseOverPopover(false);
        closeTimer.current = setTimeout(() => setIsOpen(false), 200); // 1000ms = 1 seconde
    };

    const contentWithHandlers = (
        <div onMouseEnter={handleContentMouseEnter} onMouseLeave={handleContentMouseLeave}>
            {content}
        </div>
    );

    return (
        <Popover isOpen={isOpen} positions={["bottom"]} onClickOutside={() => setIsOpen(false)} content={contentWithHandlers}>
            <div
                className="cursor-pointer"
                onMouseEnter={() => {
                    setIsOpen(true);
                    if (closeTimer.current) {
                        clearTimeout(closeTimer.current);
                    }
                }}
                onMouseLeave={() => {
                    if (!isMouseOverPopover) {
                        closeTimer.current = setTimeout(() => setIsOpen(false), 200);
                    }
                }}
            >
                {children}
            </div>
        </Popover>
    );
};

export default DropdownMenu;
