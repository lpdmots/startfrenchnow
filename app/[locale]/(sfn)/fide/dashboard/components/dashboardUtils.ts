/* ============================================================
   Helpers & Types de sortie (locaux au héros)
   -> Aucun nouveau type domaine n'est inventé : on part des tiens
   ============================================================ */

import { FidePackSommaire } from "@/app/serverActions/productActions";
import { Exam, ExamCompetence, ExamLevel } from "@/app/types/fide/exam";
import { Progress, VideoLog } from "@/app/types/sfn/auth";
import { Image, Level } from "@/app/types/sfn/blog";
import { Event, PrivateLesson } from "@/app/types/sfn/lessons";

type HeroKind = "video" | "exams" | "coaching" | "coaching-urgent" | "none";

export type HeroVideoData = {
    main?: {
        postId: string;
        slug: string;
        title: string;
        status: "watched" | "unwatched" | "in-progress";
        percentTime?: number; // si in-progress
        levels?: Level[]; // ex. ["a1", "a2"]
        mainImage?: Image;
        mainVideo?: { url: string };
    };
    mini: Array<{
        postId: string;
        slug: string;
        title: string;
        status: "watched" | "unwatched" | "in-progress";
        levels?: Level[];
        mainImage?: Image;
        mainVideo?: { url: string };
        badge: "Commencer" | "Continuer" | "Revoir";
        isPreview: boolean;
    }>;
    stats: {
        percent: number; // progression globale vidéos (arrondi 0..100)
        watched: number; // nb vidéos vues
        inProgress: number; // nb vidéos en cours
        total: number; // nb total de vidéos
        lastActivityAt?: string; // ISO (côté vidéo)
    };
};

export type HeroExamData = {
    last?: {
        examId: string;
        title: string;
        levels: ExamLevel[];
        image?: Image;
        description?: string;
        competence: ExamCompetence;
        score?: number;
    };
    stats: {
        avgByLevel: Record<"A1" | "A2" | "B1", number | null>; // moyenne perso par niveau
        allexamsByLevel: Record<"A1" | "A2" | "B1", number>; // nb total d’exams par niveau
        doneCountByLevel: Record<"A1" | "A2" | "B1", number>; // nb d’exams terminés par niveau
        allexamsForLastLevel?: number; // tous les exams pour le niveau du dernier exam
        todoCountForLastLevel?: number; // nb d’exams à faire pour le niveau du dernier exam
        lastActivityAt?: string; // ISO (côté exams)
    };
};

export type HeroCoachingData = {
    nextEvent?: Event; // ton type Event
    remainingMinutes: number;
    currentMinutes: number;
    upcomingMinutes: number;
    completedMinutes: number;
    totalPurchasedMinutes: number;
    lastPastEventDate?: string | undefined; // date ISO du dernier event passé
    urgent: boolean; // RDV < 72h ou minutes restantes <= 60
};

export type HeroData = {
    kind: HeroKind;
    video?: HeroVideoData;
    exams?: HeroExamData;
    coaching?: HeroCoachingData;
};

/* ----------------------- Utils de base ----------------------- */

export function isoMax(dates: (string | undefined)[]): string | undefined {
    const valid = dates.filter(Boolean) as string[];
    if (!valid.length) return undefined;
    return valid.slice().sort().at(-1);
}

export function flattenPostsFromToc(toc: FidePackSommaire) {
    // Post minimal : on garde uniquement ce qui sert au héros
    return (toc.packages ?? []).flatMap((pkg) =>
        (pkg.modules ?? []).flatMap((mod) =>
            (mod.posts ?? []).map((p) => ({
                _id: p._id,
                slug: p.slug?.current ?? "",
                title: p.title,
                level: p.level,
                durationSec: p.durationSec,
                mainImage: p.mainImage,
                mainVideo: p.mainVideo,
                isPreview: !!p.isPreview,
            }))
        )
    );
}

/* ============================================================
   VIDÉO : sélection principale + mini + stats
   ============================================================ */

const MAX_MINI_VIDEOS = 4;

