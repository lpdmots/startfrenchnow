"use client";

import { useSession } from "next-auth/react";

type Props = {
    permissionKey: string;
    children: React.ReactNode;
};

export default function CoursePricingGuard({ permissionKey, children }: Props) {
    const { data: session } = useSession();
    const hasCourse = !!session?.user?.permissions?.some((p) => p.referenceKey === permissionKey);

    if (hasCourse) return null;
    return <>{children}</>;
}
