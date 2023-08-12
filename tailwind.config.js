/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],

    theme: {
        screens: {
            sm: "480px",
            md: "768px",
            lg: "992px",
        },
        colors: {
            primary: "var(--primary)",
            "secondary-1": "var(--secondary-1)",
            "secondary-2": "var(--secondary-2)",
            "secondary-3": "var(--secondary-3)",
            "secondary-4": "var(--secondary-4)",
            "secondary-5": "var(--secondary-5)",
            "neutral-100": "var(--neutral-100)",
            "neutral-200": "var(--neutral-200)",
            "neutral-300": "var(--neutral-300)",
            "neutral-400": "var(--neutral-400)",
            "neutral-500": "var(--neutral-500)",
            "neutral-600": "var(--neutral-600)",
            "neutral-700": "var(--neutral-700)",
            "neutral-800": "var(--neutral-800)",
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-poppins)", ...defaultTheme.fontFamily.sans],
            },
        },
    },
    plugins: [],
};
