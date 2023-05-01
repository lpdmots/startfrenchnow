import Tippy from "@tippyjs/react/headless"; // different import path!

interface PopoverProps {
    content: React.ReactNode;
    popover: React.ReactNode;
    small?: boolean;
}

export const Popover: React.FC<PopoverProps> = ({ content, popover, small = false }) => (
    <Tippy
        render={(attrs) => (
            <div className="bg-neutral-100 simple-border shadow-1 p-4 m-0" {...attrs}>
                <div id="popoverContent" className={small ? "bs" : ""}>
                    {popover}
                </div>
            </div>
        )}
    >
        <span className="inline-block">{content}</span>
    </Tippy>
);
