import { getServerSession } from "next-auth";
import { Locale } from "@/i18n";
import { authOptions } from "@/app/lib/authOptions";
import { getFidePackSommaire, getPackSommaire } from "@/app/serverActions/productActions";
import { StickyCol } from "../../../fide/videos/(lessons)/[slug]/components/StickyCol";
import { CoursesAccordionClient } from "../../../fide/components/CoursesAccordionClient";

export default async function VideosPostLayout({ children, params: { locale } }: { children: React.ReactNode; params: { locale: Locale } }) {
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "udemy_course_dialogs");
    const packSommaire = await getPackSommaire(locale, "udemy_course_dialogs");

    return (
        <div className="grid grid-cols-12 gap-4 xl:gap-8 px-2 sm:px-4 md:px-12 xxl:px-24">
            <main className="col-span-12 lg:col-span-8">{children}</main>
            <aside className="hidden lg:block lg:col-span-4">
                {
                    <StickyCol>
                        <CoursesAccordionClient fidePackSommaire={packSommaire} hasPack={hasPack} expandAll={false} linkPrefix="/courses/dialogues/" />
                    </StickyCol>
                }
            </aside>
        </div>
    );
}
