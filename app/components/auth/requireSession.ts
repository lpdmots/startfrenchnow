import { authOptions } from "@/app/lib/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireSession({ callbackUrl = "/", info = "" }: { callbackUrl?: string; info?: string } = {}) {
    const session = await getServerSession(authOptions);
    if (!session) {
        const qs = new URLSearchParams();
        if (callbackUrl) qs.set("callbackUrl", callbackUrl);
        if (info) qs.set("info", info);
        redirect(`/auth/signIn?${qs.toString()}`);
    }
    return session;
}

export async function requireSessionAndFide({ callbackUrl = "/", info = "" }: { callbackUrl?: string; info?: string } = {}) {
    const session = await getServerSession(authOptions);
    if (!session) {
        const qs = new URLSearchParams();
        if (callbackUrl) qs.set("callbackUrl", callbackUrl);
        if (info) qs.set("info", info);
        redirect(`/auth/signIn?${qs.toString()}`);
    }

    if (!session.user.permissions?.some((p) => p.referenceKey === "pack_fide") && !session.user.lessons?.some((l) => l.eventType === "Fide Preparation Class")) {
        redirect("/fide/pack-fide?#plans");
    }

    return session;
}
