// app/components/comments/CommentComposer.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { createComment } from "@/app/serverActions/comments";
import CommentComposerClient from "./CommentComposerClient";
import { CommentResourceType } from "@/app/types/sfn/comment";

type Props = {
    resourceType: CommentResourceType;
    resourceId: string; // _id Sanity du post ou du user (dashboard)
    parentId?: string | null; // null/undefined = top-level
};

async function submitAction(_: any, formData: FormData) {
    "use server";
    try {
        const payload = {
            resourceType: formData.get("resourceType") as CommentResourceType,
            resourceId: formData.get("resourceId") as string,
            body: (formData.get("body") as string) ?? "",
            guestName: (formData.get("guestName") as string) || undefined,
            guestEmail: (formData.get("guestEmail") as string) || undefined,
            parentId: (formData.get("parentId") as string) || null,
            honeypot: (formData.get("honeypot") as string) || "",
        };
        const res = await createComment(payload);
        return { ok: true as const, error: null, data: res };
    } catch (e: any) {
        return { ok: false as const, error: e?.message || "Erreur inconnue" };
    }
}

export default async function CommentComposer(props: Props) {
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;
    const userDisplayName = session?.user?.name ?? null;

    return (
        <CommentComposerClient
            action={submitAction}
            resourceType={props.resourceType}
            resourceId={props.resourceId}
            parentId={props.parentId ?? null}
            isAuthenticated={isAuthenticated}
            userDisplayName={userDisplayName}
        />
    );
}
