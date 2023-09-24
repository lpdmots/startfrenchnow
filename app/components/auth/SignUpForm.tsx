"use client";
import { useState } from "react";
import { handleSignup } from "@/app/serverActions/authActions";
import { SignupFormData } from "@/app/types/sfn/auth";
import Spinner from "@/app/components/common/Spinner";
import { subscribeNewsletter } from "@/app/lib/apiNavigation";

const initialFormState: SignupFormData = { email: "", name: "", password1: "", password2: "" };

export const SignUpForm = ({ messages }: { messages: any }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [checked, setChecked] = useState(false);
    const [message, setMessage] = useState({ error: "", success: "", spinner: false });
    const { error, success, spinner } = message;

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
        const response = await handleSignup(formData, messages.mailMessages);
        if (checked && response?.success) {
            await subscribeNewsletter(formData.email);
        }
        console.log(messages, response.error, messages.errorMessages[response?.error || ""]);
        setMessage({ error: response?.error ? messages.errorMessages[response.error] : "", success: response?.success ? messages.successMessage : "", spinner: false });
    };

    return (
        <form onSubmit={handleSubmit} className="utility-page-form w-password-page">
            <div className="flex flex-col w-full gap-2">
                <input type="email" className="input w-password-page w-input" onChange={handleChange} name="email" placeholder={messages.enterYourEmail} autoComplete="on" />
                <input type="text" className="input w-password-page w-input" onChange={handleChange} name="name" placeholder={messages.enterYourUsername} autoComplete="on" />
                <div className="flex gap-4">
                    <input type="password" className="input w-password-page w-input" onChange={handleChange} name="password1" placeholder={messages.password} autoComplete="on" />
                    <input type="password" className="input w-password-page w-input" onChange={handleChange} name="password2" placeholder={messages.confirm} autoComplete="on" />
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
