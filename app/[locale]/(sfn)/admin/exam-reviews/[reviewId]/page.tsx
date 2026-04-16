import { Link } from "@/i18n/navigation";
import { getServerSession } from "next-auth";
import { groq } from "next-sanity";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import {
    REVIEW_STATUS_VALUES,
    formatAnswerScore,
    formatDateTime,
    formatScore,
    getReviewStatusBadgeClass,
    getReviewStatusLabel,
    toPortableTextPlain,
    withCloudFrontPrefix,
} from "../review-utils";

export const metadata = {
    robots: { index: false, follow: false },
};

const EXAM_REVIEW_DETAIL_QUERY = groq`
*[_type == "examReview" && _id == $reviewId][0]{
  _id,
  _createdAt,
  _updatedAt,
  "userRef": user._ref,
  "sessionId": session._ref,
  status,
  scheduledAt,
  userNote,
  path,
  scores,
  meeting{
    provider,
    joinUrl,
    startAt,
    timezone
  },
  teacherFeedback{
    text,
    deliveredAt
  },
  "user": user->{
    _id,
    name,
    email
  },
  "session": session->{
    _id,
    status
  },
  "compilation": compilationRef->{
    _id,
    name
  },
  "answers": {
    "speakA2": answers.speakA2[]{
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore,
      "task": taskRef->{
        _id,
        title,
        taskType,
        activities[]{
          _key,
          title,
          promptText,
          items[]{
            _key,
            itemType,
            question,
            contentText
          }
        }
      }
    },
    "speakBranch": answers.speakBranch[]{
      activityKey,
      audioUrl,
      transcriptFinal,
      AiFeedback,
      AiScore,
      "task": taskRef->{
        _id,
        title,
        taskType,
        activities[]{
          _key,
          title,
          promptText,
          items[]{
            _key,
            itemType,
            question,
            contentText
          }
        }
      }
    },
    "readWrite": answers.readWrite[]{
      activityKey,
      textAnswer,
      AiFeedback,
      AiScore,
      "task": taskRef->{
        _id,
        title,
        taskType,
        activities[]{
          _key,
          title,
          promptText,
          items[]{
            _key,
            itemType,
            question,
            contentText
          }
        }
      }
    }
  },
  "listeningExams": taskRefs.listening[]->{
    _id,
    title,
    level,
    levels,
    competence
  },
  "overtimeTasks": overtimeTaskRefs[]->{
    _id,
    title,
    taskType
  }
}
`;

type ReviewTaskItem = {
    _key?: string;
    itemType?: string;
    question?: string;
    contentText?: unknown;
};

type ReviewTaskActivity = {
    _key?: string;
    title?: string;
    promptText?: unknown;
    items?: ReviewTaskItem[];
};

type ReviewTask = {
    _id?: string;
    title?: string;
    taskType?: string;
    activities?: ReviewTaskActivity[];
};

type ReviewAnswer = {
    activityKey?: string;
    audioUrl?: string;
    transcriptFinal?: string;
    textAnswer?: string;
    AiFeedback?: string;
    AiScore?: { score?: number; max?: number } | number;
    task?: ReviewTask | null;
};

type ExamReviewDetail = {
    _id: string;
    _createdAt?: string;
    _updatedAt?: string;
    userRef?: string;
    sessionId?: string;
    status?: string;
    scheduledAt?: string;
    userNote?: string;
    path?: {
        oralBranch?: string;
        writtenCombo?: string;
    } | null;
    scores?: {
        speakA2?: { score?: number; max?: number; percentage?: number } | null;
        speakBranch?: { score?: number; max?: number; percentage?: number } | null;
        listening?: { score?: number; max?: number; percentage?: number } | null;
        readWrite?: { score?: number; max?: number; percentage?: number } | null;
        total?: { score?: number; max?: number; percentage?: number } | null;
    } | null;
    meeting?: {
        provider?: string;
        joinUrl?: string;
        startAt?: string;
        timezone?: string;
    } | null;
    teacherFeedback?: {
        text?: unknown;
        deliveredAt?: string;
    } | null;
    user?: {
        _id?: string;
        name?: string;
        email?: string;
    } | null;
    session?: {
        _id?: string;
        status?: string;
    } | null;
    compilation?: {
        _id?: string;
        name?: string;
    } | null;
    answers?: {
        speakA2?: ReviewAnswer[];
        speakBranch?: ReviewAnswer[];
        readWrite?: ReviewAnswer[];
    } | null;
    listeningExams?: Array<{
        _id?: string;
        title?: string;
        level?: string;
        levels?: string[] | string;
        competence?: string;
    }> | null;
    overtimeTasks?: Array<{
        _id?: string;
        title?: string;
        taskType?: string;
    }> | null;
};

