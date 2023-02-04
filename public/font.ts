import localFont from "@next/font/local";

// Font files can be colocated inside of `app`
export const onest = localFont({
    src: [
        {
            path: "../public/font/thin-hint.woff",
            weight: "100",
            style: "thin",
        },
        {
            path: "../public/font/light-hint.woff",
            weight: "300",
            style: "light",
        },
        {
            path: "../public/font/regular-hint.woff",
            weight: "400",
            style: "normal",
        },
        {
            path: "../public/font/medium-hint.woff",
            weight: "500",
            style: "medium",
        },
        {
            path: "../public/font/bold-hint.woff",
            weight: "700",
            style: "bold",
        },
        {
            path: "../public/font/extrabold-hint.woff",
            weight: "800",
            style: "extrabold",
        },

        {
            path: "../public/font/black-hint.woff",
            weight: "900",
            style: "black",
        },
    ],
    // default, can also use "swap" to ensure custom font always shows
    variable: "--font-onest",
    display: "optional",
});
