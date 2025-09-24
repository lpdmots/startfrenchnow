"use client";
import { LEVELDATA } from "@/app/lib/constantes";
import { Post } from "@/app/types/sfn/blog";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { AiFillSignal } from "react-icons/ai";

interface Props {
    post: Post;
    locale: "en" | "fr";
}

function Helper({ post, locale }: Props) {
    const [help, setHelp] = useState<boolean>(true);
    const [level, setLevel] = useState<{ label: string; color: string } | null>(null);
    const difficultyLabel = locale === "fr" ? "Difficulté" : "Difficulty";

    const handleHelp = () => {
        const newHelp = !help;
        const elements = document.querySelectorAll(".help");
        if (newHelp) {
            elements.forEach((element) => {
                element.classList.remove("hidden");
            });
            post?.level?.length === 2 && setLevel(LEVELDATA[post.level[1]]);
        } else {
            elements.forEach((element) => {
                element.classList.add("hidden");
            });
            post?.level?.length === 2 && setLevel(LEVELDATA[post.level[0]]);
        }
        localStorage.setItem("sfn-help", newHelp.toString());
        setHelp((state) => !state);
    };

    useEffect(() => {
        if (!post.help) return setHelp(false);
        const helpStorage = localStorage.getItem("sfn-help");
        if (!helpStorage || helpStorage === "true") {
            setHelp(true);
            post?.level?.length === 2 && setLevel(post.level ? LEVELDATA[post.level[1]] : null);
            return;
        }
        const elements = document.querySelectorAll(".help");
        elements.forEach((element) => {
            element.classList.add("hidden");
        });
        setHelp(false);
        setLevel(post.level ? LEVELDATA[post.level[0]] : null);
    }, []);

    return (
        <>
            <div className="block w-full md:flex justify-center items-center flex-wrap gap-4 mt-8 text-300 medium color-neutral-600">
                {!!post.help && (
                    <>
                        <div className="w-checkbox checkbox-field-wrapper col-span-2 mb-2 flex justify-center">
                            <label className="w-form-label flex items-center text-300 medium color-neutral-600" onClick={handleHelp}>
                                <div
                                    id="checkbox"
                                    className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${help ? "w--redirected-checked" : undefined}`}
                                    style={{ borderColor: help ? level?.color : "var(--neutral-600)", backgroundColor: help ? level?.color : "var(--neutral-200)" }}
                                ></div>
                                <Image src="/images/help.png" alt="help dialog" height={48} width={75} style={{ height: 40, objectFit: "contain" }} />
                            </label>
                        </div>
                        <p className="mb-2 hidden md:block"> - </p>
                    </>
                )}
                <div className="flex items-center justify-center gap-4 mb-2">
                    {level && (locale === "fr" || help) ? (
                        <>
                            <p className="flex items-end mb-0">
                                {difficultyLabel}:
                                <AiFillSignal className=" mx-2" style={{ fontSize: "1.5rem", color: level.color }} />
                                {level.label}
                            </p>
                            <p className="mb-0"> - </p>
                        </>
                    ) : post.level?.length ? (
                        <>
                            <p className="flex items-end mb-0">
                                {difficultyLabel}:
                                {post.level.map((lev, index) => {
                                    const level = LEVELDATA[lev];
                                    const lastLevel = index === post.level.length - 1;
                                    return (
                                        <span key={level.label}>
                                            <AiFillSignal className=" mx-1" style={{ fontSize: "1.5rem", color: level.color }} />
                                            {level.label}
                                            {!lastLevel && " / "}
                                        </span>
                                    );
                                })}
                            </p>
                            <p className="mb-0"> - </p>
                        </>
                    ) : null}
                    <p className="hidden md:block mb-0">{new Date(post.publishedAt).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="block md:hidden mb-0">{new Date(post.publishedAt).toLocaleDateString(locale, { day: "numeric", month: "numeric", year: "numeric" })}</p>
                </div>
            </div>
        </>
    );
}

export default Helper;
