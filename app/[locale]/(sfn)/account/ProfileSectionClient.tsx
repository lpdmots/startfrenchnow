"use client";

import { updateAccountProfile } from "@/app/serverActions/accountActions";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FaEdit, FaTimes } from "react-icons/fa";

type UserData = {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
};

type ProfileMessages = {
    title: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    edit: string;
    cancel: string;
    save: string;
    saving: string;
    success: string;
    usernameRequired: string;
    genericError: string;
};

export default function ProfileSectionClient({ user, messages }: { user: UserData; messages: ProfileMessages }) {
    const router = useRouter();
    const [firstName, setFirstName] = useState(user.firstName || "");
    const [lastName, setLastName] = useState(user.lastName || "");
    const [username, setUsername] = useState(user.username || "");
    const [isEditing, setIsEditing] = useState(false);
    const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({ type: "idle", message: "" });
    const [isSaving, setIsSaving] = useState(false);

    const resetDraftFromUser = () => {
        setFirstName(user.firstName || "");
        setLastName(user.lastName || "");
        setUsername(user.username || "");
    };

    const startEditing = () => {
        resetDraftFromUser();
        setStatus({ type: "idle", message: "" });
        setIsEditing(true);
    };

    const cancelEditing = () => {
        resetDraftFromUser();
        setStatus({ type: "idle", message: "" });
        setIsEditing(false);
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSaving) return;

        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            setStatus({ type: "error", message: messages.usernameRequired });
            return;
        }

        setIsSaving(true);
        setStatus({ type: "idle", message: "" });

        try {
            const response = await updateAccountProfile({
                firstName,
                lastName,
                name: trimmedUsername,
            });

            if (response?.error) {
                if (response.error === "usernameRequired") {
                    setStatus({ type: "error", message: messages.usernameRequired });
                } else {
                    setStatus({ type: "error", message: messages.genericError });
                }
                return;
            }

            setStatus({ type: "success", message: messages.success });
            setFirstName(firstName.trim());
            setLastName(lastName.trim());
            setUsername(trimmedUsername);
            setIsEditing(false);
            router.refresh();
        } catch {
            setStatus({ type: "error", message: messages.genericError });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <section className="rounded-2xl border border-solid border-neutral-500 bg-neutral-100 p-5 md:p-6 shadow-1">
            <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="mb-0 text-2xl font-semibold text-neutral-800">{messages.title}</h2>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full border border-solid border-neutral-500 bg-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-300 transition-colors"
                    onClick={isEditing ? cancelEditing : startEditing}
                >
                    {isEditing ? <FaTimes className="text-sm" /> : <FaEdit className="text-sm" />}
                    <span>{isEditing ? messages.cancel : messages.edit}</span>
                </button>
            </div>

            {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DisplayField label={messages.firstName} value={firstName || "-"} />
                    <DisplayField label={messages.lastName} value={lastName || "-"} />
                    <DisplayField label={messages.username} value={username || "-"} />
                    <DisplayField label={messages.email} value={user.email || "-"} />
                </div>
            ) : (
                <form onSubmit={onSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <EditableField label={messages.firstName} value={firstName} onChange={setFirstName} autoComplete="given-name" />
                        <EditableField label={messages.lastName} value={lastName} onChange={setLastName} autoComplete="family-name" />
                        <EditableField label={messages.username} value={username} onChange={setUsername} autoComplete="username" />
                        <ReadonlyField label={messages.email} value={user.email} />
                    </div>

                    <button type="submit" className="btn-primary small w-button inline-block" disabled={isSaving}>
                        {isSaving ? messages.saving : messages.save}
                    </button>
                </form>
            )}

            {status.type !== "idle" ? <p className={`mb-0 mt-3 text-sm ${status.type === "success" ? "text-secondary-5" : "text-secondary-4"}`}>{status.message}</p> : null}
        </section>
    );
}

function EditableField({
    label,
    value,
    onChange,
    autoComplete,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    autoComplete?: string;
}) {
    return (
        <label className="rounded-xl border border-solid border-neutral-400 bg-neutral-200 p-3">
            <span className="mb-1 block text-xs uppercase tracking-wide text-neutral-600">{label}</span>
            <input
                className="w-full border border-solid border-neutral-400 rounded-lg bg-neutral-100 px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-secondary-2"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
            />
        </label>
    );
}

function DisplayField({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-solid border-neutral-400 bg-neutral-200 p-3">
            <p className="mb-1 text-xs uppercase tracking-wide text-neutral-600">{label}</p>
            <p className="mb-0 text-neutral-800 font-medium break-all">{value}</p>
        </div>
    );
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
    return (
        <label className="rounded-xl border border-solid border-neutral-400 bg-neutral-200 p-3">
            <span className="mb-1 block text-xs uppercase tracking-wide text-neutral-600">{label}</span>
            <input
                className="w-full cursor-not-allowed border border-solid border-neutral-400 rounded-lg bg-neutral-300 px-3 py-2 text-neutral-700 focus:outline-none"
                value={value}
                readOnly
                disabled
                autoComplete="email"
            />
        </label>
    );
}
