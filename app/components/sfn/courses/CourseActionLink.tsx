"use client";

import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";

type Props = {
    permissionKey: string;
    checkoutUrl: string;
    dashboardUrl: string;
    buyLabel: string;
    continueLabel: string;
    className?: string;
};

export default function CourseActionLink({ permissionKey, checkoutUrl, dashboardUrl, buyLabel, continueLabel, className }: Props) {
    const { data: session } = useSession();
    const hasCourse = !!session?.user?.permissions?.some((p) => p.referenceKey === permissionKey);
    const href = hasCourse ? dashboardUrl : checkoutUrl;
    const label = hasCourse ? continueLabel : buyLabel;

    return (
        <Link href={href} className={className}>
            <span className="line-rounded-icon link-icon-right"> {label}</span>
        </Link>
    );
}
