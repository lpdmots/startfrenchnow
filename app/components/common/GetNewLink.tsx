"use client";

import { sendNewActivationLink, sendNewPasswordLink } from "@/app/lib/serverActions";
import { useRef, useState } from "react";
import Spinner from "./Spinner";

export const GetNewLink = ({ linkFor = "activate" }: { linkFor?: "activate" | "resetPassword" }) => {
    const email = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState({ error: "", success: "", spinner: false });
    const { error, success } = message;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.current?.value) return setMessage({ error: "Please enter your email address", success: "", spinner: false });
        setMessage({ error: "", success: "", spinner: true });
        const response = linkFor === "activate" ? await sendNewActivationLink(email.current?.value) : await sendNewPasswordLink(email.current?.value);
        setMessage({ error: response?.error || "", success: response?.success || "", spinner: false });
    };

    return (
        <div className="w-form w-full bg-neutral-200" style={{ maxWidth: 500 }}>
            <form onSubmit={handleSubmit}>
                <div className="position-relative w-full">
                    <input type="email" ref={email} className="input button-inside w-input" maxLength={256} placeholder="Your email address" autoComplete="on" />
                    <button type="submit" className="btn-primary inside-input default w-button">
                        {message.spinner ? <Spinner maxHeight="50px" color="var(--neutral-100)" /> : "Get a link"}
                    </button>
                </div>
            </form>
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
        </div>
    );
};
