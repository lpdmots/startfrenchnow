"use client";
import { useState } from "react";
import { handleSignup } from "@/app/lib/serverActions";
import { SignupFormData } from "@/app/types/sfn/auth";
import Spinner from "@/app/components/common/Spinner";
import { subscribeNewsletter } from "@/app/lib/apiNavigation";
import Link from "next/link";
import { IoArrowBackOutline } from "react-icons/io5";
import { IoMdLock } from "react-icons/io";
import Image from "next/image";
import { SocialButton } from "@/app/components/common/SocialButton";
import { ContinueWithGoogle } from "@/app/components/sfn/auth/ContinueWithGoogle";

const initialFormState: SignupFormData = { email: "", name: "", password1: "", password2: "" };

const SignUp = () => {
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
        const response = await handleSignup(formData);
        if (checked && response?.success) {
            await subscribeNewsletter(formData.email);
        }
        setMessage({ error: response?.error || "", success: response?.success || "", spinner: false });
    };

    return (
        <div className="flex justify-center items-center min-h-screen w-screen">
            <div className="flex flex-col p-2 sm:p-4 w-full" style={{ maxWidth: 550 }}>
                <div data-w-id="2078a685-0c58-ebe5-b8d7-ebd2a748e8ad" className="card no-hover">
                    <div className="pd---content-inside-card large !py-6">
                        <div className="mb-6">
                            <div className="image-wrapper rigth-shadow-circle password-page-icon flex justify-center items-center" style={{ height: 75, width: 75 }}>
                                <IoMdLock style={{ height: 50, width: 50, color: "var(--neutral-800)" }} />
                            </div>
                        </div>
                        <h1 className="display-2 mg-bottom-12px heading-span-secondary-1">Sign up</h1>
                        <form onSubmit={handleSubmit} className="utility-page-form w-password-page">
                            <div className="flex flex-col w-full gap-2">
                                <input type="email" className="input w-password-page w-input" onChange={handleChange} name="email" placeholder="Enter your email" autoComplete="on" />
                                <input type="text" className="input w-password-page w-input" onChange={handleChange} name="name" placeholder="Enter your username" autoComplete="on" />
                                <div className="flex gap-4">
                                    <input type="password" className="input w-password-page w-input" onChange={handleChange} name="password1" placeholder="Password" autoComplete="on" />
                                    <input type="password" className="input w-password-page w-input" onChange={handleChange} name="password2" placeholder="Confirm" autoComplete="on" />
                                </div>
                                <div className="w-checkbox checkbox-field-wrapper mb-2">
                                    <label className="w-form-label flex items-center" onClick={() => setChecked((prev) => !prev)}>
                                        <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checked ? "w--redirected-checked" : undefined}`}></div>
                                        Subscribe to our newsletter
                                    </label>
                                </div>

                                {success ? (
                                    <div className="success-register-message password w-password-page w-form-fail !mx-0">
                                        <div>{message.success}</div>
                                    </div>
                                ) : (
                                    <button type="submit" className="btn-primary w-password-page w-button" style={{ minHeight: "72px" }}>
                                        {spinner ? <Spinner maxHeight="50px" color="var(--neutral-100)" /> : "Create account"}
                                    </button>
                                )}
                                {error && (
                                    <div className="error-message password w-password-page w-form-fail !mx-0">
                                        <div>{message.error}</div>
                                    </div>
                                )}
                            </div>
                        </form>

                        <Divider />
                        <ContinueWithGoogle />
                    </div>
                </div>

                <div className="flex justify-between items-center w-full mt-4">
                    <div className="flex header-nav-list-item middle items-center">
                        <Link href="/" className="flex nav-link header-nav-link p-0">
                            <IoArrowBackOutline className="text-xl md:text-2xl mr-2" />
                            <p className="mb-0" style={{ marginTop: 2 }}>
                                Homepage{" "}
                            </p>
                        </Link>
                    </div>
                    <div className="flex header-nav-list-item middle items-center">
                        <Link href="/auth/signIn" className="flex nav-link header-nav-link p-0">
                            <p className="mb-0">Already have an account ?</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;

const Divider = () => {
    return (
        <div className="grid grid-cols-9 w-full my-2">
            <div className="flex items-center col-span-4">
                <div style={{ width: "100%", border: `1px solid ${"var(--neutral-500)"}` }}></div>
            </div>
            <div className="flex items-center">
                <p className="bs flex justify-center mb-0 w-full" style={{ color: "var(--neutral-500)" }}>
                    Or
                </p>
            </div>
            <div className="flex items-center col-span-4">
                <div style={{ width: "100%", border: `1px solid ${"var(--neutral-500)"}` }}></div>
            </div>
        </div>
    );
};
