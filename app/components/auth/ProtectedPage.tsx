"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Spinner from "../common/Spinner";

export const ProtectedPage = ({ callbackUrl, messageInfo, children }: { callbackUrl: string; messageInfo: string; children: React.ReactNode }) => {
    const { status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/auth/signIn?callbackUrl=" + callbackUrl + "&info=" + messageInfo);
        },
    });

    if (status === "loading") {
        return (
            <div className="flex justify-center items-center w-full h-screen">
                <Spinner maxHeight="70px" message="Check authentication" />
            </div>
        );
    }

    return <div className="w-full h-full">{children}</div>;
};
