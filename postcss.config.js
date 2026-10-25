module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
        "postcss-flexbugs-fixes": {},
        "postcss-preset-env": {
            autoprefixer: {
                flexbox: "no-2009",
            },
            stage: 3,
            features: {
                "custom-properties": true,
            },
        },
        ...(process.env.NEXT_PUBLIC_PRODUCTION_URL || process.env.NEXT_PUBLIC_VERCEL_URL
            ? {
                  "@fullhuman/postcss-purgecss": {
                      content: ["./app/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./lib/**/*.{js,jsx,ts,tsx}", "./modules/**/*.{js,jsx,ts,tsx}"],
                      // Keep dots so fractional utilities (h-0.5, py-1.5...) survive; also emit dot-split parts as before.
                      defaultExtractor: (content) => (content.match(/[\w-/:.]+(?<!:)/g) || []).flatMap((token) => [token, ...token.split(".")]),
                      safelist: [/^!/, /\bCircular\w*/, "html", "body", /\[.*\]/],
                  },
              }
            : {}),
    },
};
