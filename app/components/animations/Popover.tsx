import Tippy from "@tippyjs/react/headless"; // different import path!

interface PopoverProps {
    content: React.ReactNode;
    popover: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ content, popover }) => (
    <Tippy
        render={(attrs) => (
            <div className="bg-neutral-100 simple-border shadow-1 p-4" {...attrs}>
                <div>{popover}</div>
            </div>
        )}
    >
        <span className="inline-block">{content}</span>
    </Tippy>
);
