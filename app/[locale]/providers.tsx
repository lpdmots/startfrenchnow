"use client";
import { AnalyticsWrapper } from "@/app/components/common/Analytics/Analytics";
import LazyM from "@/app/components/animations/LazyM";
import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SessionProvider>
                <UserIdProvider />
                <AnalyticsWrapper />
                <LazyM>
                    <div>{children}</div>
                </LazyM>
            </SessionProvider>
        </>
    );
}

const UserIdProvider = () => {
    const { data: session } = useSession();
    useEffect(() => {
        if (session) {
            localStorage.setItem("current-user", session.user._id);
        } else {
            localStorage.removeItem("current-user");
        }
    }, [session]);

    return null;
};
