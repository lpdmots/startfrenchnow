import { getServerSession } from "next-auth";
import { Locale, normalizeLocale } from "@/i18n";
import { authOptions } from "@/app/lib/authOptions";
import { getPackSommaire } from "@/app/serverActions/productActions";
import { CoursesAccordionClient } from "../components/CoursesAccordionClient";
import { StickyCol } from "../videos/(lessons)/[slug]/components/StickyCol";

export default async function VideosPostLayout(props: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);

    
    const {
        children
    } = props;

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
