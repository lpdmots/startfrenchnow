import { ADMINASSIGNEES, COMMENTRESOURCES } from "@/app/lib/constantes";
import { Reference } from "./blog";

export type CommentResourceType = (typeof COMMENTRESOURCES)[number];
export type AdminAssignee = (typeof ADMINASSIGNEES)[number] | null;

export interface Comment {
    _id: string;
    parentRef?: Reference;
    replyToRef?: Reference;
    resourceType: CommentResourceType;
    resourceRef: Reference;
    body: string;
    createdBy?: Reference;
    guestName?: string;
    guestEmail?: string;
    upvoters?: Reference[];
    voteCount: number;
    status: "active" | "hidden";
    isEdited: boolean;
    isSeen?: boolean;
    assignedTo?: AdminAssignee;
    isAnswered?: boolean;
}

export type ThreadAuthor = {
    name: string;
    email: string | null;
    isYou?: boolean;
    isAdmin?: boolean;
};
export type ThreadReply = {
    id: string;
    body: string;
    voteCount: number;
    createdAt: string;
    updatedAt?: string;
    status?: "active" | "hidden";
    isSeen?: boolean;
    author: {
        name: string;
        email: string | null;
        isYou?: boolean;
        isAdmin?: boolean;
    };
    replyTo?: { id: string; name: string } | null;
    hasVoted?: boolean;
    isEdited: boolean;
};

export type ThreadItem = {
    id: string;
    body: string;
    voteCount: number;
    createdAt: string;
    updatedAt?: string;
    status?: "active" | "hidden";
    isSeen?: boolean;
    author: {
        name: string;
        email: string | null;
        isYou?: boolean;
        isAdmin?: boolean;
    };
    hasVoted?: boolean;
    replies: ThreadReply[];
    isEdited: boolean;
};
