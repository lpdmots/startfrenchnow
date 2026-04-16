import { NextRequest, NextResponse } from "next/server";
import { groq } from "next-sanity";
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

export const dynamic = "force-dynamic";


export const runtime = "nodejs";

const retentionDays = Math.max(1, Number(process.env.MOCK_EXAM_AUDIO_RETENTION_DAYS || 7));
const region = process.env.AWS_REGION || "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "start-french-now";
const allowedAudioPrefix = "mock-exams/in-progress/";
const scanS3EnabledByDefault = String(process.env.MOCK_EXAM_AUDIO_SCAN_S3 || "1").trim() === "1";

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

type AnswerWithAudio = {
    _key?: string;
    audioUrl?: string;
    [key: string]: unknown;
};

type SessionCandidate = {
    _id: string;
    updatedAt?: string;
    speakA2Answers?: AnswerWithAudio[];
    speakBranchAnswers?: AnswerWithAudio[];
};

const ALL_SESSIONS_WITH_AUDIO_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    (
      count(speakA2Answers[defined(audioUrl)]) > 0 ||
      count(speakBranchAnswers[defined(audioUrl)]) > 0
    )
  ]{
    _id,
    "updatedAt": coalesce(resume.updatedAt, startedAt),
    speakA2Answers[]{..., audioUrl},
    speakBranchAnswers[]{..., audioUrl}
  }
`;

const SCHEDULED_REVIEW_SESSIONS_QUERY = groq`
  *[
    _type == "examReview" &&
    status == "scheduled" &&
    defined(session._ref)
  ]{
    "sessionId": session._ref
  }
