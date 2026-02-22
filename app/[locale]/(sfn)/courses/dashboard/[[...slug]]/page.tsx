import { Locale } from "@/i18n";
import { DashboardHero } from "../components/DashboardHero";
import { groq } from "next-sanity";
import { getPackSommaire } from "@/app/serverActions/productActions";
import { Progress } from "@/app/types/sfn/auth";
import { client } from "@/app/lib/sanity.client";
import { requireSessionAndFrench } from "@/app/components/auth/requireSession";
import { DashboardComments } from "../components/DashboardComments";
import { COURSES_PACKAGES_KEYS } from "@/app/lib/constantes";
import { HeroData, buildHeroData } from "../../../fide/dashboard/components/dashboardUtils";
import CourseSection from "../components/CourseSection";
import { FRENCH_USER_PROGRESS_QUERY } from "@/app/lib/groqQueries";

export type Access = {
    type: (typeof COURSES_PACKAGES_KEYS)[number];
    hasAccess: boolean;
};

export const dynamic = "force-dynamic";

export type CourseKey = (typeof COURSES_PACKAGES_KEYS)[number];

export type CourseBundle = {
    hasAccess: boolean;
    sommaire: Awaited<ReturnType<typeof getPackSommaire>> | null;
    progress: Progress | null;
    hero: ReturnType<typeof buildHeroData> | null;
};

async function DashboardPage({ params: { locale, slug: specifiedId } }: { params: { locale: Locale; slug?: string } }) {
    const session = await requireSessionAndFrench({
        callbackUrl: "/courses/dashboard",
        info: "frenchCourses",
    });

    const userId = session?.user?._id ?? null;
    const dataId = specifiedId?.[0] || userId || "";

    const accesses: Access[] = COURSES_PACKAGES_KEYS.map((key) => ({
        type: key,
        hasAccess: !!session?.user?.permissions?.some((p) => p.referenceKey === key),
    }));

    const FETCH_SOMMAIRE_WITHOUT_ACCESS = true;

    const entries = await Promise.all(
        COURSES_PACKAGES_KEYS.map(async (key) => {
            const hasAccess = accesses.find((a) => a.type === key)?.hasAccess ?? false;

            const shouldFetchSommaire = hasAccess || FETCH_SOMMAIRE_WITHOUT_ACCESS;
            const shouldFetchProgress = hasAccess && !!dataId;

            const [sommaire, progress] = await Promise.all([
                shouldFetchSommaire ? getPackSommaire(locale, key) : Promise.resolve(null),
                shouldFetchProgress
                    ? await client.fetch<Progress>(FRENCH_USER_PROGRESS_QUERY, {
                          userId: dataId,
                          courseKey: key,
                      })
                    : Promise.resolve(null),
            ]);

            const hero = hasAccess && sommaire ? buildHeroData(progress, sommaire, []) : null;

            return [key, { hasAccess, sommaire, progress, hero }] as const;
        }),
    );

    const coursesByKey = Object.fromEntries(entries) as Record<CourseKey, CourseBundle>;

    const beginner = coursesByKey.udemy_course_beginner;
    const intermediate = coursesByKey.udemy_course_intermediate;
    const dialogs = coursesByKey.udemy_course_dialogs;

    return (
        <div className="w-full flex flex-col items-center gap-24 mt-8 md:mt-12 p-2 mb-12 lg:mb-24">
            <DashboardHero coursesByKey={coursesByKey} locale={locale} />

            <CourseSection
                type="Beginner"
                hero={beginner.hero as unknown as HeroData}
                locale={locale}
                hasPack={beginner.hasAccess}
                packSommaire={beginner.sommaire!}
                color="secondary-2"
                imagePath="/images/cours1.jpg"
            />
            <CourseSection
                type="Intermediate"
                hero={intermediate.hero as unknown as HeroData}
                locale={locale}
                hasPack={intermediate.hasAccess}
                packSommaire={intermediate.sommaire!}
                color="secondary-4"
                imagePath="/images/cours2.jpg"
            />
            <CourseSection
                type="Dialogs"
                hero={dialogs.hero as unknown as HeroData}
                locale={locale}
                hasPack={dialogs.hasAccess}
                packSommaire={dialogs.sommaire!}
                color="secondary-5"
                imagePath="/images/cours3.jpg"
            />

            <DashboardComments locale={locale} userId={dataId} />
        </div>
    );
}

export default DashboardPage;
