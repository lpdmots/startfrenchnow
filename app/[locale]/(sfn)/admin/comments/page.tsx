// app/admin/comments/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { redirect } from "next/navigation";
import { groq } from "next-sanity";
import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import AdminCommentsPageClient from "./components/AdminCommentsPageClient";

export const metadata = {
    robots: { index: false, follow: false },
};

const QUERY = groq`
*[
  _type == "comment"
  && (!defined(createdBy) || createdBy->isAdmin != true)
] | order(_createdAt desc)[0...100]{
  _id,
  _createdAt,
  body,
  status,
  isSeen,
  assignedTo,
  isAnswered,
  resourceType,
  "author": select(
    defined(createdBy) => {
      "_id": createdBy->_id,
      "name": coalesce(createdBy->name, createdBy->email),
      "isAdmin": coalesce(createdBy->isAdmin, false)
    },
    {
      "_id": null,
      "name": coalesce(guestName, "Invité"),
      "isAdmin": false
    }
  ),
  "resource": resourceRef->{
    _id,
    _type,
    "title": select(_type=="post" => title, true => null),
    "slug": select(slug.current)
  }
}
`;

export default async function AdminCommentsPage() {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.isAdmin === true;
    if (!isAdmin) redirect("/");

    const name = (session?.user?.name || "").toLowerCase();
    const priorityAssignee: "Nico" | "Yoh" | null = name.startsWith("yoh") ? "Yoh" : name.startsWith("nico") ? "Nico" : null;

    const raw = await sanity.fetch<any[]>(QUERY);

    const comments = raw.map((c) => {
        const anchor = `#comment-${c._id}`;
        const href =
            c.resourceType === "blog" && c.resource?.slug
                ? `/blog/post/${c.resource.slug}${anchor}`
                : c.resourceType === "pack_fide" && c.resource?.slug
                  ? `/fide/videos/${c.resource.slug}${anchor}`
                  : c.resourceType === "french_dashboard"
                    ? `/courses/dashboard/${c?.author?._id ?? ""}${anchor}`
                    : `/fide/dashboard/${c?.author?._id ?? ""}${anchor}`;

        return {
            id: c._id,
            createdAt: c._createdAt,
            body: c.body ?? "",
            status: c.status ?? "active",
            isSeen: c.isSeen === true,
            assignedTo: (c.assignedTo ?? null) as "Nico" | "Yoh" | null,
            resourceType: c.resourceType,
            authorName: c.author?.name ?? "Invité",
            authorIsAdmin: c.author?.isAdmin === true,
            resourceTitle: c.resource?.title ?? null,
            href,
            isAnswered: c.isAnswered === true,
        };
    });

    return <AdminCommentsPageClient comments={comments} priorityAssignee={priorityAssignee} />;
}