`;

const normalizeS3Key = (value: string) => {
    const raw = String(value || "").trim();
    if (!raw) return "";

    if (raw.startsWith("s3://")) {
        const withoutProtocol = raw.slice(5);
        const slashIndex = withoutProtocol.indexOf("/");
        if (slashIndex < 0) return "";
        return withoutProtocol.slice(slashIndex + 1).replace(/^\/+/, "");
    }

    if (/^https?:\/\//i.test(raw)) {
        try {
            const url = new URL(raw);
            let path = decodeURIComponent(url.pathname || "").replace(/^\/+/, "");
            const firstSegment = path.split("/")[0];
            if (firstSegment === bucketName) {
                path = path.slice(firstSegment.length + 1);
            }
            return path;
        } catch {
            return "";
        }
    }

    return raw.replace(/^\/+/, "");
};

const extractAudioKeys = (answers: AnswerWithAudio[]) => {
    const unique = new Set<string>();
    for (const answer of answers || []) {
        const key = normalizeS3Key(String(answer?.audioUrl || ""));
        if (!key) continue;
        if (!key.startsWith(allowedAudioPrefix)) continue;
        unique.add(key);
    }
    return Array.from(unique);
};

const stripDeletedAudioUrls = (answers: AnswerWithAudio[], deletedAudioKeySet: Set<string>) =>
    (answers || []).map((answer) => {
        const current = answer || {};
        const audioKey = normalizeS3Key(String(current.audioUrl || ""));
        if (!audioKey || !deletedAudioKeySet.has(audioKey)) {
            return current;
        }
        const { audioUrl: _audioUrl, ...rest } = current;
        return rest;
    });

const chunkArray = <T>(items: T[], chunkSize: number) => {
    const chunks: T[][] = [];
    for (let index = 0; index < items.length; index += chunkSize) {
        chunks.push(items.slice(index, index + chunkSize));
    }
    return chunks;
};

const isAuthorizedCronRequest = (request: NextRequest) => {
    const expectedSecret = String(process.env.CRON_SECRET || "").trim();
    const authHeader = String(request.headers.get("authorization") || "").trim();
    if (process.env.NODE_ENV !== "production" && !expectedSecret) {
        return true;
    }
    if (!expectedSecret) {
        return false;
    }
    return authHeader === `Bearer ${expectedSecret}`;
};

const collectObjectKeysOlderThanCutoff = async (cutoffTimeMs: number) => {
    const oldKeys = new Set<string>();
    let continuationToken: string | undefined;

    do {
        const page = await s3Client.send(
            new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: allowedAudioPrefix,
                ContinuationToken: continuationToken,
                MaxKeys: 1000,
            }),
        );

        for (const item of page.Contents || []) {
            const key = String(item.Key || "");
            if (!key.startsWith(allowedAudioPrefix)) continue;
            const lastModifiedMs = item.LastModified ? new Date(item.LastModified).getTime() : NaN;
            if (!Number.isFinite(lastModifiedMs)) continue;
            if (lastModifiedMs < cutoffTimeMs) {
                oldKeys.add(key);
            }
        }

        continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (continuationToken);

    return oldKeys;
};

const cleanupHandler = async (request: NextRequest) => {
    if (!isAuthorizedCronRequest(request)) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const dryRun = request.nextUrl.searchParams.get("dry") === "1";
    const scanS3Param = request.nextUrl.searchParams.get("scanS3");
    const shouldScanS3 = scanS3Param === null ? scanS3EnabledByDefault : scanS3Param !== "0";
    if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
        return NextResponse.json({ ok: false, error: "S3 configuration is incomplete." }, { status: 500 });
    }
    const cutoffTimeMs = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const cutoffIso = new Date(cutoffTimeMs).toISOString();

    const [sessions, scheduledReviewRows] = await Promise.all([
        client.fetch<SessionCandidate[]>(ALL_SESSIONS_WITH_AUDIO_QUERY),
        client.fetch<Array<{ sessionId?: string }>>(SCHEDULED_REVIEW_SESSIONS_QUERY),
    ]);

    let oldObjectKeys = new Set<string>();
    let s3ScanError = "";
    if (shouldScanS3) {
        try {
            oldObjectKeys = await collectObjectKeysOlderThanCutoff(cutoffTimeMs);
        } catch (error) {
            s3ScanError = error instanceof Error ? error.message : "S3 scan failed.";
            console.error("[Cron][MockExamAudioCleanup] S3 scan failed", error);
        }
    }

    const scheduledSessionKeys = new Set((scheduledReviewRows || []).map((row) => String(row?.sessionId || "").trim()).filter(Boolean));
    const protectedAudioKeys = new Set<string>();
    const expiredAudioKeysFromSessionData = new Set<string>();
    let skippedScheduledReviewCount = 0;

    for (const session of sessions || []) {
        const sessionId = String(session?._id || "").trim();
        if (!sessionId) continue;

        const speakA2Answers = Array.isArray(session.speakA2Answers) ? session.speakA2Answers : [];
        const speakBranchAnswers = Array.isArray(session.speakBranchAnswers) ? session.speakBranchAnswers : [];
        const sessionAudioKeys = Array.from(new Set([...extractAudioKeys(speakA2Answers), ...extractAudioKeys(speakBranchAnswers)]));
        if (!sessionAudioKeys.length) continue;

        const sessionUpdatedAtMs = new Date(String(session.updatedAt || "")).getTime();
        const isRecentSession = Number.isFinite(sessionUpdatedAtMs) && sessionUpdatedAtMs >= cutoffTimeMs;
        const isProtectedByReview = scheduledSessionKeys.has(sessionId);
        if (isProtectedByReview) {
            skippedScheduledReviewCount += 1;
        }
        if (isProtectedByReview || isRecentSession) {
            for (const key of sessionAudioKeys) {
                protectedAudioKeys.add(key);
            }
            continue;
        }

        for (const key of sessionAudioKeys) {
            expiredAudioKeysFromSessionData.add(key);
        }
    }

    const candidateAudioKeys = new Set<string>(expiredAudioKeysFromSessionData);
    for (const key of oldObjectKeys) {
        if (!protectedAudioKeys.has(key)) {
            candidateAudioKeys.add(key);
        }
    }

    const keysToDelete = Array.from(candidateAudioKeys).filter((key) => !protectedAudioKeys.has(key));
    const deletedAudioKeySet = new Set(keysToDelete);

    const summary = {
        dryRun,
        s3ScanEnabled: shouldScanS3,
        s3ScanError,
        retentionDays,
        cutoffIso,
        scannedSessions: (sessions || []).length,
        skippedScheduledReview: skippedScheduledReviewCount,
        processedSessions: (sessions || []).length,
        eligibleSessions: 0,
        candidateAudioKeys: keysToDelete.length,
        candidateFromSessionData: expiredAudioKeysFromSessionData.size,
        candidateFromS3AgedObjects: oldObjectKeys.size,
        protectedAudioKeys: protectedAudioKeys.size,
        deletedAudioKeys: 0,
        deleteErrors: 0,
        patchedSessions: 0,
        skippedPatchBecauseDeleteErrors: 0,
    };

    if (keysToDelete.length) {
        summary.eligibleSessions = (sessions || []).filter((session) => {
            const speakA2Answers = Array.isArray(session.speakA2Answers) ? session.speakA2Answers : [];
            const speakBranchAnswers = Array.isArray(session.speakBranchAnswers) ? session.speakBranchAnswers : [];
            const sessionAudioKeys = Array.from(new Set([...extractAudioKeys(speakA2Answers), ...extractAudioKeys(speakBranchAnswers)]));
            return sessionAudioKeys.some((key) => deletedAudioKeySet.has(key));
        }).length;
    }

    if (!dryRun && keysToDelete.length) {
        for (const chunk of chunkArray(keysToDelete, 1000)) {
            try {
                const result = await s3Client.send(
                    new DeleteObjectsCommand({
                        Bucket: bucketName,
                        Delete: {
                            Objects: chunk.map((key) => ({ Key: key })),
                            Quiet: true,
                        },
                    }),
                );
                summary.deletedAudioKeys += Number(result.Deleted?.length || 0);
                const chunkErrors = Number(result.Errors?.length || 0);
                summary.deleteErrors += chunkErrors;
            } catch (error) {
                console.error("[Cron][MockExamAudioCleanup] S3 delete chunk failed", error);
                summary.deleteErrors += chunk.length;
            }
        }
    }

    if (!dryRun && summary.deleteErrors === 0 && keysToDelete.length) {
        for (const session of sessions || []) {
            const sessionId = String(session?._id || "").trim();
            if (!sessionId) continue;

            const speakA2Answers = Array.isArray(session.speakA2Answers) ? session.speakA2Answers : [];
            const speakBranchAnswers = Array.isArray(session.speakBranchAnswers) ? session.speakBranchAnswers : [];
            const nextSpeakA2Answers = stripDeletedAudioUrls(speakA2Answers, deletedAudioKeySet);
            const nextSpeakBranchAnswers = stripDeletedAudioUrls(speakBranchAnswers, deletedAudioKeySet);
            const wasUpdated = JSON.stringify(nextSpeakA2Answers) !== JSON.stringify(speakA2Answers) || JSON.stringify(nextSpeakBranchAnswers) !== JSON.stringify(speakBranchAnswers);
            if (!wasUpdated) continue;

            await client
                .patch(sessionId)
                .set({
                    speakA2Answers: nextSpeakA2Answers,
                    speakBranchAnswers: nextSpeakBranchAnswers,
                })
                .commit({ autoGenerateArrayKeys: true });
            summary.patchedSessions += 1;
        }
    } else if (!dryRun && summary.deleteErrors > 0) {
        summary.skippedPatchBecauseDeleteErrors = 1;
    }

    return NextResponse.json({
        ok: true,
        summary,
    });
};

export async function GET(request: NextRequest) {
    try {
        return await cleanupHandler(request);
    } catch (error) {
        console.error("[Cron][MockExamAudioCleanup] unexpected error", error);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        return await cleanupHandler(request);
    } catch (error) {
        console.error("[Cron][MockExamAudioCleanup] unexpected error", error);
        return NextResponse.json({ ok: false, error: "Internal error" }, { status: 500 });
    }
}
