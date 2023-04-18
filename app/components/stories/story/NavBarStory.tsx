"use client";
import Link from "next/link";
import React from "react";
import { BiExit } from "react-icons/bi";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { Adventure } from "@/app/types/stories/adventure";
import { StoryNavbar } from "./StoryNavbar";

export const NavBarStory = ({ story }: { story: Adventure }) => {
    return (
        <div className="w-full bg-neutral-200 py-2 sm:py-6 md:py-7 lg:py-8">
            <div className="nav-width mx-auto px-2 sm:px-6 position-relative">
                <div className="nav shadow-1 p-3 md:p-4">
                    <Image src={urlFor(story.images.icon).url()} height={50} width={50} alt={story.name} className="h-8 sm:h-10 md:h-12 object-contain w-auto" />
                    <h1 className="hidden lg:block display-4 mb-0">{story?.name}</h1>
                    <div className="flex lg:hidden">
                        <StoryNavbar layout={"mobile"} />
                    </div>
                    <Link href="/stories" aria-label="Dark mode" data-set-theme="dark" data-act-class="ACTIVECLASS" className="btn p-0 flex items-center bg-neutral-100 ">
                        <BiExit className="fill-neutral-800 text-3xl sm:text-4xl" />
                    </Link>
                </div>
            </div>
        </div>
    );
};
