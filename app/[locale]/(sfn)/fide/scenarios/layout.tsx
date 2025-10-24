import { getServerSession } from "next-auth";
import { getTranslator } from "next-intl/server";
import { Locale } from "@/i18n";
import { authOptions } from "@/app/lib/authOptions";
import { getFidePackSommaire, getPackSommaire } from "@/app/serverActions/productActions";
import { CoursesAccordionClient } from "../pack-fide/components/CoursesAccordionClient";
import { StickyCol } from "../videos/(lessons)/[slug]/components/StickyCol";

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }) {
    const t = await getTranslator(locale, "Metadata.exercises");

    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function VideosPostLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: Locale } }) {
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");
    const fidePackSommaire = await getPackSommaire(locale);

    return (
        <div className="grid grid-cols-12 gap-4 xl:gap-8 px-2 sm:px-4 md:px-12 xxl:px-24">
            <main className="col-span-12 lg:col-span-8">{children}</main>
            <aside className="hidden lg:block lg:col-span-4">
                {
                    <StickyCol>
                        <CoursesAccordionClient fidePackSommaire={fidePackSommaire} hasPack={hasPack} expandAll={false} linkPrefix="/fide/scenarios/" />
                    </StickyCol>
                }
            </aside>
        </div>
    );
}
