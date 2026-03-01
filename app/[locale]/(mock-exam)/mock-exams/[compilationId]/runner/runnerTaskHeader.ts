import type { RunnerTask } from "@/app/types/fide/mock-exam-runner";

const TASK_TITLE_BY_TYPE: Record<string, string> = {
    IMAGE_DESCRIPTION_A2: "Décrire une image - A2",
    PHONE_CONVERSATION_A2: "Conversation",
    DISCUSSION_A2: "Discussion A2",
    IMAGE_DESCRIPTION_A1_T1: "Décrire une image (1)",
    IMAGE_DESCRIPTION_A1_T2: "Décrire une image (2)",
    DISCUSSION_B1: "Discussion B1",
    READ_WRITE_M1: "Lire/Écrire - A1",
    READ_WRITE_M2: "Lire/Écrire - A1+",
    READ_WRITE_M3_M4: "Lire/Écrire - A2",
    READ_WRITE_M5: "Lire/Écrire - A2+",
    READ_WRITE_M6: "Lire/Écrire - B1",
};

export const getTaskTitle = (taskType?: string) => TASK_TITLE_BY_TYPE[taskType || ""] || "Tâche orale";

export const getTaskSubtitle = (taskIndex: number, totalTasks: number) => `Tâche ${taskIndex + 1}/${totalTasks}`;

export const getSpeakingTaskHeader = (task: RunnerTask | undefined, taskIndex: number, totalTasks: number) => {
    if (!task || totalTasks <= 0) {
        return { title: "Parler A2", subtitle: "Aucune tâche" };
    }

    return {
        title: getTaskTitle(task.taskType),
        subtitle: getTaskSubtitle(taskIndex, totalTasks),
    };
};
