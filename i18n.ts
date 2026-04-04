import { getRequestConfig } from "next-intl/server";
import enMessages from "./app/dictionaries/en.json";
import frMessages from "./app/dictionaries/fr.json";

export type Locale = "en" | "fr";
export const locales = ["en", "fr"] as const;

const messagesByLocale = {
    en: enMessages,
    fr: frMessages,
} as const;

// Mettre à jour la constante langData dans lib/constantes.ts

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale;
    const locale: Locale = requested === "fr" ? "fr" : "en";

    return {
        locale,
        messages: messagesByLocale[locale],
    };
});
