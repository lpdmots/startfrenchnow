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

type UserAccessSnapshot = {
    permissions?: Array<{ referenceKey?: string; expiresAt?: string | null }> | null;
    lessons?: Array<{ eventType?: string; totalPurchasedMinutes?: number }> | null;
    mockCredit?: {
        totalCredits?: number;
        remainingCredits?: number;
    } | null;
    compilationCount?: number;
} | null;

const FRENCH_COURSE_KEYS = new Set(["udemy_course_beginner", "udemy_course_intermediate", "udemy_course_dialogs"]);

const isPermissionActive = (expiresAt?: string | null) => !expiresAt || new Date(expiresAt).getTime() > Date.now();

const hasPermission = (
    permissions: Array<{ referenceKey?: string; expiresAt?: string | null }> | null | undefined,
    predicate: (referenceKey: string) => boolean,
) => !!permissions?.some((p) => !!p?.referenceKey && predicate(p.referenceKey) && isPermissionActive(p.expiresAt));

const hasPackFidePermission = (permissions: Array<{ referenceKey?: string; expiresAt?: string | null }> | null | undefined) =>
    hasPermission(permissions, (referenceKey) => referenceKey === "pack_fide");

const hasFrenchCoursePermission = (permissions: Array<{ referenceKey?: string; expiresAt?: string | null }> | null | undefined) =>
    hasPermission(permissions, (referenceKey) => FRENCH_COURSE_KEYS.has(referenceKey));

const hasPrivateLesson = (lessons: Array<{ eventType?: string; totalPurchasedMinutes?: number }> | null | undefined) =>
    !!lessons?.some((lesson) => lesson?.eventType === "Fide Preparation Class");

const hasMockExamFromSnapshot = (snapshot: UserAccessSnapshot) => {
    const totalCredits = Number(snapshot?.mockCredit?.totalCredits || 0);
    const remainingCredits = Number(snapshot?.mockCredit?.remainingCredits || 0);
    const compilationCount = Number(snapshot?.compilationCount || 0);
    return hasPackFidePermission(snapshot?.permissions) || totalCredits > 0 || remainingCredits > 0 || compilationCount > 0;
};

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

export const hasPackFideAccess = (session: AppSession) => hasPackFidePermission(session?.user?.permissions || []);

export const hasPrivateCourseAccess = (session: AppSession) => hasPrivateLesson(session?.user?.lessons || []);

const getUserAccessSnapshot = async (session: AppSession) => {
    const userId = session?.user?._id;
    if (!userId) return null;

    return client.fetch<UserAccessSnapshot>(
        `*[_type == "user" && _id == $userId][0]{
            permissions[]{
                referenceKey,
                expiresAt
            },
            lessons[]{
                eventType,
                totalPurchasedMinutes
            },
            "mockCredit": credits[referenceKey == "mock_exam"][0]{
                totalCredits,
                remainingCredits
            },
            "compilationCount": count(examCompilations)
        }`,
        { userId },
    );
};

export const hasMockExamAccess = async (session: AppSession) => {
    if (session?.user?.hasMockExamAccess === true || hasPackFideAccess(session)) {
        return true;
    }

    const snapshot = await getUserAccessSnapshot(session);
    return hasMockExamFromSnapshot(snapshot);
};

export const hasFrenchCourseAccess = (session: AppSession) =>
    hasFrenchCoursePermission(session?.user?.permissions || []);

const hasAccessFromSession = (rule: SessionAccessRule, session: AppSession) => {
    switch (rule) {
        case "packFide":
            return hasPackFideAccess(session);
        case "privateCourse":
            return hasPrivateCourseAccess(session);
        case "mockExam":
            return session?.user?.hasMockExamAccess === true || hasPackFideAccess(session);
        case "frenchCourse":
            return hasFrenchCourseAccess(session);
        default:
            return false;
    }
};

const hasAccessFromSnapshot = (rule: SessionAccessRule, snapshot: UserAccessSnapshot) => {
    switch (rule) {
        case "packFide":
            return hasPackFidePermission(snapshot?.permissions);
        case "privateCourse":
            return hasPrivateLesson(snapshot?.lessons);
        case "mockExam":
            return hasMockExamFromSnapshot(snapshot);
        case "frenchCourse":
            return hasFrenchCoursePermission(snapshot?.permissions);
        default:
            return false;
    }
};

export async function requireSession({ callbackUrl = "/", info = "" }: RequireSessionOptions = {}) {
    return getSessionOrRedirectToSignIn({ callbackUrl, info });
}

export async function requireSessionWithAccess({ callbackUrl = "/", info = "", anyOf = [], unauthorizedRedirectTo }: RequireSessionWithAccessOptions) {
    const session = await getSessionOrRedirectToSignIn({ callbackUrl, info });

    if (!anyOf.length) {
        return session;
    }

    for (const rule of anyOf) {
        if (hasAccessFromSession(rule, session)) {
            return session;
        }
    }

    const snapshot = await getUserAccessSnapshot(session);
    for (const rule of anyOf) {
        if (hasAccessFromSnapshot(rule, snapshot)) {
            return session;
        }
    }

    redirect(unauthorizedRedirectTo);
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
