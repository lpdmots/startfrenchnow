import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
    ...nextCoreWebVitals,
    {
        rules: {
            "react/no-unescaped-entities": "off",
            "react-hooks/purity": "off",
            "react-hooks/set-state-in-effect": "off",
            "react-hooks/use-memo": "off",
            "react-hooks/preserve-manual-memoization": "off",
            "react-hooks/refs": "off",
            "react-hooks/immutability": "off",
        },
    },
];
