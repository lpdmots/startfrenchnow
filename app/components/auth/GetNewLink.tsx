"use client";

import { sendNewActivationLink, sendNewPasswordLink } from "@/app/serverActions/authActions";
import { useState } from "react";
import Spinner from "../common/Spinner";

export const GetNewLink = ({
    linkFor = "activate",
    messages,
    defaultEmail = "",
    lockEmail = false,
}: {
    linkFor?: "activate" | "resetPassword";
    messages: any;
    defaultEmail?: string;
    lockEmail?: boolean;
}) => {
    const [email, setEmail] = useState(defaultEmail);
    const [message, setMessage] = useState({ error: "", success: "", spinner: false });
    const { error, success } = message;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email.trim()) return setMessage({ error: messages.errorEmptyEmail, success: "", spinner: false });
        setMessage({ error: "", success: "", spinner: true });
        const response =
            linkFor === "activate" ? await sendNewActivationLink(email, messages.activationEmail) : await sendNewPasswordLink(email, messages.ResetPasswordMail);
        setMessage({ error: response?.error || "", success: response?.success || "", spinner: false });
    };

    return (
        <div className="w-form w-full bg-neutral-200" style={{ maxWidth: 500 }}>
            <form onSubmit={handleSubmit}>
                <div className="position-relative w-full">
                    <input
                        type="email"
                        className="input button-inside w-input"
                        maxLength={256}
                        placeholder={messages.placeholder}
                        autoComplete="on"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly={lockEmail}
                        disabled={lockEmail}
                    />
                    <button type="submit" className="btn-primary inside-input default w-button" style={{ minWidth: 190 }}>
                        {message.spinner ? <Spinner maxHeight="50px" color="var(--neutral-100)" /> : messages.btnGetLink}
                    </button>
                </div>
            </form>
            {success && (
                <div className="success-register-message password w-password-page w-form-fail !mx-0">
                    <div>{messages.successMessage}</div>
                </div>
            )}
            {error && (
                <div className="error-message password w-password-page w-form-fail !mx-0">
                    <div>{messages.errorMessage}</div>
                </div>
            )}
        </div>
    );
};