export function computeHeroVideoData(progress: Progress | null | undefined, toc: FidePackSommaire, hasPack?: boolean): HeroVideoData {
    const posts = flattenPostsFromToc(toc);
    const postIds = posts.map((p) => p._id);
    const allLogs = (progress?.videoLogs ?? []).slice();
    const logs = allLogs.filter((l) => l.post?._ref && postIds.includes(l.post._ref));

    // Tri par dernière activité (updatedAt > lastSeenAt > lastCompletedAt)
    const decorated = logs.map((l) => ({
        log: l,
        lastAt: isoMax([l.updatedAt, l.lastSeenAt, l.lastCompletedAt]),
    }));
    decorated.sort((a, b) => (a.lastAt ?? "").localeCompare(b.lastAt ?? ""));

    // 1) principale : "in-progress" la plus récente ; sinon 1ère non vue (ordre du sommaire)
    const lastInProgress = decorated.filter((d) => d.log.status === "in-progress").at(-1)?.log;
    const mainPostId = lastInProgress?.post?._ref ?? posts.find((p) => !logs.some((l) => l.status === "watched" && l.post?._ref === p._id))?._id;

    const mainPost = posts.find((p) => p._id === mainPostId);
    const mainLog = logs.find((l) => l.post?._ref === mainPostId);

    // ===== Aides =====
    const statusByPostId = new Map<string, VideoLog["status"]>();
    const lastTimeByPostId = new Map<string, string | undefined>();
    for (const l of logs) {
        const id = l.post?._ref;
        if (!id) continue;
        statusByPostId.set(id, l.status);
        lastTimeByPostId.set(id, isoMax([l.lastCompletedAt, l.lastSeenAt, l.updatedAt]));
    }

    const isWatched = (id?: string) => (id ? statusByPostId.get(id) === "watched" : false);
    const isUnwatched = (id?: string) => (id ? !statusByPostId.has(id) || statusByPostId.get(id) === "unwatched" : false);

    const badgeFor = (status: VideoLog["status"] | undefined): "Commencer" | "Continuer" | "Revoir" => (status === "in-progress" ? "Continuer" : status === "watched" ? "Revoir" : "Commencer");

    const mini: HeroVideoData["mini"] = [];
    const added = new Set<string>();
    const pushMini = (p?: (typeof posts)[number]) => {
        if (!p || added.has(p._id)) return false;
        const st = (statusByPostId.get(p._id) ?? "unwatched") as VideoLog["status"];
        mini.push({
            postId: p._id,
            slug: p.slug,
            title: p.title,
            status: st,
            badge: badgeFor(st),
            mainImage: (p as any).mainImage,
            mainVideo: (p as any).mainVideo,
            levels: p.level,
            isPreview: p.isPreview,
        });
        added.add(p._id);
        return true;
    };

    const inProgressSortedDesc = decorated.filter((d) => d.log.status === "in-progress").sort((a, b) => (b.lastAt ?? "").localeCompare(a.lastAt ?? ""));

    const fillFromInProgress = (predicate: (p: (typeof posts)[number]) => boolean) => {
        for (const d of inProgressSortedDesc) {
            if (mini.length >= MAX_MINI_VIDEOS) break;
            const p = posts.find((pp) => pp._id === d.log.post?._ref);
            if (p && predicate(p)) pushMini(p);
        }
    };

    const addFollowingUnwatchedAfterMain = (predicate: (p: (typeof posts)[number]) => boolean) => {
        if (mini.length >= MAX_MINI_VIDEOS || !mainPost) return;
        const startIdx = posts.findIndex((p) => p._id === mainPost._id);
        const following = startIdx >= 0 ? posts.slice(startIdx + 1) : [];
        for (const p of following) {
            if (mini.length >= MAX_MINI_VIDEOS) break;
            if (predicate(p) && isUnwatched(p._id)) pushMini(p);
        }
    };

    const addUnwatchedAny = (predicate: (p: (typeof posts)[number]) => boolean) => {
        for (const p of posts) {
            if (mini.length >= MAX_MINI_VIDEOS) break;
            if (predicate(p) && isUnwatched(p._id)) pushMini(p);
        }
    };

    const addWatchedOldestFirst = (predicate: (p: (typeof posts)[number]) => boolean) => {
        const watchedOldestFirst = posts
            .filter((p) => predicate(p) && isWatched(p._id) && !added.has(p._id))
            .sort((a, b) => {
                const ta = lastTimeByPostId.get(a._id) ?? "";
                const tb = lastTimeByPostId.get(b._id) ?? "";
                return (ta || "").localeCompare(tb || ""); // plus ancien d'abord
            });
        for (const p of watchedOldestFirst) {
            if (mini.length >= MAX_MINI_VIDEOS) break;
            pushMini(p);
        }
    };

    if (hasPack) {
        if (mainPost && !isWatched(mainPost._id)) pushMini(mainPost);
        fillFromInProgress(() => true);
        addFollowingUnwatchedAfterMain(() => true);
        if (mini.length < MAX_MINI_VIDEOS) addUnwatchedAny(() => true);
        if (mini.length < MAX_MINI_VIDEOS) addWatchedOldestFirst(() => true);
        if (mini.length < MAX_MINI_VIDEOS) {
            for (const p of posts) {
                if (mini.length >= MAX_MINI_VIDEOS) break;
                pushMini(p);
            }
        }
    } else {
        // ===== (NO PACK) Priorité previews d'abord =====
        const isPreview = (p: (typeof posts)[number]) => !!(p as any).isPreview;
        const notPreview = (p: (typeof posts)[number]) => !isPreview(p);

        // (1) La "main" si preview ET non vue
        if (mainPost && isPreview(mainPost) && !isWatched(mainPost._id)) pushMini(mainPost);

        // (2) In-progress PREVIEWS récents
        fillFromInProgress(isPreview);

        // (3) PREVIEWS suivantes non vues après la "main"
        addFollowingUnwatchedAfterMain(isPreview);

        // (4) PREVIEWS non vues restantes
        if (mini.length < MAX_MINI_VIDEOS) addUnwatchedAny(isPreview);

        // (5) PREVIEWS vues les plus anciennes
        if (mini.length < MAX_MINI_VIDEOS) addWatchedOldestFirst(isPreview);

        // (6) Si pas assez, on complète avec NON-PREVIEWS (même logique pack)
        if (mini.length < MAX_MINI_VIDEOS) fillFromInProgress(notPreview);
        if (mini.length < MAX_MINI_VIDEOS) addFollowingUnwatchedAfterMain(notPreview);
        if (mini.length < MAX_MINI_VIDEOS) addUnwatchedAny(notPreview);
        if (mini.length < MAX_MINI_VIDEOS) addWatchedOldestFirst(notPreview);

        // (7) Ultime secours : n’importe lesquelles restantes
        if (mini.length < MAX_MINI_VIDEOS) {
            for (const p of posts) {
                if (mini.length >= MAX_MINI_VIDEOS) break;
                pushMini(p);
            }
        }
    }

    // ===== Stats globales =====
    const watched = logs.filter((l) => l.status === "watched").length;
    const inProgressCount = logs.filter((l) => l.status === "in-progress").length;
    const total = posts.length;
    const percent = total ? Math.round((watched / total) * 100) : 0;
    const lastActivityAt = isoMax(logs.map((l) => isoMax([l.updatedAt, l.lastSeenAt, l.lastCompletedAt])));

    return {
        main: mainPost && {
            postId: mainPost._id,
            slug: mainPost.slug,
            title: mainPost.title,
            status: mainLog?.status ?? "unwatched",
            levels: mainPost.level,
            mainImage: (mainPost as any).mainImage ?? undefined,
            mainVideo: (mainPost as any).mainVideo,
            percentTime: Math.round((mainLog?.progress || 0) * 100),
        },
        mini,
        stats: { percent, watched, inProgress: inProgressCount, total, lastActivityAt },
    };
}

