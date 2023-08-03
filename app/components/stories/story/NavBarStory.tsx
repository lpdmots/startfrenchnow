"use client";
import Link from "next/link";
import React, { useState } from "react";
import { BiExit } from "react-icons/bi";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { Adventure } from "@/app/types/stories/adventure";
import { StoryNavbar } from "./StoryNavbar";
import { useStoryStore } from "@/app/stores/storiesStore";
import DarkMode from "../../common/DarkMode";
import { ModalFromBottom } from "../../animations/Modals";
import SimpleButton from "../../animations/SimpleButton";
import { useRouter } from "next/navigation";
import { ReviewFormularNavbar } from "./ReviewFormular";

export const NavBarStory = ({ story }: { story: Adventure }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [openForm, setOpenForm] = useState<boolean>(false);
    const router = useRouter();
    const { layouts, slideIndex } = useStoryStore();
    const isReview = layouts[slideIndex]?.reviewLayout;

    const modalData = {
        setOpen,
        title: "Quitter l'histoire",
        message: (
            <div>
                <p>Êtes-vous sûr(e) de vouloir quitter la partie ?</p>
                <em className="bs">En débutant une nouvelle, il vous sera proposé de la reprendre.</em>
            </div>
        ),
        functionOk: () => router.push("/stories"),
        clickOutside: true,
        buttonOkStr: "Quitter",
    };

    const handleClick = () => {
        if (!open) setOpen(true);
    };

    const handleClickForm = () => {
        if (!openForm) setOpenForm(true);
    };

    return (
        <div className="w-full bg-neutral-200 py-2 sm:py-6 md:py-7 lg:py-8">
            <div className="nav-width mx-auto px-2 sm:px-6 position-relative">
                <div className="nav shadow-1 p-3 md:p-4 flex justify-between">
                    <div className="flex items-center">
                        {story?.images?.icon && <Image src={urlFor(story.images.icon).url()} height={50} width={50} alt={story.name} className="h-8 sm:h-10 md:h-12 object-contain w-auto" />}
                    </div>
                    <h1 className="hidden lg:block display-4 mb-0">{story?.name}</h1>
                    <div className="flex lg:hidden">
                        <StoryNavbar layout={"mobile"} />
                    </div>
                    <div className="flex gap-4 items-center">
                        <DarkMode />
                        {isReview ? (
                            <ReviewFormularNavbar />
                        ) : (
                            <SimpleButton>
                                <div className="flex items-center" onClick={handleClick}>
                                    <BiExit className="fill-neutral-800 text-3xl sm:text-4xl" />
                                </div>
                            </SimpleButton>
                        )}
                    </div>
                </div>
            </div>
            {open && <ModalFromBottom data={modalData} />}
        </div>
    );
};
