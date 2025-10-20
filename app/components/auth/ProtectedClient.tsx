// app/components/auth/ProtectedClient.tsx
"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FaSpinner } from "react-icons/fa";

export function ProtectedClient({ callbackUrl, messageInfo, children }: { callbackUrl: string; messageInfo?: string; children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/auth/signIn?callbackUrl=${encodeURIComponent(callbackUrl)}&info=${encodeURIComponent(messageInfo ?? "")}`);
        }
    }, [status, callbackUrl, messageInfo, router]);

    if (status === "loading") {
        return (
            <div className="flex flex-col justify-center items-center w-full h-screen gap-4">
                <FaSpinner className="animate-spin text-neutral-400 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />
                <p className="text-neutral-400">Check authentication...</p>
            </div>
        );
    }

    if (status === "authenticated") return <>{children}</>;
    return null;
}