/* ============================================================
   EXAMS : dernier, 2 suggestions, stats
   ============================================================ */

export function computeHeroExamData(progress: Progress | null | undefined, exams: Exam[]): HeroExamData {
    const logs = (progress?.examLogs ?? []).slice();

    // Dernière activité côté exams
    const decorated = logs.map((l) => ({
        log: l,
        lastAt: isoMax([l.bestScoreAt, l.lastCompletedAt, l.updatedAt]),
    }));
    decorated.sort((a, b) => (a.lastAt ?? "").localeCompare(b.lastAt ?? ""));

    const lastLog = decorated.at(-1)?.log;
    const findExam = (id?: string) => exams.find((e) => e._id === id);

    const lastExam = lastLog ? findExam(lastLog.exam?._ref) : undefined;

    // Suggestions : 2 du même "type" (niveau + compétence) non faits
    const completedIds = new Set(logs.map((l) => l.exam?._ref));
    const lastLevel = lastExam?.levels[0];

    // Stats : moyenne perso par niveau + nb "à faire" pour le niveau du dernier
    const levels: ExamLevel[] = ["A1", "A2", "B1"];
    const avgByLevel: Record<"A1" | "A2" | "B1", number | null> = {
        A1: null,
        A2: null,
        B1: null,
    };

    for (const lvl of levels) {
        const scores = logs
            .map((l) => {
                const d = findExam(l.exam?._ref);
                return d?.levels[0] === lvl ? l.bestScore : undefined;
            })
            .filter((x): x is number => typeof x === "number");
        avgByLevel[lvl as unknown as "A1" | "A2" | "B1"] = scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null;
    }

    const allexamsByLevel: Record<"A1" | "A2" | "B1", number> = {
        A1: exams.filter((e) => e.levels[0] === "A1").length,
        A2: exams.filter((e) => e.levels[0] === "A2").length,
        B1: exams.filter((e) => e.levels[0] === "B1").length,
    };

    const doneCountByLevel: Record<"A1" | "A2" | "B1", number> = {
        A1: logs.filter((l) => {
            const d = findExam(l.exam?._ref);
            return d?.levels[0] === "A1" && l.bestScore != null;
        }).length,
        A2: logs.filter((l) => {
            const d = findExam(l.exam?._ref);
            return d?.levels[0] === "A2" && l.bestScore != null;
        }).length,
        B1: logs.filter((l) => {
            const d = findExam(l.exam?._ref);
            return d?.levels[0] === "B1" && l.bestScore != null;
        }).length,
    };

    const allexamsForLastLevel = lastLevel != null ? allexamsByLevel[lastLevel as unknown as "A1" | "A2" | "B1"] : 0;
    const todoCountForLastLevel = lastLevel != null ? exams.filter((e) => e.levels[0] === lastLevel && !completedIds.has(e._id)).length : undefined;

    const lastActivityAt = isoMax(logs.map((l) => isoMax([l.bestScoreAt, l.lastCompletedAt, l.updatedAt])));

    return {
        last: lastExam && {
            examId: lastExam._id,
            title: lastExam.title,
            levels: lastExam.levels,
            competence: lastExam.competence,
            image: lastExam.image,
            description: lastExam.description,
            score: lastLog?.bestScore,
        },
        stats: {
            avgByLevel,
            todoCountForLastLevel,
            allexamsForLastLevel,
            lastActivityAt,
            allexamsByLevel,
            doneCountByLevel,
        },
    };
}

