import { Locale } from "@/i18n";
import { DashboardHero } from "../components/DashboardHero";
import { groq } from "next-sanity";
import { getCalendlyData, getFidePackSommaire } from "@/app/serverActions/productActions";
import { Progress } from "@/app/types/sfn/auth";
import { client } from "@/app/lib/sanity.client";
import { Exam } from "@/app/types/fide/exam";
import { CalendlyData, PrivateLesson } from "@/app/types/sfn/lessons";
import { getFormattedData } from "@/app/lib/calendlyUtils";
import { buildHeroData } from "../components/dashboardUtils";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import DashboardVideos from "../components/DashboardVideos";
import { DashboardCoaching } from "../components/DashboardCoaching";
import { DashboardExams } from "../components/DashboardExams";
import { DashboardComments } from "../components/DashboardComments";
import { DashboardMockExams } from "../components/DashboardMockExams";
import { getUserCompilations, getUserMockExamCredits } from "@/app/serverActions/mockExamActions";

const FIDE_USER_PROGRESS_QUERY = groq`
  *[_type == "user" && _id == $userId][0].learningProgress[type == "pack_fide"][0]{
    _key,
    type,
    videoLogs,
    examLogs
  }
`;

export const dynamic = "force-dynamic";

const queryExams = groq`*[_type=='fideExam' && competence=="Comprendre"]{ ..., _id }`;

async function DashboardPage({ params: { locale, slug: specifiedId } }: { params: { locale: Locale; slug?: string } }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "privateLessons" });
    const userId = session?.user?._id ?? null;
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");
    const dataId = specifiedId?.[0] || userId || "";
    const canCreateMockExam = dataId === userId;

    const examsPromise = client.fetch<Exam[]>(queryExams);

    const sommairePromise = getFidePackSommaire(locale);

    const progressPromise = dataId ? client.fetch<Progress>(FIDE_USER_PROGRESS_QUERY, { userId: dataId }) : Promise.resolve(null);

    const privateLessonPromise: Promise<PrivateLesson | null> = dataId
        ? (async () => {
              try {
                  const response: CalendlyData = await getCalendlyData(dataId, "Fide Preparation Class");
                  return getFormattedData(response);
              } catch {
                  return null;
              }
          })()
        : Promise.resolve(null);

    const [exams, fidePackSommaire, fideUserProgress, privateLesson, compilations, mockExamCredits] = await Promise.all([
        examsPromise,
        sommairePromise,
        progressPromise,
        privateLessonPromise,
        dataId ? getUserCompilations(dataId) : Promise.resolve([]),
        canCreateMockExam && userId ? getUserMockExamCredits(userId) : Promise.resolve(null),
    ]);

    const hero = buildHeroData(fideUserProgress, fidePackSommaire, exams, privateLesson);

    return (
        <>
            <div className="w-full flex flex-col items-center gap-24 mt-8 md:mt-12 p-2 mb-12 lg:mb-24">
                <DashboardHero hero={hero} locale={locale} hasPack={hasPack} />
                <DashboardMockExams compilations={compilations} remainingCredits={mockExamCredits?.remainingCredits ?? null} canCreate={canCreateMockExam} />
                <DashboardVideos hero={hero} locale={locale} hasPack={hasPack} fidePackSommaire={fidePackSommaire} userId={userId} />
                <DashboardExams hero={hero} locale={locale} hasPack={hasPack} />
                <DashboardCoaching hero={hero} locale={locale} />
                <DashboardComments locale={locale} userId={dataId} />
            </div>
        </>
    );
}

export default DashboardPage;
