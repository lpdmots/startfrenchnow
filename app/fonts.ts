import localFont from "next/font/local";

export const poppins = localFont({
    src: [
        {
            path: "../node_modules/@fontsource/poppins/files/poppins-latin-400-normal.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/poppins/files/poppins-latin-500-normal.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2",
            weight: "700",
            style: "normal",
        },
    ],
    display: "swap",
    variable: "--font-poppins",
    fallback: ["Arial", "sans-serif"],
    preload: true,
});
