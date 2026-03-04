"use client";

import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { AnimatePresence, motion } from "framer-motion";
import urlFor from "@/app/lib/urlFor";
import type { ResumePointer, SpeakingAnswer } from "@/app/types/fide/mock-exam";
import type { RunnerTask, RunnerTaskMediaBlock } from "@/app/types/fide/mock-exam-runner";
import SpeakingResponsePanel from "./SpeakingResponsePanel";
import { getSpeakingTaskHeader } from "./runnerTaskHeader";

type AdvancePayload = {
    nextState: string;
    taskId?: string;
    activityKey?: string;
};

type RunnerScreenRouterProps = {
    compilationId: string;
    sessionKey: string;
    resume: ResumePointer;
    speakA2Tasks: RunnerTask[];
    speakA2Answers: SpeakingAnswer[];
    isAdvancing: boolean;
    onAdvance: (payload: AdvancePayload) => Promise<void>;
    onSpeakA2AnswerSaved: (answer: SpeakingAnswer) => void;
};

type RunnerPointer = {
    taskIndex: number;
    taskId: string;
    activityKey: string;
    mode: "intro" | "activity";
    introIndex?: number;
    activityIndex?: number;
};

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;
const INTRO_KEY_PREFIX = "intro:";
const TRANSITION = { duration: 0.28, ease: "easeOut" as const };
const RUNNER_LAYOUT_MAX_WIDTH = "max-w-[1240px]";
const RUNNER_LAYOUT_BOTTOM_PADDING = "pb-24 md:pb-5";

const hasAnyMediaInBlock = (block?: RunnerTaskMediaBlock) => Boolean(block?.text || block?.videoUrl || block?.image);

