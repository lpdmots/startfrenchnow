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
        <div data-w-id="32f4274f-5340-1bd4-838f-6737839a901b" className="flex max-w-[388px] p-[45px_32px_55px] flex-col justify-start items-center rounded-[24px] bg-[var(--primary)] shadow-[10px_10px_0_0_var(--neutral-800)] max-[991px]:max-w-full max-[991px]:pr-[40px] max-[991px]:pl-[40px] max-[767px]:p-[40px_34px_50px] max-[479px]:pr-[24px] max-[479px]:pl-[24px] max-[479px]:justify-center p-4 sm:p-8">
            <div className="mb-4 w-full flex justify-center">
                <Image src={course.image} height={150} width={200} loading="eager" alt={imageAlt} className="w-full h-auto rounded-2xl border-2 border-solid border-neutral-800" />
            </div>
            <div className="text-centermb-8">
                <div className="inner-container max-[991px]:max-w-[400px] center">
                    <div className="inner-container _350px---mbl center">
                        <h2 className="display-4 mb-2">{title}</h2>
                        <p className="mb-0 text-lg">{description}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <Link href={`/courses/${course.courseSlug}`} className="btn-primary full-width project-btn w-inline-block">
                    {ctaLabel}
                </Link>
                <p className="text-sm color-neutral-700 mt-2 text-center mb-0">{t("reassurance")}</p>
            </div>
        </div>
    );
}

export default CourseRecommendationCard;
