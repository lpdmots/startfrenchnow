"use client";

import Image from "next/image";
import { PortableText } from "@portabletext/react";
import urlFor from "@/app/lib/urlFor";
import type { ResumePointer } from "@/app/types/fide/mock-exam";
import type { RunnerTask, RunnerTaskMediaBlock } from "@/app/types/fide/mock-exam-runner";

type AdvancePayload = {
    nextState: string;
    taskId?: string;
    activityKey?: string;
};

type RunnerScreenRouterProps = {
    resume: ResumePointer;
    speakA2Tasks: RunnerTask[];
    isAdvancing: boolean;
    onAdvance: (payload: AdvancePayload) => Promise<void>;
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
    const hasVisual = Boolean(videoUrl || imageUrl);
    const useHorizontal = block.layout === "horizontal" && hasText && hasVisual;

    return (
        <article className="rounded-xl border border-neutral-300 bg-neutral-100 p-4 md:p-5 h-full overflow-auto">
            <div className={useHorizontal ? "grid gap-4 lg:grid-cols-2 items-start" : "flex flex-col gap-4"}>
                <div className="flex flex-col gap-3 order-2 lg:order-1">
                    {hasText ? (
                        <div className="text-sm text-neutral-800 leading-relaxed">
                            <PortableText value={block.text as any} />
                        </div>
                    ) : (
                        <p className="mb-0 text-sm text-neutral-600">Aucun texte pour ce bloc.</p>
                    )}
                </div>

                <div className="flex flex-col gap-3 order-1 lg:order-2">
                    {videoUrl && (
                        <video controls preload="metadata" className="w-full rounded-lg border border-neutral-300 bg-neutral-200">
                            <source src={videoUrl} />
                            Votre navigateur ne supporte pas la vidéo HTML5.
                        </video>
                    )}

                    {imageUrl && (
                        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg border border-neutral-300 bg-neutral-200">
                            <Image src={imageUrl} alt="Illustration du bloc" fill className="object-cover" />
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}

function ActivityStimulusStage({ task, activityIndex }: { task: RunnerTask; activityIndex: number }) {
    const activity = task.activities[activityIndex];
    if (!activity) {
        return (
            <article className="rounded-xl border border-neutral-300 bg-neutral-100 p-4 md:p-5 h-full">
                <p className="mb-0 text-sm text-neutral-700">Activité introuvable.</p>
            </article>
        );
    }

    const imageUrl = activity.image ? urlFor(activity.image).width(1600).height(1000).fit("crop").url() : null;
    const audioUrl = withCloudFrontPrefix(activity.audioUrl);
    const hasPrompt = Boolean(activity.promptText);
    const hasImage = Boolean(imageUrl);
    const hasAudio = Boolean(audioUrl);
    const useSplitLayout = hasImage && (hasPrompt || hasAudio);

    return (
        <article className="rounded-xl border border-neutral-300 bg-neutral-100 p-4 md:p-5 h-full overflow-auto">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="mb-0 text-lg font-semibold text-neutral-800">Stimulus activité</h3>
                    <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{task.taskType}</span>
                </div>

                <div className={useSplitLayout ? "grid gap-4 lg:grid-cols-2 items-start" : "flex flex-col gap-4"}>
                    {hasImage && (
                        <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg border border-neutral-300 bg-neutral-200">
                            <Image src={imageUrl as string} alt="Image de l'activité" fill className="object-cover" />
                        </div>
                    )}

                    <div className="flex flex-col gap-4">
                        {hasAudio && (
                            <audio controls preload="metadata" className="w-full">
                                <source src={audioUrl} />
                                Votre navigateur ne supporte pas l'audio HTML5.
                            </audio>
                        )}

                        {hasPrompt ? (
                            <div className="text-sm text-neutral-800 leading-relaxed">
                                <PortableText value={activity.promptText as any} />
                            </div>
                        ) : (
                            <p className="mb-0 text-sm text-neutral-600">Aucun prompt texte pour cette activité.</p>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function RunnerScreenRouter({ resume, speakA2Tasks, isAdvancing, onAdvance }: RunnerScreenRouterProps) {
    const firstPointer = resolveFirstTaskPointer(speakA2Tasks);

    if (resume.state === "EXAM_INTRO") {
        return (
            <section className="w-full h-full card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0">
                <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">EXAMEN BLANC</p>
                    <h1 className="display-2 font-medium mb-0">Introduction</h1>
                    <p className="mb-0 text-neutral-700">Parcours séquentiel, sans retour arrière. Ta progression est sauvegardée automatiquement.</p>
                    <p className="mb-0 text-sm text-neutral-600">Tâches Parler A2 chargées : {speakA2Tasks.length}</p>
                </div>

                <div className="flex justify-end">
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
            </section>
        );
    }

    if (resume.state === "SPEAK_A2_RUN") {
        const currentPointer = resolvePointerFromResume(speakA2Tasks, resume);
        if (!currentPointer) {
            return (
                <section className="w-full h-full card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0">
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

        const continueLabel = !nextPointer
            ? "Terminer la section A2"
            : nextPointer.mode === "intro"
              ? "Bloc suivant"
              : currentPointer.mode === "intro"
                ? "Commencer l'activité"
                : "Activité suivante (placeholder)";

        return (
            <section className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4 py-0 min-h-0">
                <div className="lg:col-span-7 min-h-0 flex flex-col overflow-hidden">
                    <div className="card border-2 border-solid border-neutral-700 p-5 flex-1 min-h-0 overflow-hidden">
                        {currentPointer.mode === "intro" ? (
                            <IntroBlockStage block={introBlocks[currentPointer.introIndex || 0]} />
                        ) : (
                            <ActivityStimulusStage task={currentTask} activityIndex={currentPointer.activityIndex || 0} />
                        )}
                    </div>
                </div>

                <div className="lg:col-span-5 min-h-0">
                    <article className="card border-2 border-solid border-neutral-700 p-5 h-full flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-3">
                            <p className="mb-0 text-sm uppercase tracking-wide text-neutral-500">Réponse</p>
                            <h3 className="mb-0 text-2xl font-semibold text-neutral-800">Bloc enregistrement à venir</h3>
                            <p className="mb-0 text-neutral-700">
                                Placeholder uniquement pour l'instant. Le module d'enregistrement, de correction et de validation sera branché à l'étape suivante.
                            </p>
                        </div>

                        <div className="flex justify-end">
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
                    </article>
                </div>
            </section>
        );
    }

    if (resume.state === "SPEAK_A2_RESULT") {
        return (
            <section className="w-full h-full card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0">
                <div className="flex flex-col gap-3">
                    <p className="text-sm uppercase tracking-wide text-neutral-500 mb-0">RÉSULTAT</p>
                    <h1 className="display-2 font-medium mb-0">Parler A2 terminé</h1>
                    <p className="mb-0 text-neutral-700">Transition validée. On branchera ensuite l'écran de résultat complet.</p>
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        className="btn btn-primary small min-w-[220px]"
                        onClick={() => onAdvance({ nextState: "SPEAK_BRANCH_INTRO" })}
                        disabled={isAdvancing}
                    >
                        {isAdvancing ? "Mise à jour..." : "Aller à la section suivante"}
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="w-full h-full card border-2 border-solid border-neutral-700 p-6 md:p-8 flex flex-col justify-between gap-6 py-0">
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
