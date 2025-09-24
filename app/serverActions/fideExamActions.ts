"use server";
import { SanityServerClient as client } from "../lib/sanity.clientServerDev";
import { groq } from "next-sanity";
import { ExamLog, UserProps, VideoLog } from "../types/sfn/auth";
import { v4 as uuidv4 } from "uuid";
import { OpenAI } from "openai";
import { extractJsonSafe } from "../lib/utils";
import { ResponseB1 } from "../types/fide/exam";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/authOptions";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getCurrentUserId() {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Not authenticated");
    // adapte à ton mapping: ici on suppose _id = session.user.id
    return String(session.user._id);
}

const queryFideExamProgress = groq`
  *[_type == "user" && _id == $userId][0] {
    learningProgress[ type == $type ]
  }
`;

export const getFideExamProgress = async (userId: string, type: string) => {
    return (await client.fetch(queryFideExamProgress, { userId, type })) as UserProps | null;
};

export const updateUserProgress = async (progressType: string, logType: "examLogs" | "videoLogs", examId: string, newScore: number, userId?: string) => {
    const query = groq`
      *[_type == "user" && _id == $userId][0] {
        learningProgress[ type == $progressType ]
      } 
    `;

    const user: UserProps | null = await client.fetch(query, { userId, progressType });
    const logs = user?.learningProgress?.[0]?.[logType] as VideoLog[] | ExamLog | undefined;

    if (logType === "examLogs") return updateExamLogs(userId, examId, newScore, logs as ExamLog[] | undefined, progressType);
    return updateVideoLogs(userId, examId, newScore, logs as VideoLog[] | undefined, progressType);
};

const updateExamLogs = async (userId: string | undefined, examId: string, newScore: number, logs: ExamLog[] | undefined, progressType: string) => {
    if (logs) {
        // Si le log pour l'examen existe déjà il faut l'update, sinon il faut le créer
        const existingLogIndex = logs?.findIndex((log) => log.exam._ref === examId);
        if (existingLogIndex !== -1) {
            const existingLog = logs[existingLogIndex];
            // Mettre à jour le score existant
            if (newScore > existingLog.bestScore) {
                existingLog.bestScore = newScore;
                existingLog.bestScoreAt = new Date().toISOString();
            }
            existingLog.updatedAt = new Date().toISOString();
            existingLog.scores.push(newScore);
            existingLog.lastCompletedAt = new Date().toISOString();
        } else {
            // Ajouter un nouveau log
            logs.push({
                _key: uuidv4(),
                exam: { _type: "reference", _ref: examId },
                bestScore: newScore,
                bestScoreAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                scores: [newScore],
                lastCompletedAt: new Date().toISOString(),
            });
        }
        // Mettre à jour la progression de l'utilisateur
        await client
            .patch(userId || "")
            .unset([`learningProgress[type == "${progressType}"]`]) // supprimer l'existante
            .insert("after", "learningProgress[-1]", [
                // en réinsérant une nouvelle
                {
                    _key: uuidv4(),
                    type: progressType,
                    examLogs: logs,
                },
            ])
            .commit();
        return logs;
    } else {
        const newLog = {
            _key: uuidv4(),
            exam: { _type: "reference", _ref: examId },
            bestScore: newScore,
            bestScoreAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            scores: [newScore],
            lastCompletedAt: new Date().toISOString(),
        };
        const logs: ExamLog[] = [newLog];
        // Créer une nouvelle progression de l'utilisateur
        await client
            .patch(userId || "")
            .setIfMissing({ learningProgress: [] }) // Assurez-vous que le tableau learningProgress existe
            .insert("after", "learningProgress[-1]", [
                {
                    _key: uuidv4(),
                    type: progressType,
                    examLogs: logs,
                },
            ])
            .commit();
        return logs;
    }
};

const updateVideoLogs = (userId: string | undefined, examId: string, newScore: number, logs: VideoLog[] | undefined, progressType: string) => {
    return [];
};

type EvaluationResult = {
    score: 0 | 0.5 | 1;
    feedback?: string;
};

