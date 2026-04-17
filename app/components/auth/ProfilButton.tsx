"use client";
import { FaCaretRight, FaRegUser, FaUserGraduate } from "react-icons/fa";
import { Link } from "@/i18n/navigation";
import DropdownMenu from "../common/DropdownMenu";
import { LogOut } from "./LogOut";
import { useSession } from "next-auth/react";
import { usePathname } from "@/i18n/navigation";
import { LinkCurrentBlog } from "../common/LinkCurrentBlog";
import { useLocale, useTranslations } from "next-intl";
import { COURSES_PACKAGES_KEYS } from "@/app/lib/constantes";

export const ProfilButton = ({ profil, logout }: { profil: string; logout: string }) => {
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
            <Link href={"/auth/signIn?callbackUrl=" + pathname} className="nav-link header-nav-link !p-2 !pb-0">
                <FaRegUser className="text-2xl sm:text-3xl" />
            </Link>
        );

    const dropdownProfil = {
        content: (
            <div className="card p-4 mt-2">
                <div className="flex flex-col" style={{ minWidth: 125 }}>
                    <div>
                        <span className="flex items-center color-neutral-500 opacity-25 p-1">
                            <FaCaretRight />
                            {profil}
                        </span>
                    </div>
                    <LinkCurrentBlog href="/account" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale={locale}>
                        <FaCaretRight />
                        {t("my_account")}
                    </LinkCurrentBlog>
                    {isAdmin && (
                        <>
                            <LinkCurrentBlog href="/admin/comments" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale="fr">
                                <FaCaretRight />
                                Commentaires (Admin)
                            </LinkCurrentBlog>
                            <LinkCurrentBlog href="/admin/exam-reviews" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale="fr">
                                <FaCaretRight />
                                Exam Reviews (Admin)
                            </LinkCurrentBlog>
                        </>
                    )}
                    {hasFideDashboardAccess && (
                        <LinkCurrentBlog href="/fide/dashboard" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale={locale}>
                            <FaCaretRight />
                            {t("fideButton.dashboard")}
                        </LinkCurrentBlog>
                    )}
                    {hasCoursesDashboardAccess && (
                        <LinkCurrentBlog href="/courses/dashboard" className="nav-link header-nav-link p-1 m-0 font-medium flex items-center" locale={locale}>
                            <FaCaretRight />
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
            <div className="p-2 pb-0 cursor-pointer">
                <FaUserGraduate className="text-2xl sm:text-3xl hover:fill-secondary-2 duration-300" style={{ color: "var(--neutral-800)" }} />
            </div>
        ),
    };

    return (
        <DropdownMenu content={dropdownProfil.content}>
            <div>{dropdownProfil.button}</div>
        </DropdownMenu>
    );
};
