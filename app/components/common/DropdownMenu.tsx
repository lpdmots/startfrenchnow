"use client";
import React, { useState } from "react";
import { ContentRenderer, Popover } from "react-tiny-popover";

interface DropdownProps {
    content: JSX.Element | ContentRenderer;
    children: React.ReactNode;
}

const DropdownMenu: React.FC<DropdownProps> = ({ content, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Popover isOpen={isOpen} positions={["bottom"]} onClickOutside={() => setIsOpen(false)} content={content}>
            <div onClick={() => setIsOpen(!isOpen)}>{children}</div>
        </Popover>
    );
};

export default DropdownMenu;
