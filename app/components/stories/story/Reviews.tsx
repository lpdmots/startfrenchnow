"use client";
import { Review, ScoreProps, Success } from "@/app/types/stories/element";
import { LayoutProps } from "@/app/types/stories/state";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ScoreGauge from "./ScoreGauge";
import { PortableText } from "@portabletext/react";
import { RichTextStory } from "../../sanity/RichTextStory";
import urlFor from "@/app/lib/urlFor";
import { SlideFromBottom } from "../../animations/Slides";
import { ReviewFormularButton } from "./ReviewFormular";
import { useStoryStore } from "@/app/stores/storiesStore";
import { getUserStoryData, storyToStoryStats, storyToStats } from "@/app/serverActions/storyActions";
import { useSession } from "next-auth/react";
import { UserStory } from "@/app/types/sfn/auth";
import { GiSpellBook } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { IoFilter } from "react-icons/io5";
import Image from "next/image";

export const Reviews = ({ data }: { data: LayoutProps }) => {
    const { gameDate, story } = useStoryStore();
    const { data: session, status } = useSession();
    const [userStoryData, setUserStoryData] = useState<any>(null);
    const isArchived = useRef(false);
    const router = useRouter();

    useEffect(() => {
        if (status !== "authenticated" || isArchived.current || !story) return;
        (async () => {
            const userId = session?.user?._id;
            const storyId = story?._id;
            isArchived.current = true;

            const response = await getUserStoryData(userId, storyId);
            if (response?.error) console.error(response.error);
            setUserStoryData(response.userStoryData);

            const resp = await storyToStats(gameDate, userId, storyId, data?.reviews || []);
            if (resp?.error) console.error(resp.error);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    if (!data.reviews) return null;

    const handleLeaveReview = () => {
        router.push("/stories");
    };

    return (
        <div>
            {data.reviews.map((review, index) => (
                <Review key={index} review={review} userStoryData={userStoryData} />
            ))}
            {!userStoryData?.feedback || userStoryData?.feedback === "open" ? (
                <ReviewFormularButton />
            ) : (
                <button className="btn-primary w-button my-6" onClick={handleLeaveReview}>
                    <div className="flex items-center justify-center">
                        <GiSpellBook className="mr-2" style={{ fontSize: 30 }} />
                        Retourner aux histoires
                    </div>
                </button>
            )}
        </div>
    );
};

const Review = ({ review, userStoryData }: { review: Review; userStoryData: UserStory | null }) => {
    const oneScore = review?.scores?.length === 1;
    const { defaultFilter, success } = review;
    const [filter, setFilter] = useState(defaultFilter);
    const filtredSuccess = useMemo(() => getFiltredSuccess(success || [], filter, userStoryData), [filter, userStoryData, success]);

    const successCount = success?.filter((s) => s.unlocked || userStoryData?.success.includes(s._id)).length;
    const ratio = success?.length ? `${successCount}/${success?.length}` : "";

    return (
        <div className="py-6 flex flex-col justify-center items-center ">
            <div className="flex items-center mb-6 gap-4">
                <h2 className={`display-4 my-0 heading-span-${review.color}`}>{review?.title} </h2>
                <p className="font-bold my-0">{ratio}</p>
            </div>
            <div className={oneScore ? "max-w-2xl" : "w-layout-grid grid-2-columns values-grid"}>
                {review?.scores?.map((score) => (
                    <Score key={score.title} score={score} />
                ))}
            </div>

            {!!success?.length && defaultFilter !== "noFilterButton" && (
                <div className="flex w-full">
                    <button className="btn btn-secondary small my-4" style={{ minWidth: 130 }} onClick={() => setFilter((prev) => (prev === "unlocked" ? "noFilter" : "unlocked"))}>
                        <p className="flex items-center mb-0">
                            <IoFilter className="mr-2" />
                            {filter === "unlocked" ? "Tout voir" : "Filtrer"}
                        </p>
                    </button>
                </div>
            )}
            <div className="w-layout-grid grid-3-columns values-grid">
                {filtredSuccess.map((success) => (
                    <Success key={success.title} success={success} userStoryData={userStoryData} />
                ))}
            </div>
        </div>
    );
};

const Score = ({ score }: { score: ScoreProps }) => {
    const { title, text } = score;

    return (
        <SlideFromBottom>
            <div className="card image-left---text-rigth">
                <div className="image-wrapper card-value-image-left-wrapper flex justify-center items-center p-6 w-full !max-w-none">
                    <ScoreGauge score={score?.value || 0} />
                </div>
                <div className="card-value-conter-left">
                    <h3>{title}</h3>
                    <p className="mg-bottom-0">
                        <PortableText value={text} components={RichTextStory(true)} />
                    </p>
                </div>
            </div>
        </SlideFromBottom>
    );
};

const ALIGNTOCOLOR = {
    veryBad: "var(--secondary-4",
    bad: "#ff7f27",
    neutral: "var(--neutral-800)",
    good: "teal",
    veryGood: "teal",
};

const ALIGNTOIMAGE = {
    veryBad: "/images/bad.png",
    bad: "/images/bad2.png",
    neutral: "/images/cadenas-ouvert.png",
    good: "/images/medaille.png",
    veryGood: "/images/trophee.png",
    locked: "/images/cadenas.png",
};

const Success = ({ success, userStoryData }: { success: Success; userStoryData: UserStory | null }) => {
    const { story } = useStoryStore();
    const { title, text, image, unlocked, alignment, _id } = success;
    const isAllreadyUnlocked = userStoryData?.success?.includes(_id);
    const color = unlocked ? ALIGNTOCOLOR[alignment || "neutral"] : "var(--neutral-500)";
    const imgToDisplay = (unlocked || isAllreadyUnlocked) && image ? urlFor(image).url() : unlocked || isAllreadyUnlocked ? ALIGNTOIMAGE[alignment || "neutral"] : ALIGNTOIMAGE["locked"];
    const percent = Math.round(((story?.stats?.success?.find((s) => s.id === _id)?.value || 0) / (story?.stats?.userIds?.length || 1)) * 100);

    return (
        <SlideFromBottom>
            <div className="card flex flex-col sm:grid sm:grid-cols-4 relative h-full p-2" style={{ borderColor: unlocked ? "var(--neutral-800)" : "var(--neutral-400)" }}>
                <h3 className="hidden sm:block text-center bl font-bold w-full col-span-4 mt-2" style={{ color }}>
                    {title}
                </h3>
                <div className="image-wrapper card-value-image-left-wrapper flex justify-center p-2 w-full !max-w-none">
                    <Image src={imgToDisplay} height={100} width={100} loading="eager" alt={title} className="h-full w-full object-contain max-h-24" style={{ opacity: unlocked ? 1 : 0.7 }} />
                </div>
                <div className="p-2 pl-2 sm:pl-0 col-span-3 flex flex-col justify-center">
                    <h3 className="block sm:hidden text-center bl font-bold w-full col-span-4 mt-2" style={{ color }}>
                        {title}
                    </h3>
                    {unlocked || isAllreadyUnlocked ? (
                        <div className="flex flex-col justify-between h-full" style={{ minHeight: 120 }}>
                            <p className="mg-bottom-0 sm:text-left bs font-bold">
                                <PortableText value={text} components={RichTextStory(true)} />
                            </p>
                            <p className="w-full text-right bs mb-0 pr-2" style={{ color: "var(--neutral-500)" }}>
                                {percent === 0 && unlocked ? "Tu es la première personne à le déverrouiller! 🎉" : percent + " % des joueurs"}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-between py-4" style={{ minHeight: 120 }}>
                            <div className="bg-neutral-300 w-full h-3" style={{ borderRadius: 25 }}></div>
                            <div className="bg-neutral-300 w-4/5 h-3" style={{ borderRadius: 25 }}></div>
                            <div className="bg-neutral-300 w-full h-3" style={{ borderRadius: 25 }}></div>
                            <div className="bg-neutral-300 w-5/6 h-3" style={{ borderRadius: 25 }}></div>
                        </div>
                    )}
                </div>
                {!unlocked && <div className="absolute w-full h-full bg-neutral-700" style={{ borderRadius: 24, opacity: 0.1, top: 0, left: 0 }}></div>}
            </div>
        </SlideFromBottom>
    );
};

const getFiltredSuccess = (success: Success[], filter: string, userStoryData: UserStory | null) => {
    console.log({ success });
    switch (filter) {
        case "noFilter":
            if (!userStoryData) return success;
            return success
                .filter((s) => s.unlocked)
                .concat(success.filter((s) => userStoryData.success.includes(s._id) && !s.unlocked))
                .concat(success.filter((s) => !userStoryData.success.includes(s._id) && !s.unlocked));
        case "unlocked":
            if (!userStoryData) return success.filter((s) => !s.unlocked);
            return success.filter((s) => s.unlocked).concat(success.filter((s) => userStoryData.success.includes(s._id) && !s.unlocked));
        default:
            return success;
    }
};
