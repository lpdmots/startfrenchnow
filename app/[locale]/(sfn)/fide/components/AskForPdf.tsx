"use client";

import Spinner from "@/app/components/common/Spinner";
import { sendContactEmail } from "@/app/serverActions/contactActions";
import { useState } from "react";

export const AskForPdf = ({ messages }: { messages: any }) => {
    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get("email"),
        };

        try {
            const response = await sendContactEmail(data, "pdf");

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
                <p className="card p-4 md:p-8 w-full">{messages["successMessage"]}</p>
            ) : error ? (
                <p className="card p-4 md:p-8 w-full">{messages["errorMessage"]}</p>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
                    <p>{messages["ask"]}</p>
                    <div className="position-relative w-full md:w-auto md:min-w-full">
                        <input type="email" name="email" className="input button-inside w-input" placeholder={messages["emailPlaceholder"]} id="Email" required />
                        <button type="submit" className="btn-primary border border-neutral-100 sm:border-0 inside-input default w-button" style={{ minWidth: 145 }}>
                            {pending ? <Spinner radius maxHeight="40px" /> : messages["button"]}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};

/* 

            <Link className="btn-primary w-button" href={cloudFrontDomain + "fide/fide-exam-presentation.pdf"} target="_blank" rel="noreferrer noopener">
                <FaFileDownload className="mr-2" />
                {t("downloadPdf")}
            </Link>
*/