export async function evaluateB1Answer({
    audioText,
    answerText,
    responseB1,
    question,
}: {
    audioText: string;
    answerText: string;
    responseB1: ResponseB1;
    question: string;
}): Promise<EvaluationResult | { error: string }> {
    if (!audioText || !answerText || !responseB1 || !question) {
        return { error: "Paramètres manquants" };
    }

    const prompt = `
        Tu es examinateur FIDE pour l'examen B1 (compréhension orale).

        Texte audio :
        """
        ${audioText}
        """

        La question : :
        """
        ${question}
        """

        Réponse de l’étudiant :
        """
        ${answerText}
        """

        Donne une évaluation au format JSON brut :

        {
        "score": 0 | 0.5 | 1,
        "feedback": string | undefined 
        }

        La réponse de l'étudiant est une transcription de l'oral, donc il peut y avoir des incohérences. À toi de les déceler et les prendre en compte intelligemment dans l'évaluation. Le score et le feedback ignorent les fautes de grammaire ou d'orthographe (surtout les noms propres !) contenues dans la réponse.

        Score: 
        - 1 pour une réponse juste similaire à "${responseB1.modelAnswer}". Où encore si ${responseB1.correctIf}. 
        - 0.5 pour une réponse approximative si ${responseB1.partialIf}.
        - 0 pour une réponse fausse : ${responseB1.incorrectIf}.

        feedback: max 20 mots. Aucune remarque générale. Il s'adresse directement à l'étudiant avec vous.
        - si score est 1, de courtes et simples félicitations.
        - si score est 0.5, donne un feedback court expliquant pourquoi c'est approximatif.
        - si score est 0, donne un feedback court expliquant pourquoi c'est faux.

    `;

    try {
        const res = await openai.chat.completions.create({
            model: "gpt-5-mini", //gpt-4.1-nano
            messages: [{ role: "user", content: prompt }],
            /* temperature: 0.2, juste pour model gpt-4.1-nano */
        });

        const content = res.choices[0].message?.content;

        if (!content) return { error: "Réponse vide du modèle" };
        const parsed = extractJsonSafe(content);
        return parsed;
    } catch (err: any) {
        console.error("Erreur GPT ou parsing :", err);
        return { error: "Erreur GPT ou parsing JSON" };
    }
}

const queryOnlyVideos = groq`
    *[_type=='post' && dateTime(publishedAt) < dateTime(now()) && isReady == true && defined(mainVideo.url) && mainVideo.url != '' && 'pack_fide' in categories[]] {
        ...,
    } | order(publishedAt desc)
    [$offset...$limit]
`;

export const getFideVideosPostsSlice = async (offset: number, limit: number) => {
    return await client.fetch(queryOnlyVideos, { offset, limit });
};

const queryProgressFull = groq`
  *[_type == "user" && _id == $userId][0]{
    learningProgress[ type == $progressType ]{
      videoLogs, examLogs, current
    }
  }
`;

// Types d’événements côté player
type VideoEvent =
    | { kind: "milestone"; progressType: string; postId: string; milestone: 0.2 | 0.4 | 0.6 | 0.8 | 1; progress?: number }
    | { kind: "completed"; progressType: string; postId: string }
    | { kind: "manualSeen"; progressType: string; postId: string };

// Helpers ----------------------------------------------------------------------

function nowISO() {
    return new Date().toISOString();
}

function toRef(postId: string): { _type: "reference"; _ref: string } {
    return { _type: "reference", _ref: postId };
}

function isWatchedFrom(progress?: number, milestone?: number) {
    // Vu si progress >= 0.9 ou milestone == 1
    if (milestone === 1) return true;
    if (typeof progress === "number" && progress >= 0.9) return true;
    return false;
}

