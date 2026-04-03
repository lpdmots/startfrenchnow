"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export const ContinueWithGoogle = ({ message }: { message: string }) => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get("callbackUrl") || "/";

    const handleClick = () => {
        signIn("google", { callbackUrl });
    };

    return (
        <button onClick={handleClick} className="btn btn-secondary bg-secondary-2 w-full p-2 border-none">
            <div className="flex w-full items-center gap-3">
                <div>
                    <Image src="/images/google.svg" className="bg-neutral-300 rounded-lg md:rounded-xl" alt="google icon" height={50} width={50} />
                </div>
                <p className="m-0 grow whitespace-normal text-left sm:text-center">{message}</p>
            </div>
        </button>
    );
};
