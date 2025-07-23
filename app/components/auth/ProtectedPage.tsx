"use client";
import { useSession } from "next-auth/react";
import { FaSpinner } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const ProtectedPage = ({ callbackUrl, messageInfo, children }: { callbackUrl: string; messageInfo: string; children: React.ReactNode }) => {
    const { status } = useSession();
    const router = useRouter();

    // Redirection si l'utilisateur n'est pas authentifié
    useEffect(() => {
        if (status === "unauthenticated") {
            router.push(`/auth/signIn?callbackUrl=${encodeURIComponent(callbackUrl)}&info=${encodeURIComponent(messageInfo)}`);
        }
    }, [status, callbackUrl, messageInfo, router]);

    // Affichage pendant le chargement
    if (status === "loading") {
        return (
            <div className="flex flex-col justify-center items-center w-full h-screen gap-4">
                <FaSpinner className="animate-spin text-neutral-400 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />
                <p className="text-neutral-400">Check authentication...</p>
            </div>
        );
    }

    // Si l'utilisateur est authentifié, affiche le contenu
    if (status === "authenticated") {
        return <div className="w-full h-full">{children}</div>;
    }

    // Par sécurité, un fallback neutre
    return null;
};
