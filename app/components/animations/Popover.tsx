"use client";
import clsx from "clsx";
import React, { useState } from "react";
import { Popover as TinyPopover } from "react-tiny-popover";

interface PopoverProps {
    content: React.ReactNode;
    popover: React.ReactNode;
    small?: boolean;
    reposition?: boolean;
    isOnClick?: boolean;
    withShadow?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({ content, popover, small = false, reposition = true, isOnClick = false, withShadow = true }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <span onClick={isOnClick ? () => setIsOpen(!isOpen) : undefined} onMouseEnter={!isOnClick ? () => setIsOpen(true) : undefined} onMouseLeave={!isOnClick ? () => setIsOpen(false) : undefined}>
            <TinyPopover
                reposition={reposition}
                isOpen={isOpen}
                positions={["top", "bottom", "right", "left"]}
                onClickOutside={() => setIsOpen(false)}
                content={
                    <div className={clsx("bg-neutral-100 simple-border p-4 m-2", { "shadow-1": withShadow, small })} style={{ maxWidth: "min(90vw, 400px)" }}>
                        <div id="popoverContent">{popover}</div>
                    </div>
                }
            >
                <span className="inline-block">{content}</span>
            </TinyPopover>
        </span>
    );
};
