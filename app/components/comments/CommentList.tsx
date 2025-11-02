// app/components/comments/CommentList.tsx
import { listComments } from "@/app/serverActions/comments";
import CommentThread from "./CommentThread";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { CommentResourceType } from "@/app/types/sfn/comment";

type Props = {
    resourceType: CommentResourceType;
    resourceId: string;
    page?: number;
    pageSize?: number;
    locale?: "fr" | "en";
};

export default async function CommentList({ resourceType, resourceId, page = 1, pageSize = 20, locale }: Props) {
    const data = await listComments({ resourceType, resourceId, page, pageSize });
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session?.user;

    const viewerIsAdmin = session?.user?.isAdmin === true;

    const items = (data.items || []).map((c: any) => ({
        id: c._id,
        body: c.body ?? "",
        voteCount: c.voteCount ?? 0,
        createdAt: c._createdAt,
        updatedAt: c._updatedAt,
        status: c.status ?? "active",
        isSeen: c.isSeen ?? false,
        author: {
            name: c.author?.name ?? "Invité",
            email: c.author?.email ?? null,
            isYou: c.author?.isYou ?? false,
            isAdmin: c.author?.isAdmin ?? false,
        },
        hasVoted: !!c.hasVoted,
        isEdited: c.isEdited,
        replies: (c.replies || []).map((r: any) => ({
            id: r._id,
            body: r.body ?? "",
            voteCount: r.voteCount ?? 0,
            createdAt: r._createdAt,
            updatedAt: r._updatedAt,
            status: r.status ?? "active",
            isSeen: r.isSeen ?? false,
            author: {
                name: r.author?.name ?? "Invité",
                email: r.author?.email ?? null,
                isYou: r.author?.isYou ?? false,
                isAdmin: r.author?.isAdmin ?? false,
            },
            replyTo: r.replyTo ? { id: r.replyTo.id, name: r.replyTo.name } : null,
            hasVoted: !!r.hasVoted,
            isEdited: r.isEdited,
        })),
    }));

    return <CommentThread resourceType={resourceType} resourceId={resourceId} items={items} isAuthenticated={isAuthenticated} viewerIsAdmin={viewerIsAdmin} locale={locale} />;
}
