"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { createEditor, Descendant, Editor, Node, Transforms, Text } from "slate";
import { Slate, Editable, withReact, RenderLeafProps } from "slate-react";
import { withHistory } from "slate-history";

// Emoji picker v5
const Picker = dynamic(() => import("@emoji-mart/react").then((m) => m.default), { ssr: false });
import data from "@emoji-mart/data";

type Props = {
    action: (state: any, formData: FormData) => Promise<{ ok: boolean; error: string | null; data?: any }>;
    resourceType: "post" | "user";
    resourceId: string;
    parentId: string | null;
    isAuthenticated: boolean;
    userDisplayName: string | null;
};

const MAX = 1000;

function countLinksInText(s: string) {
    const re = /(https?:\/\/|www\.)/gi;
    return (s.match(re) || []).length;
}

function ToolbarButton(props: React.ComponentProps<"button">) {
    const { className = "", ...rest } = props;
    return <button type="button" className={"rounded-md border border-neutral-700 bg-neutral-100 px-2 py-1 text-sm hover:bg-neutral-200 disabled:opacity-50 " + className} {...rest} />;
}

// Slate helpers (marks)
const isMarkActive = (editor: Editor, mark: "bold" | "italic") => {
    const marks = Editor.marks(editor) as any;
    return marks ? !!marks[mark] : false;
};
const toggleMark = (editor: Editor, mark: "bold" | "italic") => {
    if (isMarkActive(editor, mark)) Editor.removeMark(editor, mark);
    else Editor.addMark(editor, mark, true);
};

const initialValue: Descendant[] = [{ type: "p", children: [{ text: "" }] } as any];

