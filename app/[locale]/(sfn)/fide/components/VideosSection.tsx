import { FidePackSommaire, getFidePackSommaire } from "@/app/serverActions/productActions";
import { Locale } from "@/i18n";
import { VideosSectionClient } from "./VideosSectionClient";

export async function VideosSection({ locale, hasPack, userId }: { locale: Locale; hasPack?: boolean; userId?: string }) {
    const fidePackSommaire = await getFidePackSommaire(locale);
    return <VideosSectionClient fidePackSommaire={fidePackSommaire} hasPack={hasPack} locale={locale} userId={userId} />;
}