function upsertVideoLogArray(logs: VideoLog[] | undefined, postId: string, patch: Partial<VideoLog>): VideoLog[] {
    const nextLogs = Array.isArray(logs) ? [...logs] : [];
    const idx = nextLogs.findIndex((l) => l?.post?._ref === postId);
    const current = idx >= 0 ? nextLogs[idx] : null;

    if (idx >= 0 && current?.status !== "watched") {
        // merge in place
        nextLogs[idx] = { ...nextLogs[idx], ...patch };
    } else if (idx >= 0 && current?.status === "watched") {
        nextLogs[idx] = { ...nextLogs[idx], lastSeenAt: patch.lastSeenAt, updatedAt: patch.updatedAt as string }; // ne jamais repasser en in-progress
    } else {
        nextLogs.push({
            _key: uuidv4(),
            post: toRef(postId),
            status: "in-progress",
            updatedAt: nowISO(),
            ...patch,
        } as VideoLog);
    }
    return nextLogs;
}

// Remplace l’entrée learningProgress[type == progressType] en préservant l’autre log (examLogs ou videoLogs)
async function replaceLearningProgressEntry(params: {
    userId: string;
    progressType: string;
    nextVideoLogs?: VideoLog[];
    keepExamLogs?: ExamLog[];
    currentRef?: { _type: "reference"; _ref: string } | null;
}) {
    const { userId, progressType, nextVideoLogs, keepExamLogs, currentRef } = params;

    const baseObj: any = {
        _key: uuidv4(),
        type: progressType,
    };
    if (nextVideoLogs) baseObj.videoLogs = nextVideoLogs;
    if (keepExamLogs) baseObj.examLogs = keepExamLogs;
    if (currentRef) {
        baseObj.current = { post: currentRef, updatedAt: nowISO() };
    }

    // Si aucune des deux listes n'existe, on initialise vide pour respecter le schéma
    if (!baseObj.videoLogs) baseObj.videoLogs = [];
    if (!baseObj.examLogs) baseObj.examLogs = [];

    // Patch "remplacement" comme tu fais déjà côté examens
    const result = await client
        .patch(userId)
        .setIfMissing({ learningProgress: [] })
        .unset([`learningProgress[type == "${progressType}"]`])
        .insert("after", "learningProgress[-1]", [baseObj])
        .commit();
}

// API server actions -----------------------------------------------------------

/**
 * Ecrit un palier 20/40/60/80/100% (ou progress approx) pour une vidéo.
 * - status = "in-progress" (sauf si >=90% ou milestone==1 → "watched")
 * - lastSeenAt & updatedAt toujours mis à jour
 * - lastCompletedAt seulement si "watched"
 */

export async function syncVideoMilestone(evt: Extract<VideoEvent, { kind: "milestone" }>) {
    const userId = await getCurrentUserId();
    const progressType = evt.progressType || "pack_fide"; // garde un défaut
    const { postId, milestone, progress } = evt;
    const now = nowISO();
    const user: { learningProgress?: Array<{ videoLogs?: VideoLog[]; examLogs?: ExamLog[] }> } | null = await client.fetch(queryProgressFull, { userId, progressType });

    const current = user?.learningProgress?.[0] ?? {};
    const existingVideoLogs = current?.videoLogs ?? [];
    const existingExamLogs = current?.examLogs ?? [];

    const watched = isWatchedFrom(progress, milestone);

    // ✅ Auto-validation à 90% (ou milestone == 1) en réutilisant la logique standard
    if (watched) {
        // Centralise tout: status="watched", progress=1, lastMilestone=1, dates, current=null
        return await markVideoCompleted({ kind: "completed", progressType, postId });
    }

    // Sinon on reste en "in-progress" avec la progression/milestone fournis
    const patch: Partial<VideoLog> = {
        post: toRef(postId),
        status: "in-progress",
        lastSeenAt: now,
        updatedAt: now,
        ...((typeof progress === "number" ? { progress } : null) as any),
        ...((typeof milestone === "number" ? { lastMilestone: milestone } : null) as any),
    };

    const nextVideoLogs = upsertVideoLogArray(existingVideoLogs as any, postId, patch);

    // Côté UX, on conserve "current" tant que pas vu
    await replaceLearningProgressEntry({
        userId,
        progressType,
        nextVideoLogs,
        keepExamLogs: existingExamLogs as any,
        currentRef: toRef(postId),
    });

    return { ok: true, status: "in-progress" as const };
}