export default function CommentComposerClient(props: Props) {
    const [editorKey, setEditorKey] = useState(0);
    const editor = useMemo(() => withHistory(withReact(createEditor())), [editorKey]);
    const [pending, setPending] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const [value, setValue] = useState<Descendant[]>(initialValue);
    const [showPicker, setShowPicker] = useState(false);

    // Mesures (texte / liens) pour les limites UI
    const plainText = useMemo(() => value.map((n) => Node.string(n)).join(""), [value]);
    const linkCount = countLinksInText(plainText);
    const tooLong = plainText.length > MAX;
    const isEmpty = plainText.trim().length === 0;
    const tooManyLinks = linkCount > 3;
    const disableSubmit = pending || isEmpty || tooLong || tooManyLinks;

    // Insertion helpers
    const insertText = useCallback(
        (text: string) => {
            Transforms.insertText(editor, text);
        },
        [editor]
    );

    // Raccourcis clavier (Ctrl/Cmd + B/I)
    const onKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!(e.ctrlKey || e.metaKey)) return;
            const k = e.key.toLowerCase();
            if (k === "b") {
                e.preventDefault();
                toggleMark(editor, "bold");
            } else if (k === "i") {
                e.preventDefault();
                toggleMark(editor, "italic");
            }
        },
        [editor]
    );

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (disableSubmit) return;
        setPending(true);
        setServerError(null);
        try {
            const fd = new FormData(e.currentTarget);
            fd.set("body", JSON.stringify(value));
            const res = await props.action(null as any, fd);
            if (res.ok) {
                setEditorKey((k) => k + 1);
                setValue(initialValue);
                setShowPicker(false);
            } else {
                setServerError(res.error || "Erreur inconnue");
            }
        } catch (err: any) {
            setServerError(err?.message || "Erreur inconnue");
        } finally {
            setPending(false);
        }
    }

    // Rendu des feuilles (gras/italique)
    const renderLeaf = useCallback((props: RenderLeafProps) => {
        const { attributes, children, leaf } = props as any;
        let out = children;
        if (leaf.bold) out = <strong>{out}</strong>;
        if (leaf.italic) out = <em>{out}</em>;
        return <span {...attributes}>{out}</span>;
    }, []);

    return (
        <div className="w-full rounded-xl border border-neutral-800 bg-neutral-100 p-4 text-neutral-800">
            {/* Entête identité */}
            <div className="mb-2 text-sm text-neutral-800">
                {props.isAuthenticated ? (
                    <span>
                        Posté en tant que <b>{props.userDisplayName ?? "Utilisateur"}</b>
                    </span>
                ) : (
                    <span>
                        Posté en tant qu’<b>invité</b>
                    </span>
                )}
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
                {/* Contexte */}
                <input type="hidden" name="resourceType" value={props.resourceType} />
                <input type="hidden" name="resourceId" value={props.resourceId} />
                <input type="hidden" name="parentId" value={props.parentId ?? ""} />
                {/* Honeypot */}
                <input type="text" name="honeypot" className="hidden" tabIndex={-1} autoComplete="off" />

                {/* Invité */}
                {!props.isAuthenticated && (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-neutral-800">Nom (requis)</label>
                            <input
                                name="guestName"
                                required
                                maxLength={80}
                                placeholder="Votre nom"
                                className="rounded-md border border-neutral-700 bg-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-600"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="mb-1 text-sm text-neutral-800">Email (optionnel)</label>
                            <input
                                type="email"
                                name="guestEmail"
                                placeholder="ex: vous@mail.com"
                                className="rounded-md border border-neutral-700 bg-neutral-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-600"
                            />
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-2">
                    <ToolbarButton title="Gras (Ctrl/Cmd+B)" onClick={() => toggleMark(editor, "bold")}>
                        B
                    </ToolbarButton>
                    <ToolbarButton title="Italique (Ctrl/Cmd+I)" onClick={() => toggleMark(editor, "italic")}>
                        I
                    </ToolbarButton>
                    <ToolbarButton title="Liste (insert '- ')" onClick={() => insertText("\n- ")}>
                        •
                    </ToolbarButton>
                    <ToolbarButton title="Lien (insert URL)" onClick={() => insertText(" https://")}>
                        🔗
                    </ToolbarButton>
                    <ToolbarButton title="Emoji" onClick={() => setShowPicker((v) => !v)}>
                        😊
                    </ToolbarButton>
                </div>

                {/* Emoji picker (v5) */}
                {showPicker && (
                    <div className="relative">
                        <div className="absolute z-20 mt-2">
                            <Picker
                                data={data}
                                onEmojiSelect={(e: any) => {
                                    const emoji: string = e?.native || "";
                                    if (emoji) insertText(emoji);
                                }}
                                previewPosition="none"
                                searchPosition="none"
                                theme="light"
                            />
                        </div>
                    </div>
                )}

                {/* Éditeur Slate */}
                <div className="flex flex-col">
                    <div className="min-h-[120px] w-full rounded-md border border-neutral-700 bg-white px-3 py-2">
                        <Slate key={editorKey} editor={editor} initialValue={initialValue} onChange={setValue}>
                            <Editable
                                renderLeaf={renderLeaf}
                                placeholder="Écrivez votre message… (Gras/Italique, emoji, URLs autorisées)"
                                onKeyDown={onKeyDown}
                                className="text-sm leading-6"
                                spellCheck
                                autoCorrect="on"
                                autoCapitalize="sentences"
                            />
                        </Slate>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                        <span className={tooManyLinks ? "text-secondary-4" : "text-neutral-700"}>
                            Liens (détectés) : {linkCount} / 3 {tooManyLinks && "• max dépassé"}
                        </span>
                        <span className={tooLong ? "text-secondary-4" : "text-neutral-700"}>
                            {plainText.length} / {MAX}
                        </span>
                    </div>
                </div>

                {/* Erreur serveur */}
                {serverError && <div className="rounded-md border border-red-900 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</div>}

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        type="submit"
                        disabled={disableSubmit}
                        className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {pending ? "Publication…" : "Publier"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setValue(initialValue);
                            setShowPicker(false);
                        }}
                        disabled={pending}
                        className="rounded-md border border-neutral-700 bg-neutral-100 px-3 py-2 text-sm hover:bg-neutral-200 disabled:opacity-50"
                    >
                        Effacer
                    </button>
                </div>
            </form>
        </div>
    );
}
