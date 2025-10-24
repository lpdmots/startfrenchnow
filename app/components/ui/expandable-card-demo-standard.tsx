"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/app/hooks/use-outside-click";
import { renderStars } from "../common/CompteurIncrement";
import { X } from "lucide-react";
import AudioOverlayPlayer from "../common/AudioOverlayPlayer";
import { Exam } from "@/app/types/fide/exam";
import urlFor from "@/app/lib/urlFor";
import { useSession } from "next-auth/react";
import { getFideExamProgress } from "@/app/serverActions/fideExamActions";
import { ExamLog } from "@/app/types/sfn/auth";
import { FaRegStar } from "react-icons/fa";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { RiSpeakLine } from "react-icons/ri";
import { LuFileText, LuGlasses, LuGraduationCap, LuLightbulb, LuPencil, LuVideo } from "react-icons/lu";
import DropdownMenu from "../common/DropdownMenu";
import Link from "next-intl/link";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export default function ExpandableCardDemo({ exams, withStars = true, twoColumns = false, hasPack = true }: { exams: Exam[]; withStars?: boolean; twoColumns?: boolean; hasPack?: boolean }) {
    const { data: session } = useSession();
    const [logs, setLogs] = useState<ExamLog[] | null>(null);
    const [active, setActive] = useState<(typeof exams)[number] | boolean | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (async () => {
            if (session?.user?._id) {
                const user = await getFideExamProgress(session.user._id, "pack_fide");
                setLogs(user?.learningProgress?.[0]?.examLogs || []);
            }
        })();
    }, [session]);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setActive(false);
            }
        }

        if (active && typeof active === "object") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [active]);

    useOutsideClick(ref, () => setActive(null));

    return (
        <>
            <AnimatePresence>
                {active && typeof active === "object" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/20 h-full w-full z-10" />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {active && typeof active === "object" ? (
                    <div className="fixed inset-0 grid place-items-center z-[100]">
                        <motion.button
                            key={`button-${active.title}-${active._id}`}
                            layout
                            initial={{
                                opacity: 0,
                            }}
                            animate={{
                                opacity: 1,
                                transition: {
                                    delay: 0.5,
                                },
                            }}
                            exit={{
                                opacity: 0,
                                transition: {
                                    duration: 0.05,
                                },
                            }}
                            className="flex absolute top-4 right-2 lg:hidden items-center justify-center bg-neutral-200 rounded-full h-6 w-6 z-10"
                            onClick={() => setActive(null)}
                        >
                            <CloseIcon />
                        </motion.button>
                        <motion.div
                            layoutId={`card-${active.title}-${active._id}`}
                            ref={ref}
                            className="w-full max-w-2xl h-full md:h-fit md:max-h-[90%] flex flex-col bg-neutral-100 sm:rounded-3xl overflow-hidden border-2 border-solid border-neutral-800"
                        >
                            <motion.div layoutId={`image-${active.title}-${active._id}`} className="relative">
                                <Image
                                    width={670}
                                    height={500}
                                    src={urlFor(active.image).url()}
                                    alt={active.title}
                                    className="w-full h-80 lg:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                                />
                                <div className="absolute w-full h-full top-0">
                                    <AudioOverlayPlayer exam={active} setLogs={setLogs} userId={session?.user?._id} />
                                </div>
                            </motion.div>

                            <div className="min-h-60">
                                <div className="flex justify-between items-start p-4">
                                    <div className="">
                                        <motion.h3 layoutId={`title-${active.title}-${active._id}`} className="font-bold text-neutral-700 ">
                                            {getLevelsLabel(active.levels)} - {active.title}
                                        </motion.h3>
                                        <motion.p layoutId={`description-${active.description}-${active._id}`} className="text-neutral-600 mb-0">
                                            {active.description}
                                        </motion.p>
                                    </div>

                                    <motion.div layoutId={`stars-${active.title}-${active._id}`} className="flex flex-grow items-center justify-end mt-4 md:mt-0">
                                        <RenderStars active={active} logs={logs} />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
            <div className="mx-auto w-full p-0 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4 lg:max-w-none">
                {exams
                    .sort((a, b) => a.levels[0].localeCompare(b.levels[0]))
                    .map((exam, index) => {
                        const isLocked = !hasPack && !exam.isPreview;
                        const contentType = exam.pdf?.includes("scenarios") ? "scenarios" : exam.pdf ? "pdf" : "exam";
                        if (contentType === "exam") return <ExamCard key={exam._id} exam={exam} isLocked={isLocked} setActive={setActive} withStars={withStars} logs={logs} />;
                        if (contentType === "pdf") return <LinkCard key={exam._id} exam={exam} isLocked={isLocked} />;
                        return <LinkCard key={exam._id} exam={exam} isLocked={isLocked} isScenarios={true} />;
                    })}
            </div>
        </>
    );
}

