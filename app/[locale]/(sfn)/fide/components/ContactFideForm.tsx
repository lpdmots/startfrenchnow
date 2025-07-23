"use client";
import Spinner from "@/app/components/common/Spinner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { sendContactEmail } from "@/app/serverActions/contactActions";
import { useState } from "react";

export const ContactFideForm = ({ messages }: { messages: any }) => {
    const [pending, setPending] = useState(false);
    const [message, setMessage] = useState<React.ReactElement | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setPending(true);

        // Rassemble les données du formulaire
        const formData = new FormData(e.currentTarget);
        const data = {
            objectif: formData.get("objectif"),
            niveauActuel: formData.get("niveauActuel"),
            niveauSouhaite: formData.get("niveauSouhaite"),
            message: formData.get("message"),
            email: formData.get("email"),
        };

        try {
            const response = await sendContactEmail(data);

            if (response.status === "success") {
                setMessage(<p className="card p-4 md:p-8 w-full border border-dashed border-secondary-5 bg-neutral-800 max-w-4xl mb-0">{messages["successMessage"]}</p>);
            } else {
                setMessage(<p className="card p-4 md:p-8 w-full border border-dashed border-secondary-4 bg-neutral-800 max-w-4xl mb-0">{messages["errorMessage"]}</p>);
            }
        } catch (error) {
            console.error("Erreur lors de l'envoi du formulaire :", error);
            setMessage(<p className="card p-4 md:p-8 w-full border border-dashed border-secondary-4 bg-neutral-800 max-w-4xl mb-0">{messages["errorMessage"]}</p>);
        } finally {
            setPending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-8 w-full items-center" style={{ minWidth: "min(500px, 100%)" }}>
            <h3 className="text-neutral-100">{messages["subtitle"]}</h3>
            <div className="w-full max-w-4xl grid grid-cols-3 gap-4 md:gap-8">
                <Select name="objectif">
                    <SelectTrigger className="col-span-3 md:col-span-1 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--secondary-1)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--secondary-1)]">
                        <SelectValue className="color-neutral-800" placeholder={messages["objectifPlaceholder"]} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className="text-lg">{messages["objectifPlaceholder"]}</SelectLabel>
                            <SelectItem className="hover:bg-neutral-200" value="Préparation FIDE">
                                {messages["objectifOptions"]["preparationFide"]}
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="Naturalisation">
                                {messages["objectifOptions"]["naturalisation"]}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select name="niveauActuel">
                    <SelectTrigger className="col-span-3 md:col-span-1 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--secondary-1)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--secondary-1)]">
                        <SelectValue className="color-neutral-800" placeholder={messages["niveauActuelPlaceholder"]} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className="text-lg">{messages["niveauActuelPlaceholder"]}</SelectLabel>
                            <SelectItem className="hover:bg-neutral-200" value="A0">
                                {messages["niveauActuelOptions"]["a0"]}
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="A1">
                                {messages["niveauActuelOptions"]["a1"]}
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="A2">
                                {messages["niveauActuelOptions"]["a2"]}
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="B1">
                                {messages["niveauActuelOptions"]["b1"]}
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="Je ne sais pas">
                                {messages["niveauActuelOptions"]["unknown"]}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Select name="niveauSouhaite">
                    <SelectTrigger className="col-span-3 md:col-span-1 card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--secondary-1)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--secondary-1)]">
                        <SelectValue className="color-neutral-800" placeholder={messages["niveauSouhaitePlaceholder"]} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel className="text-lg">{messages["niveauSouhaitePlaceholder"]}</SelectLabel>
                            <SelectItem className="hover:bg-neutral-200" value="A1">
                                {messages["niveauSouhaiteOptions"]["a1"]}
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="A2">
                                {messages["niveauSouhaiteOptions"]["a2"]}
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="B1">
                                {messages["niveauSouhaiteOptions"]["b1"]}
                            </SelectItem>
                            <SelectItem className="hover:bg-neutral-200" value="Je ne sais pas">
                                {messages["niveauSouhaiteOptions"]["unknown"]}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <textarea
                id="message"
                name="message"
                placeholder={messages["specificRequestPlaceholder"]}
                className="max-w-4xl w-full card rounded-xl p-4 transition-shadow duration-300 hover:!shadow-[5px_5px_0_0_var(--secondary-1)] color-neutral-800 data-[state=open]:!shadow-[5px_5px_0_0_var(--secondary-1)]"
                maxLength={5000}
            ></textarea>

            {message ? (
                message
            ) : (
                <div className="relative max-w-lg w-full">
                    <input
                        type="email"
                        name="email"
                        className="input button-inside w-input !bg-neutral-100 hover:!shadow-[5px_5px_0_0_var(--secondary-1)] focus:!shadow-[5px_5px_0_0_var(--secondary-1)]"
                        placeholder={messages["emailPlaceholder"]}
                        id="Email"
                        required
                    />
                    <button type="submit" className="btn-primary border border-neutral-100 sm:border-0 inside-input default w-button" style={{ minWidth: 145 }}>
                        {pending ? <Spinner radius maxHeight="40px" /> : messages["button"]}
                    </button>
                </div>
            )}

            <p className="max-w-2xl text-center">
                {messages["additionalInfo1"]}
                <span className="underline decoration-secondary-1 text-xl">{messages["additionalInfo2"]}</span>
                {messages["additionalInfo3"]}
            </p>
        </form>
    );
};