const withCloudFrontPrefix = (resource?: string) => {
    if (!resource) return undefined;
    if (/^https?:\/\//i.test(resource)) return resource;
    if (!cloudFrontDomain) return resource;

    const normalizedDomain = cloudFrontDomain.endsWith("/") ? cloudFrontDomain : `${cloudFrontDomain}/`;
    const normalizedResource = resource.startsWith("/") ? resource.slice(1) : resource;

    return `${normalizedDomain}${normalizedResource}`;
};

const makeIntroKey = (index: number) => `${INTRO_KEY_PREFIX}${index}`;

const parseIntroIndex = (activityKey?: string) => {
    if (!activityKey || !activityKey.startsWith(INTRO_KEY_PREFIX)) return null;
    const parsed = Number(activityKey.replace(INTRO_KEY_PREFIX, ""));
    return Number.isFinite(parsed) ? parsed : null;
};

const getRenderableIntroBlocks = (task: RunnerTask) => (task.introBlocks || []).filter(hasAnyMediaInBlock);

const resolveTaskStartPointer = (task: RunnerTask, taskIndex: number): RunnerPointer | null => {
    const introBlocks = getRenderableIntroBlocks(task);
    if (introBlocks.length > 0) {
        return {
            taskIndex,
            taskId: task._id,
            activityKey: makeIntroKey(0),
            mode: "intro",
            introIndex: 0,
        };
    }

    const firstActivity = (task.activities || [])[0];
    if (!firstActivity) return null;

    return {
        taskIndex,
        taskId: task._id,
        activityKey: firstActivity._key,
        mode: "activity",
        activityIndex: 0,
    };
};

const resolveFirstTaskPointer = (tasks: RunnerTask[]) => {
    for (let taskIndex = 0; taskIndex < tasks.length; taskIndex += 1) {
        const pointer = resolveTaskStartPointer(tasks[taskIndex], taskIndex);
        if (pointer) return pointer;
    }
    return null;
};

const resolvePointerFromResume = (tasks: RunnerTask[], resume: ResumePointer): RunnerPointer | null => {
    const firstPointer = resolveFirstTaskPointer(tasks);
    if (!firstPointer) return null;

    const taskIndex = resume.taskId ? tasks.findIndex((task) => task._id === resume.taskId) : firstPointer.taskIndex;
    const safeTaskIndex = taskIndex >= 0 ? taskIndex : firstPointer.taskIndex;
    const task = tasks[safeTaskIndex];

    const introBlocks = getRenderableIntroBlocks(task);
    const introIndex = parseIntroIndex(resume.activityKey);
    if (introIndex !== null && introBlocks.length > 0) {
        const safeIntroIndex = Math.max(0, Math.min(introIndex, introBlocks.length - 1));
        return {
            taskIndex: safeTaskIndex,
            taskId: task._id,
            activityKey: makeIntroKey(safeIntroIndex),
            mode: "intro",
            introIndex: safeIntroIndex,
        };
    }

    const activityIndex = resume.activityKey ? (task.activities || []).findIndex((activity) => activity._key === resume.activityKey) : -1;
    if (activityIndex >= 0) {
        return {
            taskIndex: safeTaskIndex,
            taskId: task._id,
            activityKey: task.activities[activityIndex]._key,
            mode: "activity",
            activityIndex,
        };
    }

    return resolveTaskStartPointer(task, safeTaskIndex) || firstPointer;
};

const resolveNextTaskPointer = (tasks: RunnerTask[], currentTaskIndex: number) => {
    for (let taskIndex = currentTaskIndex + 1; taskIndex < tasks.length; taskIndex += 1) {
        const pointer = resolveTaskStartPointer(tasks[taskIndex], taskIndex);
        if (pointer) return pointer;
    }
    return null;
};

const resolveNextPointer = (tasks: RunnerTask[], currentPointer: RunnerPointer): RunnerPointer | null => {
    const currentTask = tasks[currentPointer.taskIndex];
    if (!currentTask) return null;

    if (currentPointer.mode === "intro") {
        const introBlocks = getRenderableIntroBlocks(currentTask);
        const currentIntroIndex = currentPointer.introIndex || 0;

        if (currentIntroIndex + 1 < introBlocks.length) {
            return {
                ...currentPointer,
                activityKey: makeIntroKey(currentIntroIndex + 1),
                introIndex: currentIntroIndex + 1,
            };
        }

        const firstActivity = (currentTask.activities || [])[0];
        if (firstActivity) {
            return {
                taskIndex: currentPointer.taskIndex,
                taskId: currentTask._id,
                activityKey: firstActivity._key,
                mode: "activity",
                activityIndex: 0,
            };
        }

        return resolveNextTaskPointer(tasks, currentPointer.taskIndex);
    }

    const currentActivityIndex = currentPointer.activityIndex || 0;
    const activities = currentTask.activities || [];
    if (currentActivityIndex + 1 < activities.length) {
        const nextActivity = activities[currentActivityIndex + 1];
        return {
            taskIndex: currentPointer.taskIndex,
            taskId: currentTask._id,
            activityKey: nextActivity._key,
            mode: "activity",
            activityIndex: currentActivityIndex + 1,
        };
    }

    return resolveNextTaskPointer(tasks, currentPointer.taskIndex);
};

function IntroBlockStage({ block }: { block: RunnerTaskMediaBlock }) {
    const imageUrl = block.image ? urlFor(block.image).width(1600).height(1000).fit("crop").url() : null;
    const videoUrl = withCloudFrontPrefix(block.videoUrl);

    const hasText = Boolean(block.text);
    const hasVideo = Boolean(videoUrl);
    const hasImage = Boolean(imageUrl);
    const hasVisual = hasVideo || hasImage;
    const useHorizontal = block.layout === "horizontal" && hasText && hasVisual;
    const hasMixedVisuals = hasVideo && hasImage;

    return (
        <article className="h-full w-full overflow-hidden">
            <div className="relative h-full w-full">
                <div className="pointer-events-none absolute -top-24 left-1/3 h-56 w-56 rounded-full bg-secondary-2/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 right-8 h-44 w-44 rounded-full bg-secondary-5/20 blur-3xl" />

                <div
                    className={`relative mx-auto grid h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} gap-6 px-2 sm:px-4 ${useHorizontal ? "items-center lg:grid-cols-12 lg:gap-8" : "items-center justify-items-center"}`}
                >
                    {hasText && (
                        <div className={useHorizontal ? "order-2 w-full lg:order-1 lg:col-span-5 lg:justify-self-start" : "order-2 w-full max-w-[72ch] text-center"}>
                            <div className={`text-neutral-800 leading-relaxed ${useHorizontal ? "text-[1.03rem]" : "text-[1.05rem] sm:text-[1.1rem]"}`}>
                                <PortableText value={block.text as any} />
                            </div>
                        </div>
                    )}

                    {hasVisual && (
                        <div className={useHorizontal ? "order-1 w-full lg:order-2 lg:col-span-7 lg:justify-self-end lg:max-w-[760px]" : "order-1 w-full max-w-[980px]"}>
                            <div className={`grid items-start gap-4 ${hasMixedVisuals ? "grid-cols-1 md:grid-cols-10" : "grid-cols-1"}`}>
                                {hasVideo && (
                                    <div className={hasMixedVisuals ? "md:col-span-7" : "mx-auto w-full max-w-[900px]"}>
                                        <video controls preload="metadata" className="mx-auto block w-full h-auto rounded-2xl border-2 border-solid border-neutral-700">
                                            <source src={videoUrl} />
                                            Votre navigateur ne supporte pas la vidéo HTML5.
                                        </video>
                                    </div>
                                )}

                                {hasImage && (
                                    <div className={hasMixedVisuals ? "md:col-span-3 md:self-end" : "mx-auto w-full max-w-[760px]"}>
                                        <div className="relative mx-auto h-[min(34dvh,310px)] w-full overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                                            <Image src={imageUrl as string} alt="Illustration du bloc" fill className="object-cover" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

function ActivityImageStage({ task, activityIndex }: { task: RunnerTask; activityIndex: number }) {
    const activity = task.activities[activityIndex];
    if (!activity) {
        return (
            <article className="h-full w-full px-2 py-3 md:px-4 md:py-5">
                <p className="mb-0 text-sm text-neutral-700">Activité introuvable.</p>
            </article>
        );
    }

    const imageUrl = activity.image ? urlFor(activity.image).width(1800).fit("max").url() : null;
    const hasImage = Boolean(imageUrl);

    return (
        <article className="h-full w-full overflow-hidden px-2 py-2 md:px-4 md:py-5">
            <div className="flex h-full w-full items-center justify-center rounded-[1.4rem] bg-neutral-200/70 px-2">
                {hasImage ? (
                    <div className="flex h-full min-h-[240px] w-full max-w-[600px] items-start justify-center overflow-hidden rounded-[1.2rem] bg-neutral-300/30">
                        <Image
                            src={imageUrl as string}
                            alt="Image de l'activité"
                            width={1800}
                            height={1200}
                            className="h-auto max-h-full w-auto max-w-full object-contain rounded-2xl border-2 border-solid border-neutral-700"
                        />
                    </div>
                ) : (
                    <div className="flex h-full min-h-[240px] w-full items-center justify-center rounded-[1.2rem] bg-neutral-300/70 px-6 text-center text-neutral-700">
                        Aucun visuel pour cette activité.
                    </div>
                )}
            </div>
        </article>
    );
}

export default function RunnerScreenRouter({ compilationId, sessionKey, resume, speakA2Tasks, speakA2Answers, isAdvancing, onAdvance, onSpeakA2AnswerSaved }: RunnerScreenRouterProps) {
    const firstPointer = resolveFirstTaskPointer(speakA2Tasks);
    const examIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");

    if (resume.state === "EXAM_INTRO") {
        return (
            <section className={`relative w-full h-full overflow-hidden px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className="pointer-events-none absolute -top-20 left-1/4 h-64 w-64 rounded-full bg-secondary-2/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 right-8 h-72 w-72 rounded-full bg-secondary-5/20 blur-3xl" />

                <div className={`relative mx-auto flex h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} flex-col justify-between items-center gap-6`}>
                    <div className="grow grid gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:items-center">
                        <div className="space-y-4">
                            <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">L'Examen Blanc</p>
                            <h1 className="display-2 font-medium mb-0 text-neutral-900">Déroulement de l'examen</h1>
                            <p className="mb-0 text-neutral-700">Regarde cette courte vidéo de préparation. Tu y verras les épreuves et l'ordre de passage pour te lancer sereinement.</p>
                            <div className="grid gap-2 text-sm text-neutral-700">
                                <p className="mb-0">
                                    <span className="font-semibold text-neutral-900">1.</span> Parler
                                </p>
                                <p className="mb-0">
                                    <span className="font-semibold text-neutral-900">2.</span> Comprendre
                                </p>
                                <p className="mb-0">
                                    <span className="font-semibold text-neutral-900">3.</span> Lire/Écrire
                                </p>
                            </div>
                            <p className="mb-0 text-xs text-neutral-600">Votre progression est sauvegardée automatiquement.</p>
                        </div>

                        <div className="card relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {examIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={examIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>

                    <div className="flex w-full justify-center lg:justify-end">
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() =>
                                onAdvance({
                                    nextState: "SPEAK_A2_RUN",
                                    taskId: firstPointer?.taskId,
                                    activityKey: firstPointer?.activityKey,
                                })
                            }
                            disabled={isAdvancing || !firstPointer}
                        >
                            {isAdvancing ? "Mise à jour..." : "Commencer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_A2_RUN") {
        const currentPointer = resolvePointerFromResume(speakA2Tasks, resume);
        if (!currentPointer) {
            return (
                <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}>
                    <div className="flex flex-col gap-3">
                        <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">SECTION</p>
                        <h1 className="display-2 font-medium mb-0">Parler A2</h1>
                        <p className="mb-0 text-neutral-700">Aucune tâche A2 disponible dans cette compilation.</p>
                    </div>

                    <div className="flex justify-end">
                        <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "SPEAK_A2_RESULT" })} disabled={isAdvancing}>
                            {isAdvancing ? "Mise à jour..." : "Passer à la suite"}
                        </button>
                    </div>
                </section>
            );
        }

        const currentTask = speakA2Tasks[currentPointer.taskIndex];
        const introBlocks = getRenderableIntroBlocks(currentTask);
        const nextPointer = resolveNextPointer(speakA2Tasks, currentPointer);
        const currentTaskHeader = getSpeakingTaskHeader(currentTask, currentPointer.taskIndex, speakA2Tasks.length);
        const introTaskTitle = `${currentTaskHeader.title} - ${currentTaskHeader.subtitle}`;

        const continueLabel = !nextPointer
            ? "Terminer la section A2"
            : nextPointer.mode === "intro"
              ? "Bloc suivant"
              : currentPointer.mode === "intro"
                ? "Commencer l'activité"
                : "Activité suivante (placeholder)";

        if (currentPointer.mode === "intro") {
            return (
                <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} flex flex-col gap-4 py-0 min-h-0`}>
                    <div className="shrink-0 px-2 md:px-4">
                        <h1 className="display-2 font-medium mb-0 text-center leading-tight">{introTaskTitle}</h1>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`intro-${currentPointer.activityKey}`}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={TRANSITION}
                                className="h-full w-full"
                            >
                                <IntroBlockStage block={introBlocks[currentPointer.introIndex || 0]} />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="hidden w-full justify-end md:flex">
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[240px]"
                            onClick={() =>
                                nextPointer
                                    ? onAdvance({
                                          nextState: "SPEAK_A2_RUN",
                                          taskId: nextPointer.taskId,
                                          activityKey: nextPointer.activityKey,
                                      })
                                    : onAdvance({ nextState: "SPEAK_A2_RESULT" })
                            }
                            disabled={isAdvancing}
                        >
                            {isAdvancing ? "Mise à jour..." : continueLabel}
                        </button>
                    </div>

                    <div
                        className="fixed bottom-0 left-0 right-0 z-40 p-3 md:hidden bg-neutral-200"
                        style={{
                            borderTop: "1px solid var(--neutral-300)",
                            boxShadow: "0 -6px 16px rgba(15, 23, 42, 0.14)",
                        }}
                    >
                        <button
                            type="button"
                            className="btn btn-primary small w-full"
                            onClick={() =>
                                nextPointer
                                    ? onAdvance({
                                          nextState: "SPEAK_A2_RUN",
                                          taskId: nextPointer.taskId,
                                          activityKey: nextPointer.activityKey,
                                      })
                                    : onAdvance({ nextState: "SPEAK_A2_RESULT" })
                            }
                            disabled={isAdvancing}
                        >
                            {isAdvancing ? "Mise à jour..." : continueLabel}
                        </button>
                    </div>
                </section>
            );
        }

        const currentAnswer =
            currentPointer.mode === "activity" ? speakA2Answers.find((answer) => answer.taskId === currentPointer.taskId && answer.activityKey === currentPointer.activityKey) : undefined;

        return (
            <section className={`grid w-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-2 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.7fr)] lg:grid-rows-1 lg:gap-6`}>
                <div className="min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`activity-${currentPointer.activityKey}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={TRANSITION}
                            className="h-full"
                        >
                            <ActivityImageStage task={currentTask} activityIndex={currentPointer.activityIndex || 0} />
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="min-h-0">
                    <SpeakingResponsePanel
                        key={`${currentPointer.taskId}-${currentPointer.activityKey}`}
                        compilationId={compilationId}
                        sessionKey={sessionKey}
                        taskId={currentPointer.taskId}
                        activityKey={currentPointer.activityKey}
                        taskType={currentTask.taskType}
                        taskAiContext={currentTask.aiTaskContext}
                        activityAiContext={currentTask.activities[currentPointer.activityIndex || 0]?.aiContext}
                        activityAiVoiceGender={currentTask.activities[currentPointer.activityIndex || 0]?.aiVoiceGender}
                        questionAudioUrl={currentTask.activities[currentPointer.activityIndex || 0]?.audioUrl}
                        promptText={currentTask.activities[currentPointer.activityIndex || 0]?.promptText}
                        existingAnswer={currentAnswer}
                        isAdvancing={isAdvancing}
                        onAnswerSaved={onSpeakA2AnswerSaved}
                        onValidated={() =>
                            nextPointer
                                ? onAdvance({
                                      nextState: "SPEAK_A2_RUN",
                                      taskId: nextPointer.taskId,
                                      activityKey: nextPointer.activityKey,
                                  })
                                : onAdvance({ nextState: "SPEAK_A2_RESULT" })
                        }
                    />
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_A2_RESULT") {
        return (
            <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}>
                <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">RÉSULTAT</p>
                    <h1 className="display-2 font-medium mb-0">Parler A2 terminé</h1>
                    <p className="mb-0 text-neutral-700">Transition validée. On branchera ensuite l'écran de résultat complet.</p>
                </div>

                <div className="flex justify-end">
                    <button type="button" className="btn btn-primary small min-w-[220px]" onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_INTRO" })} disabled={isAdvancing}>
                        {isAdvancing ? "Mise à jour..." : "Aller à la section suivante"}
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}>
            <div className="flex flex-col gap-3">
                <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">ÉTAT</p>
                <h1 className="display-2 font-medium mb-0">Écran non branché</h1>
                <p className="mb-0 text-neutral-700">
                    L'état <span className="font-semibold">{resume.state}</span> n'a pas encore de composant dédié.
                </p>
            </div>

            <div className="flex justify-end">
                <button type="button" className="btn btn-secondary small min-w-[180px]" onClick={() => onAdvance({ nextState: "EXAM_INTRO" })} disabled={isAdvancing}>
                    Revenir à l'intro
                </button>
            </div>
        </section>
    );
}
