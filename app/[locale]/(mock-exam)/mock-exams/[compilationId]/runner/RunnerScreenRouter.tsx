"use client";

import Image from "next/image";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import urlFor from "@/app/lib/urlFor";
import { getAnswerTaskId } from "@/app/types/fide/mock-exam";
import type { ResumePointer, SpeakingAnswer } from "@/app/types/fide/mock-exam";
import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";
import SpeakingResponsePanel from "./SpeakingResponsePanel";

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
    activityIndex: number;
};

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;
const SPEAK_A2_TASK2_CONVERSATION_INTRO = "SPEAK_A2_TASK2_CONVERSATION_INTRO";
const SPEAK_A2_TASK3_DISCUSSION_INTRO = "SPEAK_A2_TASK3_DISCUSSION_INTRO";
const TRANSITION = { duration: 0.28, ease: "easeOut" as const };
const RUNNER_LAYOUT_MAX_WIDTH = "max-w-[1240px]";
const RUNNER_LAYOUT_BOTTOM_PADDING = "pb-5";

const withCloudFrontPrefix = (resource?: string) => {
    if (!resource) return undefined;
    if (/^https?:\/\//i.test(resource)) return resource;
    if (!cloudFrontDomain) return resource;

    const normalizedDomain = cloudFrontDomain.endsWith("/") ? cloudFrontDomain : `${cloudFrontDomain}/`;
    const normalizedResource = resource.startsWith("/") ? resource.slice(1) : resource;

    return `${normalizedDomain}${normalizedResource}`;
};

const resolveTaskStartPointer = (task: RunnerTask, taskIndex: number): RunnerPointer | null => {
    const firstActivity = (task.activities || [])[0];
    if (!firstActivity) return null;

    return {
        taskIndex,
        taskId: task._id,
        activityKey: firstActivity._key,
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

    const activityIndex = resume.activityKey ? (task.activities || []).findIndex((activity) => activity._key === resume.activityKey) : -1;
    if (activityIndex >= 0) {
        return {
            taskIndex: safeTaskIndex,
            taskId: task._id,
            activityKey: task.activities[activityIndex]._key,
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
    const currentActivityIndex = currentPointer.activityIndex || 0;
    const activities = currentTask.activities || [];
    if (currentActivityIndex + 1 < activities.length) {
        const nextActivity = activities[currentActivityIndex + 1];
        return {
            taskIndex: currentPointer.taskIndex,
            taskId: currentTask._id,
            activityKey: nextActivity._key,
            activityIndex: currentActivityIndex + 1,
        };
    }

    return resolveNextTaskPointer(tasks, currentPointer.taskIndex);
};

function ActivityImageStage({ task, activityIndex }: { task: RunnerTask; activityIndex: number }) {
    const activity = task.activities[activityIndex];
    if (!activity) {
        return (
            <article className="h-full w-full px-2 py-3 md:px-4 md:py-5">
                <p className="mb-0 text-sm text-neutral-700">Activité introuvable.</p>
                <div style={{ height: 61 }}></div>
            </article>
        );
    }

    const imageUrl = activity.image ? urlFor(activity.image).width(1800).fit("max").url() : null;
    const hasImage = Boolean(imageUrl);

    return (
        <article className="h-full w-full flex flex-col overflow-hidden px-2 py-2 md:px-4 md:py-5">
            <div className="grow flex h-full w-full items-center justify-center rounded-[1.4rem] bg-neutral-200/70 px-2">
                {hasImage ? (
                    <div className="flex min-h-[240px] w-full max-w-[640px] min-w-0 items-center justify-center overflow-hidden rounded-[1.2rem] bg-neutral-300/30 md:max-w-[820px] lg:max-w-[980px]">
                        <Image
                            src={imageUrl as string}
                            alt="Image de l'activité"
                            width={1800}
                            height={1200}
                            className="h-auto lg:h-auto w-auto lg:w-full max-w-full object-contain rounded-3xl border-2 border-solid border-neutral-700 md:max-h-full"
                        />
                    </div>
                ) : (
                    <div className="flex h-full min-h-[240px] w-full items-center justify-center rounded-[1.2rem] bg-neutral-300/70 px-6 text-center text-neutral-700">
                        Aucun visuel pour cette activité.
                    </div>
                )}
            </div>
            <div className="hidden md:block" style={{ height: 61 }}></div>
        </article>
    );
}

export default function RunnerScreenRouter({ compilationId, sessionKey, resume, speakA2Tasks, speakA2Answers, isAdvancing, onAdvance, onSpeakA2AnswerSaved }: RunnerScreenRouterProps) {
    const firstPointer = resolveFirstTaskPointer(speakA2Tasks);
    const taskTwoPointer = speakA2Tasks[1] ? resolveTaskStartPointer(speakA2Tasks[1], 1) : null;
    const taskThreePointer = speakA2Tasks[2] ? resolveTaskStartPointer(speakA2Tasks[2], 2) : null;
    const examIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const taskOneDescriptionIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const taskTwoConversationIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");
    const taskThreeDiscussionIntroVideoUrl = withCloudFrontPrefix("fide/video-presentation-fide.mp4");

    if (resume.state === "EXAM_INTRO") {
        return (
            <section className={` w-full h-full overflow-hidden px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
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
                                    nextState: "SPEAK_A2_TASK1_DESCRIPTION_INTRO",
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

    if (resume.state === "SPEAK_A2_TASK1_DESCRIPTION_INTRO") {
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Tâche 1</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Description d'image</h1>
                        <p className="mb-0 text-sm text-neutral-600">Objectif: structurer ta réponse simplement, clairement, et dans le temps imparti.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {taskOneDescriptionIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={taskOneDescriptionIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div className="">
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
                            {isAdvancing ? "Mise à jour..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === SPEAK_A2_TASK2_CONVERSATION_INTRO) {
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Tâche 2</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Conversation téléphonique</h1>
                        <p className="mb-0 text-sm text-neutral-600">Objectif: tenir un échange simple, écouter les relances et répondre clairement.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {taskTwoConversationIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={taskTwoConversationIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div className="">
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() =>
                                onAdvance({
                                    nextState: "SPEAK_A2_RUN",
                                    taskId: taskTwoPointer?.taskId,
                                    activityKey: taskTwoPointer?.activityKey,
                                })
                            }
                            disabled={isAdvancing || !taskTwoPointer}
                        >
                            {isAdvancing ? "Mise à jour..." : "Continuer"}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (resume.state === SPEAK_A2_TASK3_DISCUSSION_INTRO) {
        return (
            <section className={` flex justify-center w-full h-full px-2 py-2 md:px-4 md:py-5 ${RUNNER_LAYOUT_BOTTOM_PADDING}`}>
                <div className={`relative flex flex-col h-full w-full ${RUNNER_LAYOUT_MAX_WIDTH} items-center gap-8 justify-center`}>
                    <div className="lg:max-w-[700px]">
                        <p className="mb-0 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">Tâche 3</p>
                        <h1 className="display-2 font-medium mb-4 text-neutral-900">Discussion guidée</h1>
                        <p className="mb-0 text-sm text-neutral-600">Objectif: exprimer ton avis de façon simple, justifier brièvement et interagir avec l'examinateur.</p>
                    </div>
                    <div className="max-w-[700px] w-full">
                        <div className="relative overflow-hidden rounded-[1.2rem] border-2 border-solid border-neutral-800 bg-neutral-950/95 p-2 shadow-1">
                            {taskThreeDiscussionIntroVideoUrl && (
                                <video controls preload="metadata" className="block h-auto w-full rounded-[0.85rem]">
                                    <source src={taskThreeDiscussionIntroVideoUrl} />
                                    Votre navigateur ne supporte pas la vidéo HTML5.
                                </video>
                            )}
                        </div>
                    </div>
                    <div className="">
                        <button
                            type="button"
                            className="btn btn-primary small min-w-[220px]"
                            onClick={() =>
                                onAdvance({
                                    nextState: "SPEAK_A2_RUN",
                                    taskId: taskThreePointer?.taskId,
                                    activityKey: taskThreePointer?.activityKey,
                                })
                            }
                            disabled={isAdvancing || !taskThreePointer}
                        >
                            {isAdvancing ? "Mise à jour..." : "Continuer"}
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
                <section
                    className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}
                >
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
        const nextPointer = resolveNextPointer(speakA2Tasks, currentPointer);
        const buildAdvancePayload = (pointer: RunnerPointer | null): AdvancePayload => {
            if (!pointer) return { nextState: "SPEAK_A2_RESULT" };

            if (pointer.taskIndex !== currentPointer.taskIndex) {
                if (pointer.taskIndex === 1) {
                    return {
                        nextState: SPEAK_A2_TASK2_CONVERSATION_INTRO,
                        taskId: pointer.taskId,
                        activityKey: pointer.activityKey,
                    };
                }
                if (pointer.taskIndex === 2) {
                    return {
                        nextState: SPEAK_A2_TASK3_DISCUSSION_INTRO,
                        taskId: pointer.taskId,
                        activityKey: pointer.activityKey,
                    };
                }
            }

            return {
                nextState: "SPEAK_A2_RUN",
                taskId: pointer.taskId,
                activityKey: pointer.activityKey,
            };
        };

        const nextAdvancePayload = buildAdvancePayload(nextPointer);
        const nextTaskIntroState =
            nextAdvancePayload.nextState === SPEAK_A2_TASK2_CONVERSATION_INTRO || nextAdvancePayload.nextState === SPEAK_A2_TASK3_DISCUSSION_INTRO ? nextAdvancePayload.nextState : null;

        const continueLabel = !nextPointer ? "Terminer la section A2" : nextTaskIntroState ? "Tâche suivante" : "Activité suivante";

        if (currentTask.taskType === "DISCUSSION_A2") {
            const activities = currentTask.activities || [];
            const safeActivityIndex = Math.max(0, Math.min(currentPointer.activityIndex || 0, Math.max(activities.length - 1, 0)));
            const activeActivity = activities[safeActivityIndex];

            if (!activeActivity) {
                return (
                    <section className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8`}>
                        <p className="mb-0 text-neutral-700">Aucune question de discussion disponible.</p>
                    </section>
                );
            }

            const answersForTask = speakA2Answers.filter((answer) => getAnswerTaskId(answer) === currentPointer.taskId);
            const answersByActivityKey = new Map(answersForTask.map((answer) => [answer.activityKey, answer] as const));
            const isActivityValidated = (activityKey: string) => {
                const answer = answersByActivityKey.get(activityKey);
                return Boolean(answer?.audioUrl && String(answer?.transcriptFinal || "").trim().length > 0);
            };

            const validatedCount = activities.reduce((count, activity) => (isActivityValidated(activity._key) ? count + 1 : count), 0);
            const firstUnvalidatedIndex = activities.findIndex((activity) => !isActivityValidated(activity._key));
            const highestUnlockedIndex = firstUnvalidatedIndex === -1 ? activities.length - 1 : firstUnvalidatedIndex;
            const progressPercent = activities.length > 0 ? Math.round((validatedCount / activities.length) * 100) : 0;
            const lastActivity = activities[activities.length - 1];
            const afterDiscussionPointer = lastActivity
                ? resolveNextPointer(speakA2Tasks, {
                      taskIndex: currentPointer.taskIndex,
                      taskId: currentPointer.taskId,
                      activityIndex: activities.length - 1,
                      activityKey: lastActivity._key,
                  })
                : null;
            const afterDiscussionPayload = buildAdvancePayload(afterDiscussionPointer);
            const activeAnswer = answersByActivityKey.get(activeActivity._key);

            return (
                <section
                    className={`pt-0 md:pt-8 lg:pt-12 grid w-full lg:w-auto ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-4 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(240px,320px)_minmax(0,600px)]`}
                >
                    <aside className="min-h-0">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <p className="hidden lg:block mb-0 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-600">Discussion</p>
                                <h2 className="mb-0 text-xl font-semibold text-neutral-900">{activities.length} questions à traiter</h2>
                                <p className="mb-0 text-sm text-neutral-600">
                                    {validatedCount}/{activities.length} validée{validatedCount > 1 ? "s" : ""}
                                </p>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-300">
                                <div className="h-full rounded-full bg-secondary-2 transition-all" style={{ width: `${progressPercent}%` }} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
                                {activities.map((activity, index) => {
                                    const isValidated = isActivityValidated(activity._key);
                                    const isActive = index === safeActivityIndex;
                                    const isUnlocked = index <= highestUnlockedIndex || isValidated;

                                    return (
                                        <button
                                            type="button"
                                            key={activity._key}
                                            onClick={() =>
                                                onAdvance({
                                                    nextState: "SPEAK_A2_RUN",
                                                    taskId: currentPointer.taskId,
                                                    activityKey: activity._key,
                                                })
                                            }
                                            disabled={isAdvancing || !isUnlocked}
                                            className={clsx(
                                                "w-full rounded-xl border border-solid p-3 text-left transition",
                                                isActive
                                                    ? "border-neutral-600 border-2 bg-neutral-100 text-secondary-2 font-bold"
                                                    : isValidated
                                                      ? "border-secondary-2 bg-secondary-2"
                                                      : isUnlocked
                                                        ? "border-neutral-300 bg-secondary-2 hover:border-neutral-600"
                                                        : "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed",
                                            )}
                                        >
                                            <p className="mb-0 text-sm font-semibold text-inherit">Question {index + 1}</p>
                                            <p className="mb-0 text-xs text-inherit">{isValidated ? "Validée" : isActive ? "En cours" : isUnlocked ? "À faire" : "Verrouillée"}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    <div className="min-h-0 flex flex-col gap-2 lg:min-w-[600px]">
                        <div className="px-2 md:px-4">
                            <p className="mb-0 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
                                Question {safeActivityIndex + 1}/{activities.length}
                            </p>
                        </div>

                        <SpeakingResponsePanel
                            key={`${currentPointer.taskId}-${activeActivity._key}`}
                            compilationId={compilationId}
                            sessionKey={sessionKey}
                            taskId={currentPointer.taskId}
                            activityKey={activeActivity._key}
                            taskType={currentTask.taskType}
                            activityAiContext={activeActivity.aiContext}
                            activityAiVoiceGender={activeActivity.aiVoiceGender}
                            questionAudioUrl={activeActivity.audioUrl}
                            promptText={activeActivity.promptText}
                            existingAnswer={activeAnswer}
                            isAdvancing={isAdvancing}
                            onAnswerSaved={onSpeakA2AnswerSaved}
                            onValidated={() => {
                                const nextIndex = safeActivityIndex + 1;
                                if (nextIndex < activities.length) {
                                    return onAdvance({
                                        nextState: "SPEAK_A2_RUN",
                                        taskId: currentPointer.taskId,
                                        activityKey: activities[nextIndex]._key,
                                    });
                                }
                                return onAdvance(afterDiscussionPayload);
                            }}
                        />
                    </div>
                </section>
            );
        }

        const currentAnswer = speakA2Answers.find((answer) => getAnswerTaskId(answer) === currentPointer.taskId && answer.activityKey === currentPointer.activityKey);

        return (
            <section
                className={`grid w-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} grid-cols-1 gap-2 py-0 lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.7fr)] lg:grid-rows-1 lg:gap-6`}
            >
                <div className="min-h-0 flex flex-col">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`activity-${currentPointer.activityKey}`}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={TRANSITION}
                            className="h-full grow flex items-center"
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
                        activityAiContext={currentTask.activities[currentPointer.activityIndex || 0]?.aiContext}
                        activityAiVoiceGender={currentTask.activities[currentPointer.activityIndex || 0]?.aiVoiceGender}
                        questionAudioUrl={currentTask.activities[currentPointer.activityIndex || 0]?.audioUrl}
                        promptText={currentTask.activities[currentPointer.activityIndex || 0]?.promptText}
                        existingAnswer={currentAnswer}
                        isAdvancing={isAdvancing}
                        onAnswerSaved={onSpeakA2AnswerSaved}
                        onValidated={() => onAdvance(nextAdvancePayload)}
                    />
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_A2_RESULT") {
        return (
            <section
                className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}
            >
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
        <section
            className={`w-full h-full ${RUNNER_LAYOUT_MAX_WIDTH} ${RUNNER_LAYOUT_BOTTOM_PADDING} card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0`}
        >
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
