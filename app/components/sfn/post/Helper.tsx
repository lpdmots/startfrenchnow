"use client";
import { LEVELDATA } from "@/app/lib/constantes";
import { Post } from "@/app/types/sfn/blog";
import React, { useEffect, useState } from "react";
import { AiFillSignal } from "react-icons/ai";

interface Props {
    post: Post;
    postLang: "en" | "fr";
}

function Helper({ post, postLang }: Props) {
    const [help, setHelp] = useState<boolean>(true);
    const [level, setLevel] = useState<{ label: string; color: string } | null>(null);

    const handleHelp = () => {
        const newHelp = !help;
        const elements = document.querySelectorAll(".help");
        if (newHelp) {
            elements.forEach((element) => {
                element.classList.remove("hidden");
            });
            setLevel(LEVELDATA[post.level[1]]);
        } else {
            elements.forEach((element) => {
                element.classList.add("hidden");
            });
            setLevel(LEVELDATA[post.level[0]]);
        }
        localStorage.setItem("sfn-help", newHelp.toString());
        setHelp((state) => !state);
    };

    useEffect(() => {
        const helpStorage = localStorage.getItem("sfn-help");
        if (!helpStorage || helpStorage === "true") {
            setHelp(true);
            setLevel(post.level ? LEVELDATA[post.level[1]] : null);
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
            <div className="block w-full md:flex justify-center items-end flex-wrap gap-4 mt-8 text-300 medium color-neutral-600">
                {!!post.help && post.level.length === 2 && (
                    <>
                        <div className="w-checkbox checkbox-field-wrapper col-span-2 mb-2 flex justify-center">
                            <label className="w-form-label flex items-center text-300 medium color-neutral-600" onClick={handleHelp}>
                                <div
                                    id="checkbox"
                                    className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${help ? "w--redirected-checked" : undefined}`}
                                    style={{ borderColor: help ? level?.color : "var(--neutral-600)", backgroundColor: help ? level?.color : "var(--neutral-200)" }}
                                ></div>
                                {postLang === "fr" ? "J'ai besoin d'aide" : "Include french"}
                            </label>
                        </div>
                        <p className="mb-2 hidden md:block"> - </p>
                    </>
                )}
                <div className="flex items-center justify-center gap-4 mb-2">
                    {level && (postLang === "fr" || help) && (
                        <>
                            <p className="flex items-end mb-0">
                                Difficulty:
                                <AiFillSignal className=" mx-2" style={{ fontSize: "1.5rem", color: level.color }} />
                                {level.label}
                            </p>
                            <p className="mb-0"> - </p>
                        </>
                    )}
                    <p className="hidden md:block mb-0">{new Date(post.publishedAt).toLocaleDateString(postLang, { day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="block md:hidden mb-0">{new Date(post.publishedAt).toLocaleDateString(postLang, { day: "numeric", month: "numeric", year: "numeric" })}</p>
                </div>
            </div>
        </>
    );
}

export default Helper;
