import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { redirect } from "next/navigation";

type RequireSessionOptions = {
    callbackUrl?: string;
    info?: string;
};

export type SessionAccessRule = "packFide" | "privateCourse" | "mockExam" | "frenchCourse";

type RequireSessionWithAccessOptions = RequireSessionOptions & {
    anyOf?: SessionAccessRule[];
    unauthorizedRedirectTo: string;
};

type AppSession = Session;

type MockExamAccessSnapshot = {
    mockCredit?: {
        totalCredits?: number;
        remainingCredits?: number;
    } | null;
    compilationCount?: number;
} | null;

const buildSignInQuery = ({ callbackUrl = "/", info = "" }: RequireSessionOptions = {}) => {
    const qs = new URLSearchParams();
    if (callbackUrl) qs.set("callbackUrl", callbackUrl);
    if (info) qs.set("info", info);
    return qs;
};

const getSessionOrRedirectToSignIn = async ({ callbackUrl = "/", info = "" }: RequireSessionOptions = {}): Promise<AppSession> => {
    const session = await getServerSession(authOptions);
    if (!session) {
        const qs = buildSignInQuery({ callbackUrl, info });
        redirect(`/auth/signIn?${qs.toString()}`);
    }

    return session;
};

export const hasPackFideAccess = (session: AppSession) => !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");

export const hasPrivateCourseAccess = (session: AppSession) => !!session?.user?.lessons?.some((lesson) => lesson.eventType === "Fide Preparation Class");

const hasMockExamAccessFromDb = async (session: AppSession) => {
    const userId = session?.user?._id;
    if (!userId) return false;

    const snapshot = await client.fetch<MockExamAccessSnapshot>(
        `*[_type == "user" && _id == $userId][0]{
            "mockCredit": credits[referenceKey == "mock_exam"][0]{
                totalCredits,
                remainingCredits
            },
            "compilationCount": count(examCompilations)
        }`,
        { userId },
    );

    const totalCredits = Number(snapshot?.mockCredit?.totalCredits || 0);
    const remainingCredits = Number(snapshot?.mockCredit?.remainingCredits || 0);
    const compilationCount = Number(snapshot?.compilationCount || 0);
    return totalCredits > 0 || remainingCredits > 0 || compilationCount > 0;
};

export const hasMockExamAccess = async (session: AppSession) => {
    if (session?.user?.hasMockExamAccess === true || hasPackFideAccess(session)) {
        return true;
    }

    return hasMockExamAccessFromDb(session);
};

export const hasFrenchCourseAccess = (session: AppSession) =>
    !!session?.user?.permissions?.some((p) => p.referenceKey === "udemy_course_beginner" || p.referenceKey === "udemy_course_intermediate" || p.referenceKey === "udemy_course_dialogs");

const ACCESS_RULES: Record<SessionAccessRule, (session: AppSession) => boolean | Promise<boolean>> = {
    packFide: hasPackFideAccess,
    privateCourse: hasPrivateCourseAccess,
    mockExam: hasMockExamAccess,
    frenchCourse: hasFrenchCourseAccess,
};

export async function requireSession({ callbackUrl = "/", info = "" }: RequireSessionOptions = {}) {
    return getSessionOrRedirectToSignIn({ callbackUrl, info });
}

export async function requireSessionWithAccess({ callbackUrl = "/", info = "", anyOf = [], unauthorizedRedirectTo }: RequireSessionWithAccessOptions) {
    const session = await getSessionOrRedirectToSignIn({ callbackUrl, info });

    if (!anyOf.length) {
        return session;
    }

    let isAuthorized = false;
    for (const rule of anyOf) {
        if (await ACCESS_RULES[rule](session)) {
            isAuthorized = true;
            break;
        }
    }
    if (!isAuthorized) {
        redirect(unauthorizedRedirectTo);
    }

    return session;
}

export async function requireSessionAndFide({ callbackUrl = "/", info = "" }: { callbackUrl?: string; info?: string } = {}) {
    return requireSessionWithAccess({
        callbackUrl,
        info,
        anyOf: ["packFide", "privateCourse", "mockExam"],
        unauthorizedRedirectTo: "/fide#plans",
    });
}

export async function requireSessionAndFrench({ callbackUrl = "/", info = "" }: { callbackUrl?: string; info?: string } = {}) {
    return requireSessionWithAccess({
        callbackUrl,
        info,
        anyOf: ["frenchCourse"],
        unauthorizedRedirectTo: "/courses/beginners",
    });
}

export async function requireSessionAndMockExam({ callbackUrl = "/", info = "" }: RequireSessionOptions = {}) {
    return requireSessionWithAccess({
        callbackUrl,
        info,
        anyOf: ["mockExam"],
        unauthorizedRedirectTo: "/fide/mock-exams",
    });
}
