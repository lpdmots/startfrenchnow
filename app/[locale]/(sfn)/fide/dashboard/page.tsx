import { Locale } from "@/i18n";
import { DashboardHero } from "./components/DashboardHero";
import { groq } from "next-sanity";
import { getCalendlyData, getFidePackSommaire } from "@/app/serverActions/productActions";
import { Progress } from "@/app/types/sfn/auth";
import { client } from "@/app/lib/sanity.client";
import { Exam } from "@/app/types/fide/exam";
import { CalendlyData, PrivateLesson } from "@/app/types/sfn/lessons";
import { getFormattedData } from "@/app/lib/calendlyUtils";
import { buildHeroData } from "./components/dashboardUtils";
import { requireSessionAndFide } from "@/app/components/auth/requireSession";
import DashboardVideos from "./components/DashboardVideos";
import { DashboardCoaching } from "./components/DashboardCoaching";
import { DashboardExams } from "./components/DashboardExams";

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

async function DashboardPage({ params: { locale } }: { params: { locale: Locale } }) {
    const session = await requireSessionAndFide({ callbackUrl: "/fide/dashboard", info: "privateLessons" });
    const userId = session?.user?._id ?? null;
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");

    // Fetch de PrivatLesson
    const response: CalendlyData = await getCalendlyData(session?.user?._id || "", "Fide Preparation Class");
    const privateLesson: PrivateLesson = getFormattedData(response);

    // Fetch des Exams
    const exams: Exam[] = await client.fetch(queryExams);

    const [fidePackSommaire, fideUserProgress] = await Promise.all([getFidePackSommaire(locale), userId ? client.fetch<Progress>(FIDE_USER_PROGRESS_QUERY, { userId }) : Promise.resolve(null)]);

    const hero = buildHeroData(fideUserProgress, fidePackSommaire, exams, privateLesson);

    return (
        <>
            <div className="w-full flex flex-col items-center gap-24 mt-8 md:mt-12 p-2 mb-12 lg:mb-24">
                <DashboardHero hero={hero} locale={locale} hasPack={hasPack} />
                <DashboardVideos hero={hero} locale={locale} hasPack={hasPack} fidePackSommaire={fidePackSommaire} />
                <DashboardExams hero={hero} locale={locale} hasPack={hasPack} />
                <DashboardCoaching hero={hero} locale={locale} />
            </div>
        </>
    );
}

export default DashboardPage;
