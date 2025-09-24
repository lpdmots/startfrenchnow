import { getRequestConfig } from "next-intl/server";

export type Locale = "en" | "fr";
export const locales = ["en", "fr"] as const;

// Mettre à jour la constante langData dans lib/constantes.ts

export default getRequestConfig(async ({ locale }) => ({
    messages: (await import(`@/app/dictionaries/${locale}.json`)).default,
}));
