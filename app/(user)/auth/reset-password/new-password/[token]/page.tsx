"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import Spinner from "@/app/components/common/Spinner";
import { updateUserPassword } from "@/app/serverActions/authActions";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";

interface Props {
    params: {
        token: string;
    };
}

const NewPassword = ({ params: { token } }: Props) => {
    const [message, setMessage] = useState({ error: "", success: "", spinner: false });
    const pass1 = useRef<HTMLInputElement>(null);
    const pass2 = useRef<HTMLInputElement>(null);
    const { error, success, spinner } = message;

    const handleNewPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage({ ...message, spinner: true });
        if (!pass1.current?.value || !pass2.current?.value) {
            setMessage({ ...message, error: "Please fill in all fields", spinner: false });
            return;
        }
        if (pass1.current?.value?.trim() !== pass2.current?.value?.trim()) {
            setMessage({ ...message, error: "Passwords do not match", spinner: false });
            return;
        }
        const response = await updateUserPassword(pass1.current.value, token);
        setMessage({ ...message, error: response?.error || "", success: response?.success || "", spinner: false });
    };

    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <div className="utility-page-wrap not-found">
                <div className="container-default w-container">
                    <div className="position-relative z-index-1">
                        <div className="flex-horizontal">
                            <div id="w-node-d245282e-bd6f-ff12-2569-ce176b30a962-33543d3f" data-w-id="d245282e-bd6f-ff12-2569-ce176b30a962" className="position-absolute _404-not-found">
                                <div className="_404-not-found-number">****</div>
                            </div>
                            <div className="grid-2-columns _1-col-tablet position-relative">
                                <div className="flex justify-center w-full">
                                    <SlideFromBottom>
                                        <div className="flex justify-center">
                                            <div className="image-wrapper rigth-shadow-circle" style={{ height: 200, width: 200 }}>
                                                <Image
                                                    src="/images/password-protected-paperfolio-webflow-template.svg"
                                                    height={200}
                                                    width={200}
                                                    alt="The teacher"
                                                    className="image object-contain"
                                                    priority
                                                />
                                            </div>
                                        </div>
                                    </SlideFromBottom>
                                </div>
                                <div id="w-node-ffe9a45f-94fb-9c90-1679-9bd8e1c7012d-33543d3f" className="inner-container _600px---tablet center">
                                    <div data-w-id="619efe17469a19c94a600b1500000000000b" className="utility-page-content mg-bottom-0 position-relative w-form">
                                        <h1 className="display-1 mg-bottom-8px">New password</h1>
                                        <p className="display-3">Change your password</p>
                                        <p className="mg-bottom-32px">Enter your new password so that you can log in again and continue learning French.</p>
                                        <form onSubmit={handleNewPassword}>
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    ref={pass1}
                                                    type="password"
                                                    className="col-span-2 sm:col-span-1 input w-password-page w-input"
                                                    name="password1"
                                                    placeholder="Password"
                                                    autoComplete="on"
                                                />
                                                <input
                                                    ref={pass2}
                                                    type="password"
                                                    className="col-span-2 sm:col-span-1 input w-password-page w-input"
                                                    name="password2"
                                                    placeholder="Confirm"
                                                    autoComplete="on"
                                                />
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
                                                        Login
                                                    </Link>
                                                ) : (
                                                    <button type="submit" className="col-span-2 sm:col-span-1 btn-primary w-full w-button">
                                                        {spinner ? <Spinner maxHeight="50px" color="var(--neutral-100)" /> : "Update password"}
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewPassword;
