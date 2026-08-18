import { formatArticleDate, getArticleDateMetadata } from "@/app/lib/seo/entityGraph.mjs";
import { Locale } from "@/i18n";
import { Link } from "@/i18n/navigation";

interface Props {
    locale: Locale;
    publishedAt: string;
    updatedAt?: string;
}

function PostAuthorMeta({ locale, publishedAt, updatedAt }: Props) {
    const dates = getArticleDateMetadata({ publishedAt, updatedAt });
    const isFr = locale === "fr";

    return (
        <div className="mt-6 flex flex-col items-center gap-2 text-center text-300 color-neutral-600" data-post-author>
            <p className="mb-0">
                {isFr ? "Par " : "By "}
                <Link href="/about" className="font-semibold text-neutral-800 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-700">
                    Yohann Coussot
                </Link>
                <span> — {isFr ? "professeur de français et spécialiste du test FIDE" : "French teacher and FIDE test specialist"}</span>
            </p>
            <p className="mb-0 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>
                    {isFr ? "Publié le " : "Published on "}
                    <time dateTime={dates.publishedAt} data-date-kind="published">
                        {formatArticleDate(dates.publishedAt, locale)}
                    </time>
                </span>
                {dates.updatedAt && (
                    <>
                        <span aria-hidden="true">·</span>
                        <span>
                            {isFr ? "Mis à jour le " : "Updated on "}
                            <time dateTime={dates.updatedAt} data-date-kind="updated">
                                {formatArticleDate(dates.updatedAt, locale)}
                            </time>
                        </span>
                    </>
                )}
            </p>
        </div>
    );
}

export default PostAuthorMeta;
