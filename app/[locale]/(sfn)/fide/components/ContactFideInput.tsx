"use client";
import Spinner from "@/app/components/common/Spinner";
import { sendContactEmail } from "@/app/serverActions/contactActions";
import { useState } from "react";
import { BsCheckCircle } from "react-icons/bs";

export const ContactFideInput = ({ formMessages }: { formMessages: any }) => {
    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        // Rassemble les données du formulaire
        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get("email"),
        };

        try {
            const response = await sendContactEmail(data, "input");

            if (response.status === "success") {
                setSuccess(true);
            } else {
                setError(true);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du formulaire :", error);
            setError(true);
        } finally {
            setPending(false);
        }
    };

    return (
        <>
            {success ? (
                <div className="success-message text-left w-form-done color-neutral-100">
                    <div className="flex-horizontal success-message-horizontal items-center">
                        <BsCheckCircle className="mr-2 min-w-8" style={{ fontSize: 28 }} />
                        <div>{formMessages["successMessage"]}</div>
                    </div>
                </div>
            ) : error ? (
                <div className="error-message w-form-fail color-neutral-100">
                    <div>{formMessages["errorMessage"]}</div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label className="field-label">Label</label>
                    <div className="position-relative">
                        <input type="email" name="email" className="input button-inside w-input" placeholder={formMessages["placeholder"]} id="Email" required />
                        <button type="submit" className="btn-primary border border-neutral-100 sm:border-0 inside-input default w-button" style={{ minWidth: 145 }}>
                            {pending ? <Spinner radius maxHeight="40px" /> : formMessages["button"]}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};
