"use client";
import GoogleAnalytics from "../components/common/Analytics/GoogleAnalytics";
import { AnalyticsWrapper } from "../components/common/Analytics/Analytics";
import LazyM from "../components/animations/LazyM";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SessionProvider>
                <AnalyticsWrapper />
                <LazyM>
                    <main>{children}</main>
                </LazyM>
                <GoogleAnalytics />
            </SessionProvider>
        </>
    );
}
