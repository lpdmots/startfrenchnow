"use client";

import Spinner from "@/app/components/common/Spinner";
import { sendContactEmail } from "@/app/serverActions/contactActions";
import { useLocale } from "next-intl";
import { useId, useState } from "react";

export const AskForPdf = ({ messages, withLabel = true }: { messages: any; withLabel?: boolean }) => {
    const locale = useLocale() as "fr" | "en";
    const [pending, setPending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false);
    const [startedAt] = useState(() => Date.now());
    const fieldId = useId();
    const websiteId = `${fieldId}-website`;
    const emailId = `${fieldId}-email`;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (pending) return;

        setPending(true);
        setError(false);

        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get("email"),
            localeLike: locale,
            website: formData.get("website"),
            startedAt: formData.get("startedAt"),
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
                <p role="status" aria-live="polite" className="w-full rounded-xl bg-neutral-100 p-4 md:p-8">
                    {messages["successMessage"]}
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col items-center">
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
                        <label htmlFor={websiteId}>Website</label>
                        <input id={websiteId} name="website" type="text" tabIndex={-1} autoComplete="off" />
                    </div>
                    {withLabel && <p>{messages["ask"]}</p>}
                    <div className="position-relative w-full md:w-auto md:min-w-full">
                        <label htmlFor={emailId} className="sr-only">
                            {messages["emailPlaceholder"]}
                        </label>
                        <input type="email" name="email" className="input button-inside w-input" placeholder={messages["emailPlaceholder"]} id={emailId} required />
                        <button
                            type="submit"
                            disabled={pending}
                            aria-busy={pending}
                            aria-label={messages["button"]}
                            className="btn-primary inside-input default w-button border border-neutral-100 transition-[background-color,border-color,color,transform,opacity] duration-150 ease-out active:scale-[0.96] disabled:cursor-wait disabled:opacity-70 motion-reduce:transform-none sm:border-0"
                            style={{ minWidth: 145 }}
                        >
                            {pending ? (
                                <span aria-hidden="true">
                                    <Spinner radius maxHeight="40px" />
                                </span>
                            ) : (
                                messages["button"]
                            )}
                        </button>
                    </div>
                    {error ? (
                        <p role="alert" className="mt-3 w-full rounded-xl bg-secondaryShades-6 p-3 text-sm font-semibold text-neutral-800">
                            {messages["errorMessage"]}
                        </p>
                    ) : null}
                </form>
            )}
        </>
    );
};