function findActivity(task: ReviewTask | null | undefined, activityKey?: string) {
    if (!task || !Array.isArray(task.activities) || !activityKey) return null;
    return task.activities.find((entry) => String(entry?._key || "") === String(activityKey)) || null;
}

function buildActivityLabel(task: ReviewTask | null | undefined, activityKey?: string) {
    if (!task || !Array.isArray(task.activities) || !activityKey) return null;
    const idx = task.activities.findIndex((entry) => String(entry?._key || "") === String(activityKey));
    if (idx < 0) return null;
    return `Activité ${idx + 1}`;
}

function ScoreCard({ title, score }: { title: string; score?: { score?: number; max?: number; percentage?: number } | null }) {
    return (
        <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-4">
            <p className="mb-1 text-sm text-neutral-500">{title}</p>
            <p className="mb-0 font-semibold text-neutral-800">{formatScore(score)}</p>
        </div>
    );
}

function SpeakingAnswersSection({ title, answers }: { title: string; answers: ReviewAnswer[] }) {
    if (!answers.length) {
        return (
            <section className="card border border-solid border-neutral-300 p-5">
                <h2 className="mb-2 text-xl font-semibold">{title}</h2>
                <p className="mb-0 text-neutral-600">Aucune réponse enregistrée.</p>
            </section>
        );
    }

    return (
        <section className="card border border-solid border-neutral-300 p-5">
            <h2 className="mb-4 text-xl font-semibold">{title}</h2>
            <div className="space-y-4">
                {answers.map((answer, index) => {
                    const task = answer.task;
                    const activity = findActivity(task, answer.activityKey);
                    const activityLabel = buildActivityLabel(task, answer.activityKey);
                    const prompt = toPortableTextPlain(activity?.promptText);
                    const audioUrl = withCloudFrontPrefix(answer.audioUrl);
                    return (
                        <article key={`${task?._id || "task"}-${answer.activityKey || index}-${index}`} className="rounded-xl border border-neutral-300 p-4 bg-neutral-100">
                            <div className="flex flex-col gap-1 mb-3">
                                <p className="mb-0 text-sm text-neutral-500">
                                    {task?.title || "Tâche"} {task?.taskType ? `(${task.taskType})` : ""}
                                </p>
                                {activityLabel ? <p className="mb-0 text-sm font-medium text-neutral-700">{activityLabel}</p> : null}
                            </div>

                            {prompt ? (
                                <div className="mb-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Consigne</p>
                                    <p className="mb-0 text-sm whitespace-pre-wrap">{prompt}</p>
                                </div>
                            ) : null}

                            {audioUrl ? (
                                <div className="mb-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Audio</p>
                                    <audio controls preload="none" className="w-full" src={audioUrl} />
                                    <a href={audioUrl} target="_blank" rel="noreferrer" className="text-xs text-secondary-2 mt-1 inline-block">
                                        Ouvrir l&apos;audio dans un nouvel onglet
                                    </a>
                                </div>
                            ) : null}

                            {answer.transcriptFinal ? (
                                <div className="mb-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Transcript</p>
                                    <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3 text-sm whitespace-pre-wrap">{answer.transcriptFinal}</div>
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Score IA</p>
                                    <p className="mb-0 text-sm font-semibold">{formatAnswerScore(answer.AiScore)}</p>
                                </div>
                                <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Feedback IA</p>
                                    <p className="mb-0 text-sm whitespace-pre-wrap">{answer.AiFeedback || "-"}</p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

function ReadWriteSection({ answers }: { answers: ReviewAnswer[] }) {
    if (!answers.length) {
        return (
            <section className="card border border-solid border-neutral-300 p-5">
                <h2 className="mb-2 text-xl font-semibold">Étape 4 · Lire / Écrire</h2>
                <p className="mb-0 text-neutral-600">Aucune réponse enregistrée.</p>
            </section>
        );
    }

    return (
        <section className="card border border-solid border-neutral-300 p-5">
            <h2 className="mb-4 text-xl font-semibold">Étape 4 · Lire / Écrire</h2>
            <div className="space-y-4">
                {answers.map((answer, index) => {
                    const task = answer.task;
                    const activity = findActivity(task, answer.activityKey);
                    const activityLabel = buildActivityLabel(task, answer.activityKey);
                    const prompt = toPortableTextPlain(activity?.promptText);
                    const questionHints = (activity?.items || [])
                        .filter((item) => item?.itemType !== "instruction")
                        .map((item, itemIdx) => {
                            const q = String(item?.question || "").trim();
                            if (q) return `Q${itemIdx + 1}: ${q}`;
                            const fallback = toPortableTextPlain(item?.contentText);
                            return fallback ? `Q${itemIdx + 1}: ${fallback}` : "";
                        })
                        .filter(Boolean);

                    return (
                        <article key={`${task?._id || "task"}-${answer.activityKey || index}-${index}`} className="rounded-xl border border-neutral-300 p-4 bg-neutral-100">
                            <div className="flex flex-col gap-1 mb-3">
                                <p className="mb-0 text-sm text-neutral-500">
                                    {task?.title || "Tâche"} {task?.taskType ? `(${task.taskType})` : ""}
                                </p>
                                {activityLabel ? <p className="mb-0 text-sm font-medium text-neutral-700">{activityLabel}</p> : null}
                            </div>

                            {prompt ? (
                                <div className="mb-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Consigne</p>
                                    <p className="mb-0 text-sm whitespace-pre-wrap">{prompt}</p>
                                </div>
                            ) : null}

                            {questionHints.length ? (
                                <div className="mb-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Questions associées</p>
                                    <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3 text-sm whitespace-pre-wrap">{questionHints.join("\n")}</div>
                                </div>
                            ) : null}

                            <div className="mb-3">
                                <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Réponse de l&apos;étudiant</p>
                                <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3 text-sm whitespace-pre-wrap">{answer.textAnswer || "-"}</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Score IA</p>
                                    <p className="mb-0 text-sm font-semibold">{formatAnswerScore(answer.AiScore)}</p>
                                </div>
                                <div className="rounded-md border border-neutral-300 bg-neutral-100 p-3">
                                    <p className="mb-1 text-xs uppercase tracking-wide text-neutral-500">Feedback IA</p>
                                    <p className="mb-0 text-sm whitespace-pre-wrap">{answer.AiFeedback || "-"}</p>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default async function AdminExamReviewDetailPage(props: { params: Promise<{ locale: string; reviewId: string }> }) {
    const params = await props.params;
    const { locale, reviewId } = params;
    const detailPath = locale === "fr" ? `/fr/admin/exam-reviews/${reviewId}` : `/admin/exam-reviews/${reviewId}`;
    const session = await getServerSession(authOptions);
    if (session?.user?.isAdmin !== true) {
        redirect("/");
    }

    const review = await sanity.fetch<ExamReviewDetail | null>(EXAM_REVIEW_DETAIL_QUERY, { reviewId });
    if (!review?._id) {
        notFound();
    }

    const statusBadgeClass = getReviewStatusBadgeClass(review.status);
    const userName = review.user?.name || review.user?.email || review.userRef || "-";
    const userEmail = review.user?.email || null;
    const speakingA2Answers = Array.isArray(review.answers?.speakA2) ? review.answers?.speakA2 : [];
    const speakingBranchAnswers = Array.isArray(review.answers?.speakBranch) ? review.answers?.speakBranch : [];
    const readWriteAnswers = Array.isArray(review.answers?.readWrite) ? review.answers?.readWrite : [];
    const listeningExams = Array.isArray(review.listeningExams) ? review.listeningExams : [];
    const overtimeTasks = Array.isArray(review.overtimeTasks) ? review.overtimeTasks : [];
    const teacherFeedbackText = toPortableTextPlain(review.teacherFeedback?.text);

    async function updateStatusAction(formData: FormData) {
        "use server";

        const authSession = await getServerSession(authOptions);
        if (authSession?.user?.isAdmin !== true) {
            redirect("/");
        }

        const nextStatus = String(formData.get("status") || "").trim();
        const isAllowed = REVIEW_STATUS_VALUES.includes(nextStatus as (typeof REVIEW_STATUS_VALUES)[number]);
        if (!isAllowed) {
            redirect(detailPath);
        }

        await sanity.patch(reviewId).set({ status: nextStatus }).commit({ autoGenerateArrayKeys: true });
        redirect(detailPath);
    }

    return (
        <div className="page-wrapper mt-8 sm:mt-12 mb-16">
            <div className="section hero v3 wf-section !pt-6">
                <div className="container-default w-container">
                    <div className="inner-container _100---tablet center">
                        <div className="mb-6">
                            <Link href="/admin/exam-reviews" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-700 hover:text-neutral-800">
                                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                                Retour à la liste
                            </Link>
                        </div>

                        <div className="card border-2 border-solid border-neutral-700 p-6 mb-6">
                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                                <div>
                                    <h1 className="display-3 mb-2">
                                        Exam Review <span className="heading-span-secondary-1">#{review._id.slice(-6)}</span>
                                    </h1>
                                    <p className="mb-0 text-neutral-700">
                                        <span className="font-semibold">{userName}</span>
                                        {userEmail ? ` · ${userEmail}` : ""}
                                    </p>
                                </div>

                                <div className="flex flex-col items-start lg:items-end gap-2">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass}`}>{getReviewStatusLabel(review.status)}</span>
                                    <p className="mb-0 text-xs text-neutral-500">Créé le {formatDateTime(review._createdAt)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
                                <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-4 xl:col-span-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="mb-1 text-neutral-500">Template</p>
                                            <p className="mb-0 font-medium">{review.compilation?.name || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-neutral-500">Session</p>
                                            <p className="mb-0 font-medium break-all">{review.session?._id || review.sessionId || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-neutral-500">Parcours oral</p>
                                            <p className="mb-0 font-medium">{review.path?.oralBranch || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-neutral-500">Parcours écrit</p>
                                            <p className="mb-0 font-medium">{review.path?.writtenCombo || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-neutral-500">Planifié le</p>
                                            <p className="mb-0 font-medium">{formatDateTime(review.scheduledAt)}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-neutral-500">Dernière mise à jour</p>
                                            <p className="mb-0 font-medium">{formatDateTime(review._updatedAt)}</p>
                                        </div>
                                    </div>
                                </div>

                                <form action={updateStatusAction} className="rounded-xl border border-neutral-300 bg-neutral-100 p-4 flex flex-col gap-3">
                                    <p className="mb-0 text-sm font-semibold">Mettre à jour le statut</p>
                                    <select
                                        name="status"
                                        defaultValue={String(review.status || "requested")}
                                        className="rounded-md border border-neutral-400 bg-neutral-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary-2"
                                    >
                                        {REVIEW_STATUS_VALUES.map((status) => (
                                            <option key={status} value={status}>
                                                {getReviewStatusLabel(status)}
                                            </option>
                                        ))}
                                    </select>
                                    <button type="submit" className="btn-primary small !min-h-0 !h-auto !py-2">
                                        Enregistrer
                                    </button>
                                </form>
                            </div>

                            {(review.meeting?.joinUrl || review.meeting?.startAt || review.meeting?.timezone) && (
                                <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-4 mt-4">
                                    <p className="mb-2 text-sm font-semibold">Rendez-vous</p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <p className="mb-1 text-neutral-500">Provider</p>
                                            <p className="mb-0 font-medium">{review.meeting?.provider || "-"}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-neutral-500">Début</p>
                                            <p className="mb-0 font-medium">{formatDateTime(review.meeting?.startAt)}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-neutral-500">Fuseau</p>
                                            <p className="mb-0 font-medium">{review.meeting?.timezone || "-"}</p>
                                        </div>
                                    </div>
                                    {review.meeting?.joinUrl && (
                                        <a href={review.meeting.joinUrl} target="_blank" rel="noreferrer" className="inline-flex mt-3 text-sm font-semibold text-secondary-2">
                                            Ouvrir le lien de réunion
                                        </a>
                                    )}
                                </div>
                            )}

                            {review.userNote ? (
                                <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-4 mt-4">
                                    <p className="mb-1 text-sm font-semibold">Note de l&apos;étudiant</p>
                                    <p className="mb-0 text-sm whitespace-pre-wrap">{review.userNote}</p>
                                </div>
                            ) : null}

                            {(teacherFeedbackText || review.teacherFeedback?.deliveredAt) && (
                                <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-4 mt-4">
                                    <p className="mb-1 text-sm font-semibold">Feedback professeur</p>
                                    {review.teacherFeedback?.deliveredAt ? (
                                        <p className="mb-2 text-xs text-neutral-500">Délivré le {formatDateTime(review.teacherFeedback.deliveredAt)}</p>
                                    ) : null}
                                    <p className="mb-0 text-sm whitespace-pre-wrap">{teacherFeedbackText || "-"}</p>
                                </div>
                            )}
                        </div>

                        <section className="card border border-solid border-neutral-300 p-5 mb-6">
                            <h2 className="mb-4 text-xl font-semibold">Synthèse des scores</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
                                <ScoreCard title="Parler A2" score={review.scores?.speakA2} />
                                <ScoreCard title="Parler branche" score={review.scores?.speakBranch} />
                                <ScoreCard title="Comprendre" score={review.scores?.listening} />
                                <ScoreCard title="Lire / Écrire" score={review.scores?.readWrite} />
                                <ScoreCard title="Total" score={review.scores?.total} />
                            </div>
                        </section>

                        <div className="space-y-6">
                            <SpeakingAnswersSection title="Étape 1 · Parler A2" answers={speakingA2Answers} />
                            <SpeakingAnswersSection title="Étape 2 · Parler branche" answers={speakingBranchAnswers} />

                            <section className="card border border-solid border-neutral-300 p-5">
                                <h2 className="mb-4 text-xl font-semibold">Étape 3 · Comprendre</h2>
                                <div className="mb-4">
                                    <p className="mb-1 text-sm text-neutral-500">Score global compréhension</p>
                                    <p className="mb-0 font-semibold">{formatScore(review.scores?.listening)}</p>
                                </div>
                                {listeningExams.length ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {listeningExams.map((exam, idx) => {
                                            const levels = Array.isArray(exam.levels) ? exam.levels.join(", ") : exam.levels || exam.level || "-";
                                            return (
                                                <div key={`${exam._id || idx}`} className="rounded-xl border border-neutral-300 bg-neutral-100 p-4">
                                                    <p className="mb-1 text-sm font-medium">{exam.title || `Scénario ${idx + 1}`}</p>
                                                    <p className="mb-0 text-xs text-neutral-600">Niveau: {levels}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="mb-0 text-neutral-600">Aucun scénario de compréhension référencé.</p>
                                )}
                            </section>

                            <ReadWriteSection answers={readWriteAnswers} />

                            <section className="card border border-solid border-neutral-300 p-5">
                                <h2 className="mb-4 text-xl font-semibold">Points à risque (temps dépassé)</h2>
                                {overtimeTasks.length ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {overtimeTasks.map((task, idx) => (
                                            <div key={`${task._id || idx}`} className="rounded-xl border border-neutral-300 bg-neutral-100 p-4">
                                                <p className="mb-1 text-sm font-medium">{task.title || "Tâche"}</p>
                                                <p className="mb-0 text-xs text-neutral-600">{task.taskType || "-"}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mb-0 text-neutral-600">Aucune tâche signalée en dépassement de temps.</p>
                                )}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
