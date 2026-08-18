"use client";
import { ChevronRight, CircleUserRound, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/navigation";
import DropdownMenu from "../common/DropdownMenu";
import { LogOut } from "./LogOut";
import { useSession } from "next-auth/react";
import { usePathname } from "@/i18n/navigation";
import { LinkCurrentBlog } from "../common/LinkCurrentBlog";
import { useLocale, useTranslations } from "next-intl";
import { COURSES_PACKAGES_KEYS } from "@/app/lib/constantes";

export const ProfilButton = ({ logout }: { logout: string }) => {
    const { data: session } = useSession();
    const pathname = usePathname();
    const isAdmin = session?.user?.isAdmin === true;
    const locale = useLocale() as "fr" | "en";
    const t = useTranslations("Navigation");
    const hasFideDashboardAccess = !!(
        session?.user?.hasMockExamAccess === true ||
        session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide") ||
        session?.user?.lessons?.some((l) => l.eventType === "Fide Preparation Class")
    );
    const hasCoursesDashboardAccess = !!session?.user?.permissions?.some((p) => COURSES_PACKAGES_KEYS.includes(p.referenceKey as any));

    if (!session)
        return (
            <Link aria-label={t("my_account")} href={"/auth/signIn?callbackUrl=" + pathname} className="nav-link header-nav-link flex size-11 items-center justify-center rounded-xl !p-0">
                <CircleUserRound aria-hidden="true" className="size-6" strokeWidth={2} />
            </Link>
        );

    const dropdownProfil = {
        content: (
            <div className="card p-4 mt-2">
                <div className="flex flex-col" style={{ minWidth: 125 }}>
                    <LinkCurrentBlog href="/account" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale={locale}>
                        <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
                        {t("my_account")}
                    </LinkCurrentBlog>
                    {isAdmin && (
                        <>
                            <LinkCurrentBlog href="/admin/comments" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale="fr">
                                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
                                Commentaires (Admin)
                            </LinkCurrentBlog>
                            <LinkCurrentBlog href="/admin/exam-reviews" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale="fr">
                                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
                                Exam Reviews (Admin)
                            </LinkCurrentBlog>
                            <LinkCurrentBlog href="/admin/reports" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale="fr">
                                <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
                                Rapports (Admin)
                            </LinkCurrentBlog>
                        </>
                    )}
                    {hasFideDashboardAccess && (
                        <LinkCurrentBlog href="/fide/dashboard" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale={locale}>
                            <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
                            {t("fideButton.dashboard")}
                        </LinkCurrentBlog>
                    )}
                    {hasCoursesDashboardAccess && (
                        <LinkCurrentBlog href="/courses/dashboard" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale={locale}>
                            <ChevronRight aria-hidden="true" className="size-4" strokeWidth={2} />
                            {t("courses.dashboard")}
                        </LinkCurrentBlog>
                    )}
                    <div>
                        <LogOut logout={logout} />
                    </div>
                </div>
            </div>
        ),
        button: (
            <div className="flex size-11 cursor-pointer items-center justify-center rounded-xl text-neutral-800 transition-colors duration-150 ease-out hover:text-secondary-2">
                <GraduationCap aria-hidden="true" className="size-6" strokeWidth={2} />
            </div>
        ),
    };

    return (
        <DropdownMenu content={dropdownProfil.content} ariaLabel={t("my_account")}>
            <div>{dropdownProfil.button}</div>
        </DropdownMenu>
    );
};
