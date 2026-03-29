import { permanentRedirect } from "next/navigation";
import { Locale } from "@/i18n";

export default function LegacyFideCoursPrivesRedirectPage({ params: { locale } }: { params: { locale: Locale } }) {
    const target = locale === "fr" ? "/fr/fide/private-courses" : "/fide/private-courses";
    permanentRedirect(target);
}
