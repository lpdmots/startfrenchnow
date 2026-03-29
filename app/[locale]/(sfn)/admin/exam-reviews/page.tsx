import Link from "next-intl/link";
import { getServerSession } from "next-auth";
import { groq } from "next-sanity";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as sanity } from "@/app/lib/sanity.clientServerDev";
import { formatDateTime, formatScore, getReviewStatusBadgeClass, getReviewStatusLabel } from "./review-utils";

export const metadata = {
    robots: { index: false, follow: false },
};

const EXAM_REVIEW_LIST_QUERY = groq`
*[_type == "examReview"] | order(coalesce(scheduledAt, _createdAt) desc) [0...300]{
  _id,
  _createdAt,
  userId,
  status,
  scheduledAt,
  "compilationName": compilationRef->name,
  "user": *[_type == "user" && _id == ^.userId][0]{
    _id,
    name,
    email
  },
  scores{
    speakA2{score, max, percentage},
    speakBranch{score, max, percentage},
    readWrite{score, max, percentage}
  }
}
`;

type ExamReviewListItem = {
    _id: string;
    _createdAt?: string;
    userId?: string;
    status?: string;
    scheduledAt?: string;
    compilationName?: string;
    user?: {
        _id?: string;
        name?: string;
        email?: string;
    } | null;
    scores?: {
        speakA2?: { score?: number; max?: number; percentage?: number } | null;
        speakBranch?: { score?: number; max?: number; percentage?: number } | null;
        readWrite?: { score?: number; max?: number; percentage?: number } | null;
    } | null;
};

export default async function AdminExamReviewsPage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.isAdmin !== true) {
        redirect("/");
    }

    const reviews = await sanity.fetch<ExamReviewListItem[]>(EXAM_REVIEW_LIST_QUERY);

    return (
        <div className="page-wrapper mt-8 sm:mt-12 mb-16">
            <div className="section hero v3 wf-section !pt-6">
                <div className="container-default w-container">
                    <div className="inner-container _100---tablet center">
                        <div className="text-center mb-8">
                            <h1 className="display-2 mb-3">
                                Suivi admin des <span className="heading-span-secondary-1">Exam Reviews</span>
                            </h1>
                            <p className="mb-0 text-neutral-700">Vue synthétique des dernières demandes: étudiant, template, statut, date planifiée et scores clés.</p>
                        </div>

                        <div className="card border-2 border-solid border-neutral-700 overflow-x-auto p-0">
                            <table className="min-w-[980px] w-full text-sm">
                                <thead className="bg-neutral-200 text-neutral-700">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-semibold">Date</th>
                                        <th className="text-left px-4 py-3 font-semibold">Étudiant</th>
                                        <th className="text-left px-4 py-3 font-semibold">Template</th>
                                        <th className="text-left px-4 py-3 font-semibold">Statut</th>
                                        <th className="text-left px-4 py-3 font-semibold">Planifié le</th>
                                        <th className="text-left px-4 py-3 font-semibold">Parler A2</th>
                                        <th className="text-left px-4 py-3 font-semibold">Parler Branche</th>
                                        <th className="text-left px-4 py-3 font-semibold">Lire/Écrire</th>
                                        <th className="text-left px-4 py-3 font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.length === 0 ? (
                                        <tr>
                                            <td className="px-4 py-6 text-neutral-600" colSpan={9}>
                                                Aucun exam review trouvé.
                                            </td>
                                        </tr>
                                    ) : (
                                        reviews.map((review) => {
                                            const userName = review.user?.name || review.user?.email || review.userId || "-";
                                            const userMeta = review.user?.name && review.user?.email ? review.user.email : null;
                                            const badgeClass = getReviewStatusBadgeClass(review.status);
                                            return (
                                                <tr key={review._id} className="border-t border-neutral-300 align-top">
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(review._createdAt)}</td>
                                                    <td className="px-4 py-3">
                                                        <p className="mb-0 font-medium">{userName}</p>
                                                        {userMeta ? <p className="mb-0 text-xs text-neutral-500">{userMeta}</p> : null}
                                                    </td>
                                                    <td className="px-4 py-3">{review.compilationName || "-"}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}>{getReviewStatusLabel(review.status)}</span>
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(review.scheduledAt)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatScore(review.scores?.speakA2)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatScore(review.scores?.speakBranch)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">{formatScore(review.scores?.readWrite)}</td>
                                                    <td className="px-4 py-3 whitespace-nowrap">
                                                        <Link href={`/admin/exam-reviews/${review._id}`} className="btn-secondary small !min-h-0 !h-auto !py-2 !px-3 inline-flex no-underline">
                                                            Voir
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