/**
 * Fin de vidéo → status "watched" + lastCompletedAt
 */
export async function markVideoCompleted(evt: Extract<VideoEvent, { kind: "completed" }>) {
    const userId = await getCurrentUserId();
    const progressType = evt.progressType || "pack_fide";
    const { postId } = evt;
    const now = nowISO();
    const user: { learningProgress?: Array<{ videoLogs?: VideoLog[]; examLogs?: ExamLog[] }> } | null = await client.fetch(queryProgressFull, { userId, progressType });

    const current = user?.learningProgress?.[0] ?? {};
    const existingVideoLogs = current?.videoLogs ?? [];
    const existingExamLogs = current?.examLogs ?? [];

    const patch: Partial<VideoLog> = {
        post: toRef(postId),
        status: "watched",
        lastSeenAt: now,
        lastCompletedAt: now,
        updatedAt: now,
        progress: 1,
        lastMilestone: 1,
    };

    const nextVideoLogs = upsertVideoLogArray(existingVideoLogs as any, postId, patch);

    await replaceLearningProgressEntry({
        userId,
        progressType,
        nextVideoLogs,
        keepExamLogs: existingExamLogs as any,
        currentRef: null, // plus de "current" une fois vu
    });

    return { ok: true, status: "watched" as const };
}

/**
 * Bouton manuel "Marquer comme vu" → status "watched"
 */
export async function markVideoSeenManually(evt: Extract<VideoEvent, { kind: "manualSeen" }>) {
    return markVideoCompleted({ kind: "completed", progressType: evt.progressType, postId: evt.postId });
}

function upsertVideoLogArrayAllowDowngrade(existing: VideoLog[] = [], postId: string, patch: Partial<VideoLog>): VideoLog[] {
    const idx = existing.findIndex((v: any) => v?.post?._ref === postId || v?.post === postId);
    if (idx >= 0) {
        const next = existing.slice();
        next[idx] = { ...existing[idx], ...patch };
        return next;
    }
    // Pas de log → on crée via le helper d'origine (génère _key, etc.)
    return upsertVideoLogArray(existing as any, postId, patch);
}

/**
 * Bouton manuel "Non vu" → reset à "in-progress"
 * - status = "in-progress"
 * - progress = 0
 * - lastMilestone = 0
 * - lastSeenAt / updatedAt = now
 * - lastCompletedAt = null (on nettoie l'info de complétion)
 */
export async function resetVideoProgress({ progressType, postId }: { progressType?: string; postId: string }) {
    const userId = await getCurrentUserId();
    const type = progressType || "pack_fide";
    const now = nowISO();

    const user: {
        learningProgress?: Array<{ videoLogs?: VideoLog[]; examLogs?: ExamLog[] }>;
    } = await client.fetch(queryProgressFull, { userId, progressType: type });

    const current = user?.learningProgress?.[0] ?? {};
    const existingVideoLogs = current?.videoLogs ?? [];
    const existingExamLogs = current?.examLogs ?? [];
    console.log("resetVideoProgress", { userId, type, postId, existingVideoLogs });

    const patch: Partial<VideoLog> = {
        post: toRef(postId),
        status: "in-progress",
        progress: 0 as any,
        lastMilestone: 0 as any,
        lastSeenAt: now,
        updatedAt: now,
        // On efface la complétion précédente :
        lastCompletedAt: null as any,
    };

    const nextVideoLogs = upsertVideoLogArrayAllowDowngrade(existingVideoLogs as any, postId, patch);
    console.log("nextVideoLogs", nextVideoLogs);
    await replaceLearningProgressEntry({
        userId,
        progressType: type,
        nextVideoLogs,
        keepExamLogs: existingExamLogs as any,
        // vidéo "en cours" → on (re)renseigne current
        currentRef: toRef(postId),
    });

    return { ok: true, status: "in-progress" as const };
}
