"use client";
import React, { useState } from "react";
import { Popover as TinyPopover } from "react-tiny-popover";

interface PopoverProps {
    content: React.ReactNode;
    popover: React.ReactNode;
    small?: boolean;
    reposition?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({ content, popover, small = false, reposition = true }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <span onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <TinyPopover
                reposition={reposition}
                isOpen={isOpen}
                positions={["top", "bottom", "right", "left"]}
                content={
                    <div className={`bg-neutral-100 simple-border shadow-1 p-4 m-2 ${small ? "bs" : ""}`} style={{ maxWidth: "min(90vw, 400px)" }}>
                        <div id="popoverContent">{popover}</div>
                    </div>
                }
            >
                <span className="inline-block">{content}</span>
            </TinyPopover>
        </span>
    );
};
