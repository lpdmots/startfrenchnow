import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import urlFor from "@/app/lib/urlFor";
import { requireSessionAndMockExam } from "@/app/components/auth/requireSession";
import { getCompilation, getCompilationSessions, getMockExamTasksByIds, isMockExamCompilationUnlockedForUser } from "@/app/serverActions/mockExamActions";
import type { SessionStatus } from "@/app/types/fide/mock-exam";
import RestartSessionDialog from "./RestartSessionDialog";
import MockExamSessionsHistory from "./MockExamSessionsHistory";
import MockExamCorrectionResources from "./MockExamCorrectionResources";
import RefreshOnPageShow from "./RefreshOnPageShow";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const STATUS_LABEL: Record<SessionStatus, string> = {
    in_progress: "En cours",
    completed: "Terminée",
    abandoned: "Abandonnée",
};

const STATUS_CLASSES: Record<SessionStatus, string> = {
    in_progress: "bg-secondary-6 text-neutral-800",
    completed: "bg-secondary-5 text-neutral-800",
    abandoned: "bg-neutral-300 text-neutral-700",
};

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

const withCloudFrontPrefix = (resource?: string) => {
    if (!resource) return undefined;
    if (/^https?:\/\//i.test(resource)) return resource;
    if (!cloudFrontDomain) return resource;

    const normalizedDomain = cloudFrontDomain.endsWith("/") ? cloudFrontDomain : `${cloudFrontDomain}/`;
    const normalizedResource = resource.startsWith("/") ? resource.slice(1) : resource;

    return `${normalizedDomain}${normalizedResource}`;
};

const SPEAKING_CORRECTION_TITLES: Record<string, string> = {
    SPEAK_A2_RESULT: "Correction orale A2",
    SPEAK_BRANCH_RESULT: "Correction orale - branche",
    SPEAK_BRANCH_RESULT_A1: "Correction orale A1",
    SPEAK_BRANCH_RESULT_CHOICE_1: "Correction orale - option 1",
    SPEAK_BRANCH_RESULT_CHOICE_2: "Correction orale - option 2",
};

const READ_WRITE_TITLES: Record<string, string> = {
    READ_WRITE_M1: "Module 1",
    READ_WRITE_M2: "Module 2",
    READ_WRITE_M3_M4: "Module 3/4",
    READ_WRITE_M5: "Module 5",
    READ_WRITE_M6: "Module 6",
};

const formatDate = (iso?: string) => {
    if (!iso) return "-";
    try {
        return new Date(iso).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch {
        return "-";
    }
};

export default async function MockExamCompilationPage(props: { params: Promise<{ compilationId: string }> }) {
    const params = await props.params;

    const {
        compilationId
    } = params;

    const session = await requireSessionAndMockExam({ callbackUrl: "/fide/dashboard", info: "mockExam" });
    const userId = session?.user?._id;

    if (!userId) {
        notFound();
    }

    const [compilation, isUnlocked] = await Promise.all([getCompilation(compilationId), isMockExamCompilationUnlockedForUser(userId, compilationId)]);
    if (!compilation || compilation.isActive === false || !isUnlocked) {
        notFound();
    }
    const readWriteTaskIds = [...(compilation.examConfig?.readWriteTaskIds?.A1_A2 || []), ...(compilation.examConfig?.readWriteTaskIds?.A2_B1 || [])]
        .map((ref) => ref?._ref)
        .filter(Boolean) as string[];

    const [userSessions, readWriteTasks] = await Promise.all([getCompilationSessions(userId, compilationId), readWriteTaskIds.length ? getMockExamTasksByIds(readWriteTaskIds) : Promise.resolve([])]);

    const sessions = (userSessions || []).slice().sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
    const inProgress = sessions.find((entry) => entry.status === "in_progress");
    const lastSession = sessions[0];
    const startLabel = inProgress ? "Reprendre" : "Commencer";
    const startHref = `/mock-exams/${compilation._id}/runner`;
    const speakingVideoResources = Array.from(
        new Map(
            (compilation.corrections || [])
                .filter((correction) => Boolean(correction?.video) && String(correction?.correctionType || "").startsWith("SPEAK"))
                .map((correction) => {
                    const href = withCloudFrontPrefix(correction.video);
                    if (!href) return null;
                    const title = SPEAKING_CORRECTION_TITLES[String(correction.correctionType || "")] || "Correction orale";
                    return [href, { title, href }] as const;
                })
                .filter(Boolean) as Array<readonly [string, { title: string; href: string }]>,
        ).values(),
    );

    const readWritePdfResources = Array.from(
        new Map(
            (readWriteTasks || [])
                .map((task) => {
                    const href = withCloudFrontPrefix(task.supportPdfUrl);
                    if (!href) return null;
                    const taskTitle = task.title?.trim() || READ_WRITE_TITLES[String(task.taskType || "")] || "Support PDF";
                    return [href, { title: taskTitle, href, subtitle: "Support Lire / Écrire" }] as const;
                })
                .filter(Boolean) as Array<readonly [string, { title: string; href: string; subtitle: string }]>,
        ).values(),
    );

    const coverUrl = compilation.image ? urlFor(compilation.image).width(1200).height(700).fit("crop").url() : null;

    return (
        <div className="w-full flex flex-col items-center gap-10 mt-8 md:mt-12 p-4 mb-12 lg:mb-24">
            <RefreshOnPageShow />
            <section className="max-w-6xl w-full py-0">
                <Link href="/fide/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-800">
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Retour au dashboard
                </Link>
            </section>

            <section className="max-w-6xl w-full flex flex-col gap-6 py-0">
                <div className="flex flex-col gap-2">
                    <p className="text-sm uppercase tracking-wide text-neutral-500">EXAMEN BLANC</p>
                    <h1 className="display-2 font-medium">{compilation.name || "Compilation"}</h1>
                </div>

                <div className="card border-2 border-solid border-neutral-700 overflow-hidden p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-5">
                        <div className="relative lg:col-span-3 aspect-[16/10] lg:aspect-auto lg:min-h-[320px] bg-neutral-200">
                            {coverUrl ? (
                                <>
                                    <Image src={coverUrl} alt="Image de compilation" fill className="object-cover" />
                                </>
                            ) : (
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#f6d6b8_0%,#f0c090_32%,#dca46c_62%,#b87a47_100%)]" />
                            )}
                        </div>

                        <div className="lg:col-span-2 p-6 flex flex-col gap-5">
                            <div className="flex flex-wrap items-center gap-2">
                                {lastSession?.status && (
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_CLASSES[lastSession.status]}`}>{STATUS_LABEL[lastSession.status]}</span>
                                )}
                                <span className="rounded-full px-3 py-1 text-xs font-semibold bg-neutral-200 text-neutral-700">
                                    {sessions.length} session{sessions.length > 1 ? "s" : ""}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-xl border border-neutral-300 p-3">
                                    <p className="mb-1 text-neutral-500">Créée le</p>
                                    <p className="mb-0 font-semibold">{formatDate(compilation._createdAt)}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 p-3">
                                    <p className="mb-1 text-neutral-500">Dernière tentative</p>
                                    <p className="mb-0 font-semibold">{formatDate(lastSession?.startedAt)}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 p-3">
                                    <p className="mb-1 text-neutral-500">Branche orale</p>
                                    <p className="mb-0 font-semibold">{lastSession?.oralBranch?.chosen || lastSession?.oralBranch?.recommended || "À choisir"}</p>
                                </div>
                                <div className="rounded-xl border border-neutral-300 p-3">
                                    <p className="mb-1 text-neutral-500">Combo écrit</p>
                                    <p className="mb-0 font-semibold">{lastSession?.writtenCombo?.chosen || lastSession?.writtenCombo?.recommended || "À choisir"}</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                                <Link href={startHref} className="btn-primary text-center">
                                    {startLabel}
                                </Link>
                                {inProgress && <RestartSessionDialog compilationId={compilation._id} />}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <MockExamSessionsHistory sessions={sessions} />
            <MockExamCorrectionResources speakingVideoResources={speakingVideoResources} readWritePdfResources={readWritePdfResources} />
        </div>
    );
}
