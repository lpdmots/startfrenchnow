"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

export const ContinueWithGoogle = () => {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get("callbackUrl") || "/";

    const handleClick = () => {
        signIn("google", { callbackUrl });
    };

    return (
        <button onClick={handleClick} className="btn btn-secondary bg-secondary-2 w-full p-2 border-none">
            <div className="flex items-center">
                <div>
                    <Image src="/images/google.svg" className="bg-neutral-300 rounded-lg md:rounded-xl" alt="google icon" height={50} width={50} />
                </div>
                <p className="grow m-0">Continue with Google</p>
            </div>
        </button>
    );
};
