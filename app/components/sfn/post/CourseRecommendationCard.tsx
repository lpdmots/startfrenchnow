import { BLOG_COURSE_FALLBACK_LEVEL, BLOG_COURSE_RECOMMENDATIONS } from "@/app/lib/constantes";
import type { Level, Post } from "@/app/types/sfn/blog";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import Image from "next/image";

type BlogCourseLevel = keyof typeof BLOG_COURSE_RECOMMENDATIONS;

const resolveRecommendedLevel = (levels?: Level[]): BlogCourseLevel | null => {
    if (!levels || levels.length === 0) return null;
    if (levels.includes("b2")) return "b2";
    if (levels.includes("b1")) return "b1";
    if (levels.includes("a2")) return "a2";
    if (levels.includes("a1")) return "a1";
    return null;
};

function CourseRecommendationCard({ post }: { post: Post }) {
    const t = useTranslations("CourseRecommendationCard");
    const recommendedLevel = resolveRecommendedLevel(post.level);
    const courseKey = recommendedLevel ?? BLOG_COURSE_FALLBACK_LEVEL;
    const course = BLOG_COURSE_RECOMMENDATIONS[courseKey];
    const title = t("title");
    const description = t("description");
    const ctaLabel = recommendedLevel ? t("ctaWithLevel", { level: course.levelLabel }) : t("ctaFallback");
    const imageAlt = recommendedLevel ? t("imageAltWithLevel", { level: course.levelLabel }) : t("imageAltFallback");

    return (
        <div data-w-id="32f4274f-5340-1bd4-838f-6737839a901b" className="newsletter-card p-8">
            <div className="mg-bottom-24px w-full flex justify-center">
                <Image src={course.image} height={150} width={200} loading="eager" alt={imageAlt} className="w-auto h-[150px] rounded-2xl border-2 border-solid border-neutral-800" />
            </div>
            <div className="text-center mg-bottom-24px">
                <div className="inner-container _400px---tablet center">
                    <div className="inner-container _350px---mbl center">
                        <h2 className="display-4 mg-bottom-8px">{title}</h2>
                        <p className="mb-0 text-lg">{description}</p>
                    </div>
                </div>
            </div>
            <div className="nesletter-sidebar-form-block w-form">
                <Link href={`/courses/${course.courseSlug}`} className="btn-primary full-width project-btn w-inline-block">
                    {ctaLabel}
                </Link>
                <p className="text-sm color-neutral-700 mt-3 text-center">{t("reassurance")}</p>
            </div>
        </div>
    );
}

export default CourseRecommendationCard;
