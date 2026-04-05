/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");
const withOpacity = (cssVariable) => `rgb(var(${cssVariable}) / <alpha-value>)`;

module.exports = {
    darkMode: ["class"],
    content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],

    safelist: ["msw-sm", "msw-md", "msw-lg"],
    theme: {
        screens: {
            sm: "480px",
            md: "768px",
            lg: "992px",
            xl: "1200px",
            xxl: "1536px",
        },
        container: {
            center: "true",
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                background: withOpacity("--background-rgb"),
                foreground: withOpacity("--foreground-rgb"),
                card: {
                    DEFAULT: withOpacity("--card-rgb"),
                    foreground: withOpacity("--card-foreground-rgb"),
                },
                popover: {
                    DEFAULT: withOpacity("--popover-rgb"),
                    foreground: withOpacity("--popover-foreground-rgb"),
                },
                primary: {
                    DEFAULT: withOpacity("--primary-rgb"),
                    foreground: withOpacity("--primary-foreground-rgb"),
                },
                secondary: {
                    DEFAULT: withOpacity("--secondary-rgb"),
                    foreground: withOpacity("--secondary-foreground-rgb"),
                },
                muted: {
                    DEFAULT: withOpacity("--muted-rgb"),
                    foreground: withOpacity("--muted-foreground-rgb"),
                },
                accent: {
                    DEFAULT: withOpacity("--accent-rgb"),
                    foreground: withOpacity("--accent-foreground-rgb"),
                },
                destructive: {
                    DEFAULT: withOpacity("--destructive-rgb"),
                    foreground: withOpacity("--destructive-foreground-rgb"),
                },
                border: withOpacity("--border-rgb"),
                input: withOpacity("--input-rgb"),
                ring: withOpacity("--ring-rgb"),
                "secondary-1": withOpacity("--secondary-1-rgb"),
                "secondary-2": withOpacity("--secondary-2-rgb"),
                "secondary-3": withOpacity("--secondary-3-rgb"),
                "secondary-4": withOpacity("--secondary-4-rgb"),
                "secondary-5": withOpacity("--secondary-5-rgb"),
                "secondary-6": withOpacity("--secondary-6-rgb"),
                primaryShades: withOpacity("--primaryShades-rgb"),
                "secondaryShades-1": withOpacity("--secondaryShades-1-rgb"),
                "secondaryShades-2": withOpacity("--secondaryShades-2-rgb"),
                "secondaryShades-3": withOpacity("--secondaryShades-3-rgb"),
                "secondaryShades-4": withOpacity("--secondaryShades-4-rgb"),
                "secondaryShades-5": withOpacity("--secondaryShades-5-rgb"),
                "secondaryShades-6": withOpacity("--secondaryShades-6-rgb"),
                "neutral-100": withOpacity("--neutral-100-rgb"),
                "neutral-200": withOpacity("--neutral-200-rgb"),
                "neutral-300": withOpacity("--neutral-300-rgb"),
                "neutral-400": withOpacity("--neutral-400-rgb"),
                "neutral-500": withOpacity("--neutral-500-rgb"),
                "neutral-600": withOpacity("--neutral-600-rgb"),
                "neutral-700": withOpacity("--neutral-700-rgb"),
                "neutral-750": withOpacity("--neutral-750-rgb"),
                "neutral-800": withOpacity("--neutral-800-rgb"),
            },
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
