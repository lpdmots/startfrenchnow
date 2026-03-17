import { NextRequest, NextResponse } from "next/server";
import { groq } from "next-sanity";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

export const runtime = "nodejs";

const retentionDays = Math.max(1, Number(process.env.MOCK_EXAM_AUDIO_RETENTION_DAYS || 7));
const region = process.env.AWS_REGION || "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "start-french-now";

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

const CANDIDATE_SESSIONS_QUERY = groq`
  *[
    _type == "mockExamSession" &&
    coalesce(resume.updatedAt, startedAt) < $cutoffIso
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
    defined(sessionKey)
  ]{
    sessionKey
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
        if (!key.startsWith("mock-exams/")) continue;
        unique.add(key);
    }
    return Array.from(unique);
};

const stripAudioUrl = (answers: AnswerWithAudio[]) =>
    (answers || []).map((answer) => {
        const { audioUrl: _audioUrl, ...rest } = answer || {};
        return rest;
    });

const chunkArray = <T,>(items: T[], chunkSize: number) => {
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

const cleanupHandler = async (request: NextRequest) => {
    if (!isAuthorizedCronRequest(request)) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const dryRun = request.nextUrl.searchParams.get("dry") === "1";
    if (!dryRun && (!region || !accessKeyId || !secretAccessKey || !bucketName)) {
        return NextResponse.json({ ok: false, error: "S3 configuration is incomplete." }, { status: 500 });
    }
    const cutoffIso = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000).toISOString();

    const [sessions, scheduledReviewRows] = await Promise.all([
        client.fetch<SessionCandidate[]>(CANDIDATE_SESSIONS_QUERY, { cutoffIso }),
        client.fetch<Array<{ sessionKey?: string }>>(SCHEDULED_REVIEW_SESSIONS_QUERY),
    ]);

    const scheduledSessionKeys = new Set((scheduledReviewRows || []).map((row) => String(row?.sessionKey || "").trim()).filter(Boolean));

    const summary = {
        dryRun,
        retentionDays,
        cutoffIso,
        scannedSessions: (sessions || []).length,
        skippedScheduledReview: 0,
        processedSessions: 0,
        eligibleSessions: 0,
        candidateAudioKeys: 0,
        deletedAudioKeys: 0,
        deleteErrors: 0,
        patchedSessions: 0,
        skippedPatchBecauseDeleteErrors: 0,
    };

    for (const session of sessions || []) {
        const sessionId = String(session?._id || "").trim();
        if (!sessionId) continue;
        summary.processedSessions += 1;

        if (scheduledSessionKeys.has(sessionId)) {
            summary.skippedScheduledReview += 1;
            continue;
        }

        const speakA2Answers = Array.isArray(session.speakA2Answers) ? session.speakA2Answers : [];
        const speakBranchAnswers = Array.isArray(session.speakBranchAnswers) ? session.speakBranchAnswers : [];
        const audioKeys = Array.from(new Set([...extractAudioKeys(speakA2Answers), ...extractAudioKeys(speakBranchAnswers)]));
        if (!audioKeys.length) {
            continue;
        }

        summary.eligibleSessions += 1;
        summary.candidateAudioKeys += audioKeys.length;

        if (!dryRun) {
            let sessionDeleteErrors = 0;
            for (const chunk of chunkArray(audioKeys, 1000)) {
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
                sessionDeleteErrors += chunkErrors;
            }

            if (sessionDeleteErrors > 0) {
                summary.skippedPatchBecauseDeleteErrors += 1;
                continue;
            }

            await client
                .patch(sessionId)
                .set({
                    speakA2Answers: stripAudioUrl(speakA2Answers),
                    speakBranchAnswers: stripAudioUrl(speakBranchAnswers),
                })
                .commit({ autoGenerateArrayKeys: true });
            summary.patchedSessions += 1;
        }
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
