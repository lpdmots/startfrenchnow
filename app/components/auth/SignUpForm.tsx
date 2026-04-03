"use client";
import { useState } from "react";
import { handleSignup } from "@/app/serverActions/authActions";
import { SignupFormData } from "@/app/types/sfn/auth";
import Spinner from "@/app/components/common/Spinner";

const initialFormState: SignupFormData = { email: "", name: "", password1: "", password2: "" };
const USER_FACING_ERROR_KEYS = new Set(["fillAllFields", "emailExist", "notActivated", "emailInvalid", "passwordMismatch", "passwordNotConform"]);

export const SignUpForm = ({ messages }: { messages: any }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [checked, setChecked] = useState(false);
    const [message, setMessage] = useState({ error: "", success: "", spinner: false });
    const { error, success, spinner } = message;
    const [startedAt] = useState(() => Date.now());

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
        const fd = new FormData(e.currentTarget);
        const antiBot = {
            website: String(fd.get("website") ?? ""),
            startedAt: Number(fd.get("startedAt") ?? 0),
        };
        const response = await handleSignup({ ...formData, subscribeNewsletter: checked }, messages.mailMessages, antiBot);
        const errorKey = response?.error as string | undefined;
        const userFacingError = errorKey && USER_FACING_ERROR_KEYS.has(errorKey) ? messages.errorMessages[errorKey] : "";

        setMessage({ error: userFacingError || "", success: response?.success ? messages.successMessage : "", spinner: false });
    };

    return (
        <form onSubmit={handleSubmit} className="flex w-full max-w-[900px] flex-col items-stretch w-password-page">
            <input type="hidden" name="startedAt" value={startedAt} />

            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    left: "-5000px",
                    top: "auto",
                    width: "1px",
                    height: "1px",
                    overflow: "hidden",
                }}
            >
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            <div className="flex flex-col w-full gap-2">
                <input type="email" className="input w-password-page w-input" onChange={handleChange} name="email" placeholder={messages.enterYourEmail} autoComplete="email" />
                <input type="text" className="input w-password-page w-input" onChange={handleChange} name="name" placeholder={messages.enterYourUsername} autoComplete="username" />
                <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                    <input type="password" className="input w-password-page w-input" onChange={handleChange} name="password1" placeholder={messages.password} autoComplete="new-password" />
                    <input type="password" className="input w-password-page w-input" onChange={handleChange} name="password2" placeholder={messages.confirm} autoComplete="new-password" />
                </div>
                <div className="w-checkbox checkbox-field-wrapper mb-2">
                    <label className="w-form-label flex items-center" onClick={() => setChecked((prev) => !prev)}>
                        <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checked ? "w--redirected-checked" : undefined}`}></div>
                        {messages.subscribeNewsletter}
                    </label>
                </div>

                {success ? (
                    <div className="success-register-message password w-password-page w-form-fail !mx-0">
                        <div>{message.success}</div>
                    </div>
                ) : (
                    <button type="submit" className="btn-primary w-password-page w-button" style={{ minHeight: "72px" }}>
                        {spinner ? <Spinner maxHeight="50px" color="var(--neutral-100)" /> : messages.createAccount}
                    </button>
                )}
                {error && (
                    <div className="error-message password w-password-page w-form-fail !mx-0">
                        <div>{message.error}</div>
                    </div>
                )}
            </div>
        </form>
    );
};
