import { useTranslations } from "next-intl";
import React, { useState } from "react";

interface ContactInformationsProps {
    sessionEmail?: string;
    payment: boolean;
    formData: {
        email: string;
        firstName: string;
        lastName: string;
    };
    setFormData: React.Dispatch<
        React.SetStateAction<{
            email: string;
            firstName: string;
            lastName: string;
        }>
    >;
}

export const ContactInformations = ({ sessionEmail, payment, formData, setFormData }: ContactInformationsProps) => {
    const [errors, setErrors] = useState({
        email: null as string | null,
        firstName: null as string | null,
        lastName: null as string | null,
    });

    const [isAliasEmail, setIsAliasEmail] = useState(false);
    const t = useTranslations("contactInformations");

    // Validation des champs
    const validateField = (field: string, value: string) => {
        switch (field) {
            case "email":
                return isValidEmail(value) ? null : t("emailError");
            case "firstName":
                return value.trim() ? null : t("firstNameError");
            case "lastName":
                return value.trim() ? null : t("lastNameError");
            default:
                return null;
        }
    };

    // Gestion des changements dans les champs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: null }));

        // Alias seulement si on est connecté (sessionEmail existe)
        if (name === "email") {
            setIsAliasEmail(!!sessionEmail && value !== sessionEmail);
        }
    };

    // Gestion de la validation au blur
    const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
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
                        disabled={payment}
                        required
                    />
                </div>
                {errors.email && <p className="mb-0 text-secondary-4 text-sm mt-1">{errors.email}</p>}
                {/* Info alias uniquement si connecté */}
                {!errors.email && isAliasEmail && <p className="italic mb-0 text-sm mt-2">{t("emailAliasInfo")}</p>}
            </div>

            {/* First Name */}
            <div className="flex flex-col sm:flex-row gap-4 w-full flex-wrap">
                <div>
                    <div className="flex gap-1 items-center flex-wrap">
                        <p className="mb-0 text-neutral-600 font-thin min-w-24">{t("firstName")}</p>
                        <input
                            type="text"
                            name="firstName"
                            className="rounded-md p-2 w-full sm:w-auto bg-neutral-100 text-neutral-700"
                            autoComplete="given-name"
                            style={{ border: "1px solid var(--neutral-400)" }}
                            value={formData.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={payment}
                            required
                        />
                    </div>
                    {errors.firstName && <p className="mb-0 text-secondary-4 text-sm mt-1">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                    <div className="flex gap-1 items-center flex-wrap">
                        <p className="mb-0 text-neutral-600 font-thin min-w-24">{t("lastName")}</p>
                        <input
                            type="text"
                            name="lastName"
                            className="rounded-md p-2 w-full sm:w-auto bg-neutral-100 text-neutral-700"
                            autoComplete="family-name"
                            style={{ border: "1px solid var(--neutral-400)" }}
                            value={formData.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            disabled={payment}
                            required
                        />
                    </div>
                    {errors.lastName && <p className="mb-0 text-secondary-4 text-sm mt-1">{errors.lastName}</p>}
                </div>
            </div>
        </div>
    );
};

// Fonction pour valider les emails
const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
