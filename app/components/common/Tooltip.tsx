import React, { useState } from "react";

const Tooltip = ({ children, tooltipContent }: { children: JSX.Element; tooltipContent: JSX.Element }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = () => {
        setShowTooltip(!showTooltip);
    };

    return (
        <>
            <button data-popover-target="popover-company-profile" type="button">
                {children}
            </button>
            <div
                data-popover
                id="popover-company-profile"
                role="tooltip"
                className="absolute z-10 invisible inline-block text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 w-80 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-600"
            >
                {tooltipContent}
            </div>
            <div data-popper-arrow></div>
        </>
    );
};

export default Tooltip;
