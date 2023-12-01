import React, { useState } from "react";
import { Popover as TinyPopover } from "react-tiny-popover";

interface PopoverProps {
    content: React.ReactNode;
    popover: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ content, popover }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <span onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <TinyPopover
                isOpen={isOpen}
                positions={["top", "bottom", "right", "left"]}
                content={
                    <div className="bg-neutral-100 simple-border shadow-1 p-2 m-2" style={{ maxWidth: "90vw", borderRadius: 10 }}>
                        <div id="popoverContent">{popover}</div>
                    </div>
                }
            >
                <span className="inline">{content}</span>
            </TinyPopover>
        </span>
    );
};