const ExamCard = ({
    exam,
    isLocked,
    setActive,
    withStars,
    logs,
}: {
    exam: Exam;
    isLocked: boolean;
    setActive: React.Dispatch<React.SetStateAction<Exam | boolean | null>>;
    withStars: boolean;
    logs: ExamLog[] | null;
}) => {
    const router = useRouter();
    return (
        <motion.div
            layoutId={`card-${exam.title}-${exam._id}`}
            key={`card-${exam.title}-${exam._id}`}
            onClick={isLocked ? () => router.push("/fide/pack-fide#plans") : () => setActive(exam)}
            className="group relative p-4 flex flex-col justify-between items-center hover:bg-neutral-300 bg-neutral-200 rounded-xl cursor-pointer border-2 border-solid border-neutral-800 overflow-hidden h-full w-full max-w-md mx-auto"
        >
            <div className="flex flex-col items-center h-full w-full gap-2">
                <motion.div layoutId={`image-${exam.title}-${exam._id}`}>
                    <Image width={400} height={300} src={urlFor(exam.image).url()} alt={exam.title} className="w-auto h-full max-h-52 mx-auto  rounded-lg object-cover object-top" />
                </motion.div>
                <div className="w-full">
                    <div className="flex justify-between w-full items-center">
                        <motion.h3 layoutId={`title-${exam.title}-${exam._id}`} className="font-medium text-neutral-800 text-left mb-0">
                            {isLocked ? "🔒- " : ""}
                            {exam.title}
                        </motion.h3>

                        {withStars && (
                            <motion.div layoutId={`stars-${exam.title}-${exam._id}`} className="flex flex-grow items-center justify-end">
                                <RenderStars active={exam} logs={logs} />
                            </motion.div>
                        )}
                    </div>
                    <motion.p layoutId={`description-${exam.description}-${exam._id}`} className="text-neutral-600 dark:text-neutral-400 mb-0 line-clamp-2">
                        {exam.description}
                    </motion.p>
                </div>
                <div className="flex justify-between items-end grow w-full">
                    <p className="mb-0">{getLevelsLabel(exam.levels)}</p>
                    <div className="flex gap-2 items-end">
                        {competenceIcon(exam.competence)}
                        {typeIcon("exam")}
                    </div>
                </div>
            </div>
            {isLocked && (
                <div className="absolute inset-0 z-10 h-full w-full pointer-events-none [@media(hover:none)]:hidden">
                    <div className="absolute inset-0 bg-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Image src="/images/cadenas-ouvert.png" alt="Contenu réservé au Pack FIDE" width={64} height={64} className="h-10 w-10 mb-2" />
                        <p className="text-sm font-medium mb-0">
                            Acheter le <strong>Pack FIDE</strong>
                        </p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

const LinkCard = ({ exam, isLocked, isScenarios = false }: { exam: Exam; isLocked: boolean; isScenarios?: boolean }) => {
    const router = useRouter();
    return (
        <div
            onClick={isLocked ? () => router.push("/fide/pack-fide#plans") : undefined}
            className="group relative p-4 flex flex-col justify-between items-center hover:bg-neutral-300 bg-neutral-200 rounded-xl cursor-pointer border-2 border-solid border-neutral-800 overflow-hidden h-full w-full max-w-md mx-auto"
        >
            <Link
                target={isScenarios ? undefined : "_blank"}
                href={isLocked ? "" : isScenarios ? exam.pdf || "" : cloudFrontDomain + (exam.pdf || "")}
                className="no-underline text-neutral-800 flex flex-col items-center h-full w-full gap-2"
            >
                <div>
                    <Image width={400} height={300} src={urlFor(exam.image).url()} alt={exam.title} className="w-auto h-full max-h-52 mx-auto  rounded-lg object-cover object-top" />
                </div>
                <div className="w-full">
                    <div className="flex w-full items-center">
                        <h3 className="font-medium text-neutral-800 text-left mb-0">
                            {isLocked ? "🔒- " : ""}
                            {exam.title}
                        </h3>
                    </div>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-0 line-clamp-2">{exam.description}</p>
                </div>
                <div className="flex justify-between items-end grow w-full">
                    <p className="mb-0">{getLevelsLabel(exam.levels)}</p>
                    <div className="flex gap-2 items-center">
                        {competenceIcon(exam.competence)}
                        {typeIcon(isScenarios ? "video" : "pdf")}
                    </div>
                </div>
            </Link>
            {isLocked && (
                <div className="absolute inset-0 z-10 h-full w-full pointer-events-none [@media(hover:none)]:hidden">
                    <div className="absolute inset-0 bg-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Image src="/images/cadenas-ouvert.png" alt="Contenu réservé au Pack FIDE" width={64} height={64} className="h-10 w-10 mb-2" />
                        <p className="text-sm font-medium mb-0">
                            Acheter le <strong>Pack FIDE</strong>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

const RenderStars = ({ active, logs }: { active: Exam; logs: ExamLog[] | null }) => {
    const stars = logs?.find((log) => log.exam._ref === active._id)?.bestScore ?? null;
    if (stars === undefined || stars === null) {
        return (
            <>
                <FaRegStar className="text-xl md:text-2xl fill-neutral-400 " />
                <FaRegStar className="text-xl md:text-2xl fill-neutral-400 " />
                <FaRegStar className="text-xl md:text-2xl fill-neutral-400 " />
            </>
        );
    } else {
        return renderStars(stars, false, 3);
    }
};

const getLevelsLabel = (levels: string[]) => {
    if (levels.includes("all")) return "A1➝B1";
    return levels.join(", ");
};

export const CloseIcon = () => {
    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            exit={{
                opacity: 0,
                transition: {
                    duration: 0.05,
                },
            }}
            className="text-neutral-800 bg-neutral-100 p-2 pb-0 rounded-full hover:bg-neutral-300 transition-colors duration-200 cursor-pointer"
        >
            <X />
        </motion.div>
    );
};

const competenceIcon = (competence: string) => {
    switch (competence) {
        case "Parler":
            return (
                <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">Parler</p>} position="top">
                    <div className="flex h-full items-center">
                        <RiSpeakLine className="text-2xl mb-1" />
                    </div>
                </DropdownMenu>
            );
        case "Comprendre":
            return (
                <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">Comprendre</p>} position="top">
                    <div className="flex h-full items-center">
                        <LuLightbulb className="text-2xl mb-1" />
                    </div>
                </DropdownMenu>
            );
        case "Lire & Écrire":
            return (
                <div className="flex gap-2">
                    <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">Lire</p>} position="top">
                        <div className="flex h-full items-center">
                            <LuGlasses className="text-2xl mb-1" />
                        </div>
                    </DropdownMenu>
                    <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">Écrire</p>} position="top">
                        <div className="flex h-full items-center">
                            <LuPencil className="text-2xl mb-1" />
                        </div>
                    </DropdownMenu>
                </div>
            );
        default:
            return (
                <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">Comprendre</p>} position="top">
                    <div className="flex h-full items-center">
                        <LuLightbulb className="text-2xl mb-1" />
                    </div>
                </DropdownMenu>
            );
    }
};

const typeIcon = (type: "exam" | "video" | "pdf") => {
    switch (type) {
        case "exam":
            return (
                <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">Examen</p>} position="top">
                    <div className="flex h-full items-center">
                        <LuGraduationCap className="text-2xl mb-1" />
                    </div>
                </DropdownMenu>
            );
        case "video":
            return (
                <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">Vidéo</p>} position="top">
                    <div className="flex h-full items-center">
                        <LuVideo className="text-2xl mb-1" />
                    </div>
                </DropdownMenu>
            );
        case "pdf":
            return (
                <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">PDF</p>} position="top">
                    <div className="flex h-full items-center">
                        <LuFileText className="text-2xl mb-1" />
                    </div>
                </DropdownMenu>
            );
        default:
            return (
                <DropdownMenu content={<p className="p-2 bg-neutral-200 rounded-lg border border-solid border-neutral-600 bs">Examen</p>} position="top">
                    <div className="flex h-full items-center">
                        <LuGraduationCap className="text-2xl mb-1" />
                    </div>
                </DropdownMenu>
            );
    }
};
