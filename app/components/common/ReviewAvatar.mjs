import { createElement } from "react";

const sizes = {
    default: {
        outer: "h-[100px] w-[100px]",
        inner: "h-[100px] w-[100px]",
        pixels: 100,
        scale: 1,
    },
    compact: {
        outer: "h-14 w-14",
        inner: "h-[100px] w-[100px] scale-[0.56]",
        pixels: 56,
        scale: 0.56,
    },
    modal: {
        outer: "h-16 w-16",
        inner: "h-[100px] w-[100px] scale-[0.64]",
        pixels: 64,
        scale: 0.64,
    },
};

/**
 * Enforces square geometry before circular clipping so arbitrary review artwork
 * cannot stretch the visible avatar into an oval.
 *
 * @param {{ children: import("react").ReactNode, size?: keyof typeof sizes }} props
 */
export function ReviewAvatar({ children, size = "default" }) {
    const selectedSize = sizes[size] ?? sizes.default;

    return createElement(
        "div",
        {
            className: `${selectedSize.outer} shrink-0 overflow-hidden rounded-full bg-neutral-300`,
            style: {
                width: `${selectedSize.pixels}px`,
                height: `${selectedSize.pixels}px`,
                flexShrink: 0,
                overflow: "hidden",
                borderRadius: "9999px",
            },
        },
        createElement(
            "div",
            {
                className: `${selectedSize.inner} origin-top-left [&>*]:!h-[100px] [&>*]:!w-[100px]`,
                style: {
                    width: "100px",
                    height: "100px",
                    transform: `scale(${selectedSize.scale})`,
                    transformOrigin: "top left",
                },
            },
            children,
        ),
    );
}
