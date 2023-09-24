"use client";
import Spinner from "@/app/components/common/Spinner";
import { updateUserPassword } from "@/app/serverActions/authActions";
import Link from "next-intl/link";
import { useState, useRef } from "react";

export const NewPasswordForm = ({ messages, token }: { messages: any; token: string }) => {
    const pass1 = useRef<HTMLInputElement>(null);
    const pass2 = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState({ error: "", success: "", spinner: false });
    const { error, success, spinner } = message;

    const handleNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage({ ...message, spinner: true });
        if (!pass1.current?.value || !pass2.current?.value) {
            setMessage({ ...message, error: messages.error.emptyFields, spinner: false });
            return;
        }
        if (pass1.current?.value?.trim() !== pass2.current?.value?.trim()) {
            setMessage({ ...message, error: messages.error.mismatch, spinner: false });
            return;
        }
        const response = await updateUserPassword(pass1.current.value, token);
        console.log({ response });
        setMessage({ ...message, error: response?.error ? messages.error.oops : "", success: response?.success ? messages.success : "", spinner: false });
    };
    return (
        <form onSubmit={handleNewPassword}>
            <div className="grid grid-cols-2 gap-4">
                <input ref={pass1} type="password" className="col-span-2 sm:col-span-1 input w-password-page w-input" name="password1" placeholder={messages.passwordPlaceholder} autoComplete="on" />
                <input ref={pass2} type="password" className="col-span-2 sm:col-span-1 input w-password-page w-input" name="password2" placeholder={messages.confirmPlaceholder} autoComplete="on" />
            </div>
            {success && (
                <div className="success-register-message password w-password-page w-form-fail !mx-0">
                    <div>{message.success}</div>
                </div>
            )}
            {error && (
                <div className="error-message password w-password-page w-form-fail !mx-0">
                    <div>{message.error}</div>
                </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-4">
                {message.success ? (
                    <Link href="/auth/signIn" className="btn-primary w-button">
                        {messages.loginButton}
                    </Link>
                ) : (
                    <button type="submit" className="col-span-2 sm:col-span-1 btn-primary w-full w-button">
                        {spinner ? <Spinner maxHeight="50px" color="var(--neutral-100)" /> : messages.updateButton}
                    </button>
                )}
            </div>
        </form>
    );
};
