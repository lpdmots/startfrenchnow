"use client";
import { Post } from "@/app/types/blog";
import React, { useEffect, useState } from "react";
import { AiFillSignal } from "react-icons/ai";

interface Props {
    post: Post;
    level: {
        label: string;
        color: string;
    };
}

function Helper({ post, level }: Props) {
    const [help, setHelp] = useState<boolean>(true);
    const handleHelp = () => {
        const newHelp = !help;
        const elements = document.querySelectorAll(".translation");
        if (newHelp) {
            elements.forEach((element) => {
                element.classList.remove("hidden");
            });
        } else {
            elements.forEach((element) => {
                element.classList.add("hidden");
            });
        }
        localStorage.setItem("sfn-help", newHelp.toString());
        setHelp((state) => !state);
    };

    useEffect(() => {
        const helpStorage = localStorage.getItem("sfn-help");
        if (!helpStorage || helpStorage === "true") {
            return setHelp(true);
        }
        const elements = document.querySelectorAll(".translation");
        elements.forEach((element) => {
            element.classList.add("hidden");
        });
        setHelp(false);
    }, []);

    return (
        <>
            <div className="hidden md:flex justify-center items-end flex-wrap gap-4 mt-12 text-300 medium color-neutral-600">
                {!!post.translation && (
                    <>
                        <div className="w-checkbox checkbox-field-wrapper col-span-2 mb-4">
                            <label className="w-form-label flex items-center text-300 medium color-neutral-600" onClick={handleHelp}>
                                <div
                                    id="checkbox"
                                    className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${help ? "w--redirected-checked" : undefined}`}
                                    style={{ borderColor: help ? level.color : "var(--neutral-600)", backgroundColor: help ? level.color : "var(--neutral-200)" }}
                                ></div>
                                I need help
                            </label>
                        </div>
                        <p> - </p>
                    </>
                )}
                <p className="flex items-end">
                    Difficulty:
                    <AiFillSignal className=" mx-2" style={{ fontSize: "1.5rem", color: level.color }} />
                    {level.label}
                </p>
                <p> - </p>
                <p>{new Date(post._createdAt).toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <div className="flex md:hidden justify-center items-end flex-wrap gap-2 mt-12 text-300 medium color-neutral-600">
                {!!post.translation && (
                    <>
                        <div className="w-checkbox checkbox-field-wrapper col-span-2 mb-4">
                            <label className="w-form-label flex items-center text-300 medium color-neutral-600" onClick={handleHelp}>
                                <div
                                    id="checkbox"
                                    className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${help ? "w--redirected-checked" : undefined}`}
                                    style={{ borderColor: help ? level.color : "var(--neutral-600)", backgroundColor: help ? level.color : "var(--neutral-200)" }}
                                ></div>
                                Help me
                            </label>
                        </div>
                        <p> - </p>
                    </>
                )}
                <p className="flex items-end">
                    <AiFillSignal className=" mx-2" style={{ fontSize: "1.5rem", color: level.color }} />
                    {level.label}
                </p>
                <p> - </p>
                <p>{new Date(post._createdAt).toLocaleDateString("en", { day: "numeric", month: "numeric", year: "numeric" })}</p>
            </div>
        </>
    );
}

export default Helper;
