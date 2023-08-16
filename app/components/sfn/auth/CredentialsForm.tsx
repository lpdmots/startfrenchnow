"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Spinner from "@/app/components/common/Spinner";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const initialFormState = { email: "", password: "" };

export const CredentialsForm = () => {
    const [formData, setFormData] = useState(initialFormState);
    const [message, setMessage] = useState({ error: "", success: "", spinner: false });
    const { error, success, spinner } = message;
    const searchParams = useSearchParams();
    const callbackUrl = searchParams?.get("callbackUrl") || "/";
    const info = searchParams?.get("info") || "";
    const router = useRouter();

    //console.log({ callbackUrl });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
        if (message) setMessage({ error: "", success: "", spinner: false });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage({ error: "", success: "", spinner: true });
        await signIn("credentials", { ...formData, redirect: false }).then((response) => {
            if (response?.error === "CredentialsSignin") {
                setMessage({ error: "Credentials do not match!", success: "", spinner: false });
            } else if (response?.error) {
                setMessage({ error: "Oops, there's been an error...", success: "", spinner: false });
            } else {
                router.replace(callbackUrl);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="utility-page-form w-password-page">
            {info && (
                <div className="info-register-message password w-password-page w-form-fail !mx-0 !mt-0 mb-4">
                    <div>{info}</div>
                </div>
            )}
            <div className="flex flex-col w-full gap-4">
                <div className="flex flex-col gap-4">
                    <input type="email" className="input w-password-page w-input" onChange={handleChange} name="email" placeholder="Your email address" autoComplete="on" />
                    <input type="password" className="input w-password-page w-input" onChange={handleChange} name="password" placeholder="Your password" autoComplete="on" />
                </div>
                {error && (
                    <div className="error-message password w-password-page w-form-fail !mx-0 !mt-0">
                        <div>{message.error}</div>
                    </div>
                )}
                {success && (
                    <div className="success-register-message password w-password-page w-form-fail !mx-0 !mt-0">
                        <div>{message.success}</div>
                    </div>
                )}
                <button type="submit" className="btn-primary w-password-page w-button" style={{ minHeight: "72px" }}>
                    {spinner ? <Spinner maxHeight="50px" color="var(--neutral-100)" /> : "Log in"}
                </button>
                <div className="flex header-nav-list-item items-center px-0 mb-0">
                    <Link href="/auth/reset-password/get-password-link" className="flex nav-link header-nav-link p-0">
                        <p className="bs mb-0">Forgot password ?</p>
                    </Link>
                </div>
            </div>
        </form>
    );
};
