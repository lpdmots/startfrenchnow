import { isValidEmail } from "@/app/lib/utils";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface ContactInformationsProps {
    sessionEmail?: string;
    formData: {
        email: string;
    };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            email: string;
        }>
    >;
    onEmailBlur?: (email: string) => void;
}

export const ContactInformations = ({ sessionEmail, formData, setFormData, onEmailBlur }: ContactInformationsProps) => {
    const [errors, setErrors] = useState({
        email: null as string | null,
    });
    const [hasBlurred, setHasBlurred] = useState(false);

    const [isAliasEmail, setIsAliasEmail] = useState(false);
    const t = useTranslations("contactInformations");

    // Validation des champs
    const validateEmail = (value: string) => (isValidEmail(value) ? null : t("emailRequired"));

    // Gestion des changements dans les champs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));

        // Alias seulement si on est connecté (sessionEmail existe)
        if (name === "email") {
            const current = value.trim().toLowerCase();
            const session = (sessionEmail || "").trim().toLowerCase();
            setIsAliasEmail(!!session && current !== session);
        }
    };

    // Gestion de la validation au blur
    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setHasBlurred(true);
        const error = validateEmail(value);
        setErrors((prev) => ({ ...prev, [name]: error }));
        if (!error && name === "email") {
            onEmailBlur?.(value);
        }
    };

    return (
        <div className="flex flex-col gap-4 md:gap-8">
            {/* Email */}
            <div>
                <div className="flex gap-1 items-center flex-wrap">
                    <p className="mb-0 text-neutral-600 font-thin min-w-24">{t("email")}</p>
                    <input
                        type="email"
                        name="email"
                        className="rounded-md p-2 w-full sm:w-auto bg-neutral-100 text-neutral-700"
                        autoComplete="email"
                        style={{ border: "1px solid var(--neutral-400)" }}
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                </div>
                {errors.email && <p className="mb-0 text-secondary-4 text-sm mt-1">{errors.email}</p>}
                {!errors.email && hasBlurred && !isValidEmail(formData.email) && <p className="mb-0 text-secondary-4 text-sm mt-1">{t("emailRequired")}</p>}
                {/* Info alias uniquement si connecté */}
                {!errors.email && isAliasEmail && <p className="italic mb-0 text-sm mt-2">{t("emailAliasInfo")}</p>}
            </div>
        </div>
    );
};