/* ============================================================
   COACHING : prochain RDV, minutes & urgence
   (Utilise ton type PrivateLesson retourné par ton hook Calendly)
   ============================================================ */

export function computeHeroCoachingData(pl?: PrivateLesson | null): HeroCoachingData {
    const remainingMinutes = pl?.remainingMinutes ?? 0;
    const currentMinutes = pl?.currentMinutes ?? 0;
    const upcomingMinutes = pl?.upcomingMinutes ?? 0;
    const completedMinutes = pl?.completedMinutes ?? 0;
    const totalPurchasedMinutes = pl?.totalPurchasedMinutes ?? 0;

    // Choisir le prochain event (priorité "current", sinon "upcoming" le plus proche)
    const events = (pl?.events ?? []).slice();
    const nowKey = (e: Event) => `${e.date}T${e.startTime}`; // "YYYY-MM-DDTHH:mm" attendu par ton hook

    const current = events.find((e) => e.status === "current");
    let nextEvent: Event | undefined = current;
    if (!nextEvent) {
        const upcomingSorted = events.filter((e) => e.status === "upcoming").sort((a, b) => nowKey(a).localeCompare(nowKey(b)));
        nextEvent = upcomingSorted[0];
    }

    // Urgence : prochain event dans < 72h
    let urgent = false;
    if (nextEvent) {
        const candidate = new Date(`${nextEvent.date}T${nextEvent.startTime}:00`);
        const delta = candidate.getTime() - Date.now();
        if (!Number.isNaN(delta)) urgent = urgent || delta <= 72 * 60 * 60 * 1000;
    }

    const lastPastEventDate = (() => {
        const last = (pl?.events ?? [])
            .filter((e) => ["completed", "current"].includes(e.status))
            .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
            .at(-1);

        return last ? last.date : undefined;
    })();

    return {
        nextEvent,
        lastPastEventDate,
        remainingMinutes,
        currentMinutes,
        upcomingMinutes,
        completedMinutes,
        totalPurchasedMinutes,
        urgent,
    };
}

/* ============================================================
   DÉCISION : quel "kind" afficher en héros ?
   - coaching prioritaire si urgent
   - sinon comparaison de la fraîcheur vidéo vs examens
   ============================================================ */

export function decideHeroKind(progress: Progress | null | undefined, coaching: HeroCoachingData | null | undefined): HeroKind {
    if (coaching?.urgent) return "coaching-urgent";

    const videoLast = isoMax((progress?.videoLogs ?? []).map((l) => isoMax([l.updatedAt, l.lastSeenAt, l.lastCompletedAt])));
    const examLast = isoMax((progress?.examLogs ?? []).map((l) => isoMax([l.bestScoreAt, l.lastCompletedAt, l.updatedAt])));

    const v = videoLast ? new Date(videoLast).getTime() : -1;
    const e = examLast ? new Date(examLast).getTime() : -1;

    if (v === -1 && e === -1 && !!coaching?.totalPurchasedMinutes) return "coaching";
    if (v === -1 && e === -1) return "none";
    return v >= e ? "video" : "exams";
}

/* ============================================================
   Orchestrateur : construit tout l'objet "HeroData"
   ============================================================ */

export function buildHeroData(progress: Progress | null | undefined, toc: FidePackSommaire, exams: Exam[], privateLesson?: PrivateLesson | null, hasPack?: boolean): HeroData {
    const video = computeHeroVideoData(progress, toc, hasPack);
    const exam = computeHeroExamData(progress, exams);
    const coaching = computeHeroCoachingData(privateLesson);
    const kind = decideHeroKind(progress, coaching);

    return {
        kind,
        video,
        exams: exam,
        coaching,
    };
}
