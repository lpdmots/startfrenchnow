"use client";
import React, { useEffect, useState } from "react";
import { BiExit } from "react-icons/bi";
import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { Adventure } from "@/app/types/stories/adventure";
import { StoryNavbar } from "./StoryNavbar";
import DarkMode from "../../common/DarkMode";
import { ModalFromBottom } from "../../animations/Modals";
import SimpleButton from "../../animations/SimpleButton";
import { useRouter } from "next-intl/client";
import { ReviewFormularNavbar } from "./ReviewFormular";
import { useSession } from "next-auth/react";
import { getUserStoryData } from "@/app/serverActions/storyActions";
import { useStoryStore } from "@/app/stores/storiesStore";
import BugReport from "./BugReport";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import DropdownMenu from "../../common/DropdownMenu";
import { FaEllipsisV } from "react-icons/fa";

export const NavBarStory = ({ story }: { story: Adventure }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<"done" | "no" | "open">("no");
    const router = useRouter();
    const { data: session, status } = useSession();
    const { layouts, slideIndex } = useStoryStore();
    const isReview = layouts[slideIndex]?.reviewLayout;
    const isMedium = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        if (status !== "authenticated") return;
        (async () => {
            const userId = session?.user?._id;
            const storyId = story?._id;
            if (!userId || !storyId) return;
            const resp = await getUserStoryData(userId, storyId);
            if (resp?.error) console.error(resp.error);
            setFeedback(resp?.userStoryData?.feedback || "open");
        })();
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    const modalData = {
        setOpen,
        title: <h3 className="display-3">Quitter l'histoire</h3>,
        message: (
            <div>
                <p>Êtes-vous sûr(e) de vouloir quitter la partie ?</p>
                <em className="bs">En débutant une nouvelle, il vous sera proposé de la reprendre ou de la supprimer.</em>
            </div>
        ),
        functionOk: () => router.push("/stories"),
        clickOutside: true,
        buttonOkStr: "Quitter",
    };

    const handleClick = () => {
        if (!open) setOpen(true);
    };

    const handleLeaveReview = () => {
        router.push("/stories");
    };

    return (
        <div className="w-full bg-neutral-200 py-2 sm:py-6 md:py-7 lg:py-8">
            <div className="nav-width mx-auto px-2 sm:px-6 position-relative">
                <div className="nav shadow-1 p-3 md:p-4 flex justify-between">
                    <div className="flex items-center">
                        {story?.images?.icon && <Image src={urlFor(story.images.icon).url()} height={50} width={50} alt={story.name} className="h-8 sm:h-10 md:h-12 object-contain w-auto" />}
                    </div>
                    <h1 className="hidden lg:block display-4 mb-0">{story?.name}</h1>
                    {!isReview && (
                        <div className="flex lg:hidden">
                            <StoryNavbar layout={"mobile"} />
                        </div>
                    )}
                    {isMedium && !isReview ? (
                        <IconsDropdown isReview={isReview} feedback={feedback} handleLeaveReview={handleLeaveReview} handleClick={handleClick} />
                    ) : (
                        <div className="flex gap-4 items-center">
                            <FlexIcons isReview={isReview} feedback={feedback} handleLeaveReview={handleLeaveReview} handleClick={handleClick} />
                        </div>
                    )}
                </div>
            </div>
            {open && <ModalFromBottom data={modalData} />}
        </div>
    );
};

interface IconsProps {
    isReview?: boolean;
    feedback?: "done" | "no" | "open";
    handleLeaveReview: () => void;
    handleClick: () => void;
}

const FlexIcons = ({ isReview, feedback, handleLeaveReview, handleClick }: IconsProps) => {
    return (
        <>
            <BugReport />
            <DarkMode />
            {isReview && feedback === "open" ? (
                <ReviewFormularNavbar />
            ) : isReview ? (
                <SimpleButton>
                    <div className="flex items-center" onClick={handleLeaveReview}>
                        <BiExit className="fill-neutral-800 text-3xl sm:text-4xl" />
                    </div>
                </SimpleButton>
            ) : (
                <SimpleButton>
                    <div className="flex items-center" onClick={handleClick}>
                        <BiExit className="fill-neutral-800 text-3xl sm:text-4xl" />
                    </div>
                </SimpleButton>
            )}
        </>
    );
};

const IconsDropdown = ({ isReview, feedback, handleLeaveReview, handleClick }: IconsProps) => {
    const content = (
        <div className="card p-4 mt-2">
            <div className="flex flex-col gap-2" style={{ minWidth: 50 }}>
                <FlexIcons isReview={isReview} feedback={feedback} handleLeaveReview={handleLeaveReview} handleClick={handleClick} />
            </div>
        </div>
    );

    return (
        <div className="flex items-center">
            <DropdownMenu content={content}>
                <SimpleButton classname="p-2">
                    <FaEllipsisV className="text-2xl sm:text-3xl" />
                </SimpleButton>
            </DropdownMenu>
        </div>
    );
};
