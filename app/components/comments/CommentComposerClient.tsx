"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { Popover } from "../animations/Popover";
import { CommentResourceType } from "@/app/types/sfn/comment";
import { useTranslations } from "next-intl";

type Props = {
    action: (state: any, formData: FormData) => Promise<{ ok: boolean; error: string | null; data?: any }>;
    resourceType: CommentResourceType;
    resourceId: string;
    parentId: string | null;
    isAuthenticated: boolean;
    userDisplayName: string | null;
};

export const MAXCOMMENTLENGTH = 1000;
const EMOJIS = ["🙂", "😄", "😁", "😂", "😉", "😊", "😍", "😎", "🤔", "🙌", "🎉", "👍", "👎", "🔥", "💡", "❓"];

function countLinks(s: string) {
    const re = /(https?:\/\/|www\.)/gi;
    return (s.match(re) || []).length;
}

export default function CommentComposerClient(props: Props) {
    const [pending, setPending] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [value, setValue] = useState("");

    const translationKey = "Fide.CommentComposer";
    const t = useTranslations(translationKey);

    const nameRef = useRef<HTMLInputElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const linkCount = useMemo(() => countLinks(value), [value]);
    const tooLong = value.length > MAXCOMMENTLENGTH;
    const isEmpty = value.trim().length === 0;
    const tooManyLinks = linkCount > 3;

    const disableSubmit = pending || isEmpty || tooLong || tooManyLinks;

    const insertAtCursor = useCallback(
        (text: string) => {
            const el = textareaRef.current;
            if (!el) return;
            const start = el.selectionStart ?? value.length;
            const end = el.selectionEnd ?? value.length;
            const next = value.slice(0, start) + text + value.slice(end);
            setValue(next);
            requestAnimationFrame(() => {
                el.focus();
                const pos = start + text.length;
                el.setSelectionRange(pos, pos);
            });
        },
        [value],
    );

    const onSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (disableSubmit) return;
            setPending(true);
            setServerError(null);
            try {
                const fd = new FormData(e.currentTarget);
                const res = await props.action(null as any, fd);
                if (res.ok) {
                    setValue("");
                    if (nameRef.current) nameRef.current.value = "";
                } else {
                    setServerError(res.error || t("unknownError"));
                }
            } catch (err: any) {
                setServerError(err?.message || t("unknownError"));
            } finally {
                setPending(false);
            }
        },
        [disableSubmit, props, t],
    );

    return (
        <div className="w-full">
            <form onSubmit={onSubmit} className="space-y-2">
                {/* Contexte */}
                <input type="hidden" name="resourceType" value={props.resourceType} />
                <input type="hidden" name="resourceId" value={props.resourceId} />
                <input type="hidden" name="parentId" value={props.parentId ?? ""} />
                {/* Honeypot */}
                <input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />

                {/* Invité */}
                {!props.isAuthenticated && (
                    <div className="flex gap-4 flex-wrap">
                        <div className="w-full sm:w-auto">
                            <label className="mb-1 text-sm text-neutral-700">{t("nameLabel")}</label>
                            <input
                                ref={nameRef}
                                name="guestName"
                                required
                                maxLength={80}
                                placeholder={t("namePlaceholder")}
                                className="w-full rounded-lg border-2 border-neutral-700 bg-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <label className="mb-1 text-sm text-neutral-700">{t("emailLabel")}</label>
                            <input
                                type="email"
                                name="guestEmail"
                                placeholder={t("emailPlaceholder")}
                                className="w-full rounded-lg border-2 border-neutral-700 bg-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                            />
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-end pb-2">
                    {/* Entête identité */}
                    <div className="text-neutral-700 flex items-end">
                        {["fide_dashboard", "french_dashboard"].includes(props.resourceType) ? (
                            <h4 className="underline decoration-secondary-3 text-xl md:text-3xl font-medium w-full mb-0">{t("askQuestionHeading")}</h4>
                        ) : props.isAuthenticated ? (
                            <span>
                                {t("postedAsAuthenticatedPrefix")} <b>{props.userDisplayName ?? t("defaultUser")}</b>
                            </span>
                        ) : (
                            <span>
                                {t("postedAsGuestPrefix")} <b>{t("guestLabel")}</b>
                            </span>
                        )}
                    </div>

                    {/* Toolbar minimale */}
                    <div className="relative flex flex-wrap items-center gap-2">
                        <Popover
                            content={<span className="mb-0 cursor-pointer p-1 border-2 border-solid border-neutral-600 rounded-lg translate_on_hover">😊</span>}
                            popover={
                                <div
                                    onMouseDown={(e) => e.preventDefault()} // évite de blur le textarea
                                >
                                    <div className="flex flex-wrap gap-2 max-w-sm">
                                        {EMOJIS.map((emo) => (
                                            <div
                                                key={emo}
                                                className="cursor-pointer rounded px-1 py-1 text-lg hover:bg-neutral-100"
                                                onMouseDown={(e) => {
                                                    e.preventDefault(); // évite le blur du textarea
                                                    e.stopPropagation(); // évite une éventuelle fermeture anticipée
                                                    insertAtCursor(emo); // insertion au caret
                                                }}
                                            >
                                                {emo}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                            isOnClick={true}
                            withShadow={false}
                            small={true}
                        />
                    </div>
                </div>

                {/* Zone de texte simple */}
                <div className="flex flex-col">
                    <textarea
                        ref={textareaRef}
                        name="body"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={5}
                        maxLength={MAXCOMMENTLENGTH * 2} // on laisse taper un peu plus mais on bloque à l’envoi
                        placeholder={t("textareaPlaceholder")}
                        className="min-h-[120px] w-full resize-y rounded-md border-2 border-neutral-700 bg-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-400"
                    />
                </div>

                {/* Erreur serveur */}
                {serverError && <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</div>}

                {/* Actions */}
                <div className="flex w-full justify-between items-center">
                    <div className="flex items-center gap-2">
                        <button type="submit" disabled={disableSubmit} className="btn btn-primary small !py-3 !text-sm">
                            {pending ? t("publishing") : t("publish")}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setValue("");
                            }}
                            disabled={pending}
                            className="btn btn-secondary small !py-3 !text-sm"
                        >
                            {t("clear")}
                        </button>
                    </div>
                    <div className="mt-1 flex items-center justify-end text-xs">
                        <span className={tooLong ? "text-secondary-3" : "text-neutral-500"}>{t("counter", { current: value.length, max: MAXCOMMENTLENGTH })}</span>
                    </div>
                </div>
            </form>
        </div>
    );
}
