/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
    darkMode: ["class"],
    content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],

    safelist: [
        {
            pattern: /\[.*\]/, // Pattern pour capturer toutes les classes dynamiques avec des crochets
        },
    ],
    theme: {
        screens: {
            sm: "480px",
            md: "768px",
            lg: "992px",
            xl: "1200px",
        },
        container: {
            center: "true",
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        colors: {
            primary: "var(--primary)",
            "secondary-1": "var(--secondary-1)",
            "secondary-2": "var(--secondary-2)",
            "secondary-3": "var(--secondary-3)",
            "secondary-4": "var(--secondary-4)",
            "secondary-5": "var(--secondary-5)",
            "secondary-6": "var(--secondary-6)",
            primaryShades: "var(--primaryShades)",
            "secondaryShades-1": "var(--secondaryShades-1)",
            "secondaryShades-2": "var(--secondaryShades-2)",
            "secondaryShades-3": "var(--secondaryShades-3)",
            "secondaryShades-4": "var(--secondaryShades-4)",
            "secondaryShades-5": "var(--secondaryShades-5)",
            "neutral-100": "var(--neutral-100)",
            "neutral-200": "var(--neutral-200)",
            "neutral-300": "var(--neutral-300)",
            "neutral-400": "var(--neutral-400)",
            "neutral-500": "var(--neutral-500)",
            "neutral-600": "var(--neutral-600)",
            "neutral-700": "var(--neutral-700)",
            "neutral-750": "var(--neutral-750)",
            "neutral-800": "var(--neutral-800)",
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-poppins)", ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
                marquee: {
                    from: {
                        transform: "translateX(0)",
                    },
                    to: {
                        transform: "translateX(calc(-100% - var(--gap)))",
                    },
                },
                "marquee-vertical": {
                    from: {
                        transform: "translateY(0)",
                    },
                    to: {
                        transform: "translateY(calc(-100% - var(--gap)))",
                    },
                },
                "shimmer-slide": {
                    to: {
                        transform: "translate(calc(100cqw - 100%), 0)",
                    },
                },
                "spin-around": {
                    "0%": {
                        transform: "translateZ(0) rotate(0)",
                    },
                    "15%, 35%": {
                        transform: "translateZ(0) rotate(90deg)",
                    },
                    "65%, 85%": {
                        transform: "translateZ(0) rotate(270deg)",
                    },
                    "100%": {
                        transform: "translateZ(0) rotate(360deg)",
                    },
                },
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                marquee: "marquee var(--duration) linear infinite",
                "marquee-vertical": "marquee-vertical var(--duration) linear infinite",
                "shimmer-slide": "shimmer-slide var(--speed) ease-in-out infinite alternate",
                "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
