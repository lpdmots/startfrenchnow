import type { Block, Image } from "../sfn/blog";

export type PortableText = Block[];

/**
 * Task (Sanity) — version finale (simple, data-driven, règles fixes côté programme)
 * Hypothèses (codées dans le programme, pas dans la data) :
 * - STT toujours activé
 * - transcript toujours éditable + validation obligatoire
 * - attemptLimit toujours 3
 * - feedback/scoring affichés à la fin de la section (A2 complet / branche complète)
 * - _key (Sanity) sert d’identifiant stable pour chaque activity
 * - l’ordre des activities = l’ordre du tableau (Sanity ordonné)
 */

export type TaskType =
    | "IMAGE_DESCRIPTION_A2"
    | "PHONE_CONVERSATION_A2"
    | "DISCUSSION_A2"
    | "IMAGE_DESCRIPTION_A1_T1"
    | "IMAGE_DESCRIPTION_A1_T2"
    | "DISCUSSION_B1"
    | "READ_WRITE_M1"
    | "READ_WRITE_M2"
    | "READ_WRITE_M3_M4"
    | "READ_WRITE_M5"
    | "READ_WRITE_M6";

export type AIVoiceGender = "male" | "female";

export type ReadWriteItemType = "instruction" | "single_choice" | "numbered_fill" | "text_extract" | "long_text";

export type ReadWriteAnswerOption = {
    _key?: string;
    label?: string;
    isCorrect?: boolean;
};

export type ReadWriteItem = {
    _key?: string;
    itemType?: ReadWriteItemType;
    contentText?: PortableText;
    question?: string;
    image?: Image;
    imageAlternativeText?: PortableText;
    answerOptions?: ReadWriteAnswerOption[];
    aiCorrectionContext?: string;
    maxPoints?: number;
};

/**
 * Une activity = un "prompt" successif à enregistrer.
 * - Pour IMAGE_DESCRIPTION_A2: en général 1 activity (image + audio question).
 * - Pour IMAGE_DESCRIPTION_A1_T1 / IMAGE_DESCRIPTION_A1_T2: plusieurs activities (chaque activity peut avoir image+audio).
 * - Pour PHONE_CONVERSATION / DISCUSSION: plusieurs activities avec audio + (optionnel) texte.
 */
export type Activity = {
    /** _key Sanity (stable) — pas besoin de le stocker ici, mais on le documente */
    // _key: string; // fourni par Sanity au runtime

    /** Titre de la tâche (utile pour Lire/Écrire) */
    title?: string;

    /** Support visuel optionnel (image de Sanity) */
    image?: Image;

    /** Audio de la consigne / question (S3/CloudFront) */
    audioUrl?: string;

    /** Texte de consigne / question (si besoin en complément ou fallback) */
    promptText?: PortableText; // promptText doit pouvoir être converti en plain text pour l’IA” (ex: toPlainText(portableText)) pour ne pas envoyer du portableText brut à l'IA.

    /**
     * Contexte optionnel ajouté au prompt IA global (défini dans le programme).
     * Exemple : "L'élève doit utiliser le passé composé" / "focus sur les prépositions de lieu" etc.
     */
    aiContext?: string;
    aiCorrectionContext?: string;

    /** Sélection de voix IA pour l'activité (homme/femme) */
    aiVoiceGender?: AIVoiceGender;

    /** Points max attribuables à cette activity (optionnel selon le type de tâche) */
    maxPoints?: number;

    /** Items d'activité (consigne + questions) pour Lire/Écrire */
    items?: ReadWriteItem[];
};

export type MockExamTask = {
    // document Sanity
    /** _id Sanity (utilisé comme identifiant de tâche) */
    // _id: string; // fourni par Sanity

    taskType: TaskType;

    /** Support PDF général du module (Lire/Écrire) */
    supportPdfUrl?: string;

    /**
     * Liste ordonnée d’activities (= prompts successifs).
     * L’identifiant stable de chaque activity est son `_key` fourni par Sanity.
     */
    activities: Activity[];
};

/**
 * ExamCompilation
 * - Template éditorial (statique) géré dans Sanity
 * - Le runtime utilisateur est stocké dans des documents MockExamSession séparés
 */

export type SessionStatus = "in_progress" | "completed" | "abandoned";
export type OralBranch = "A1" | "B1";
export type WrittenCombo = "A1_A2" | "A2_B1";

export type ScoreSummary = { percentage: number; feedback: string };
export type Reference = { _type: "reference"; _ref: string }; // Sanity reference

export type MockExamConfigRef = {
    /** Liste des tasks speaking A2 (3 tasks typiquement) */
    speakA2TaskIds: Reference[]; // Sanity _id

    /** Branch speaking */
    speakBranchTaskIds: { A1: Reference[]; B1: Reference[] };

    /** Comprendre (ton composant existant) : identifiant(s) nécessaires pour charger le pack */
    listeningPackIds: { A1: Reference[]; A2: Reference[]; B1: Reference[] }; // ou string[] selon ton modèle

    /** Lire/Écrire : modules (tasks Sanity) */
    readWriteTaskIds: { A1_A2: Reference[]; A2_B1: Reference[] };
};

export type CorrectionStateType =
    | "SPEAK_A2_RESULT"
    | "SPEAK_BRANCH_RESULT"
    | "SPEAK_BRANCH_RESULT_A1"
    | "SPEAK_BRANCH_RESULT_CHOICE_1"
    | "SPEAK_BRANCH_RESULT_CHOICE_2"
    | "LISTENING_RESULT"
    | "READ_WRITE_RESULT"
    | "TOTAL_RESULT";

export type ExamCorrectionContent = {
    _key?: string;
    correctionType: CorrectionStateType | string;
    video?: string;
    image?: Image;
    body?: PortableText;
};

export type SpeakingAnswer = {
    taskRef: Reference;
    taskId?: string; // legacy
    activityKey: string; // _key de l’activity dans la task Sanity
    audioUrl: string;
    transcriptFinal: string;
    AiFeedback?: string;
    AiScore?: number;
};

export type ReadWriteAnswer = {
    taskRef: Reference;
    taskId?: string; // legacy
    activityKey: string; // _key de l’activity dans la task Sanity
    questionKey: string; // _key de la question dans l’activity
    textAnswer: string;
    AiFeedback?: string;
    AiScore?: number;
};

export const getAnswerTaskId = (answer?: { taskRef?: Reference; taskId?: string } | null) => answer?.taskRef?._ref || answer?.taskId || "";

export type ListeningScenarioResult = {
    examRef: Reference;
    score: number;
    max: number;
    completedAt: string;
};

export type ResumePointer = {
    state: string; // ex: "SPEAK_A2_REVIEW"
    taskId?: string;
    activityKey?: string;
    updatedAt: string;
};

export type ExamCompilation = {
    _id: string;
    name: string;
    isActive?: boolean;
    order?: number;
    image?: Image;
    corrections?: ExamCorrectionContent[];

    createdAt: string;
    updatedAt: string;

    /** Configuration template sous forme de références */
    examConfig: MockExamConfigRef;
};

export type MockExamSession = {
    _id: string;
    userRef: Reference;
    compilationRef: Reference;
    status: SessionStatus;
    startedAt: string;
    resume: ResumePointer;
    oralBranch?: { recommended?: OralBranch; chosen?: OralBranch };
    writtenCombo: { recommended: WrittenCombo; chosen?: WrittenCombo };
    speakA2Answers: SpeakingAnswer[];
    speakA2CorrectionRetryCount?: number;
    speakBranchCorrectionRetryCount?: number;
    speakBranchAnswers: SpeakingAnswer[];
    listeningScenarioResults?: ListeningScenarioResult[];
    readWriteAnswers: ReadWriteAnswer[];
    readWriteCorrectionRetryCount?: number;

    overtimeTaskRefs?: Reference[]; // références Sanity des tasks pour lesquelles l’utilisateur a dépassé le temps imparti

    /** Scores finaux */
    scores?: {
        speakA2?: ScoreSummary;
        speakBranch?: ScoreSummary;
        listening?: ScoreSummary;
        readWrite?: ScoreSummary;
        total?: ScoreSummary;
    };
};

export type UserExamCompilationEntry = {
    _key?: string;
    compilationRef: Reference;
    sessions?: Reference[];
    updatedAt?: string;
};

/**
 * ExamReview (Sanity)
 * Créé à la fin d’une MockExamSession si l’utilisateur demande un retour professeur.
 * Contient les réponses (audio/text) + quelques métadonnées pour contextualiser le debrief.
 */

export type ReviewStatus = "requested" | "scheduled" | "completed" | "cancelled";

export type ExamReview = {
    _id: string;
    userId: string;
    compilationRef: Reference;
    sessionKey: string;

    status: ReviewStatus;
    scheduledAt?: string; // ISO (si tu planifies)

    path: {
        oralBranch: OralBranch; // A1 ou B1
        writtenCombo: WrittenCombo; // A1_A2 ou A2_B1
    };

    taskRefs: {
        speakA2: Reference[];
        speakBranch: Reference[];
        listening: Reference[];
        readWrite: Reference[];
    };

    answers: {
        speakA2: SpeakingAnswer[];
        speakBranch: SpeakingAnswer[];
        readWrite: ReadWriteAnswer[];
    };

    overtimeTaskRefs?: Reference[]; // tasks où le temps a été dépassé

    scores?: {
        speakA2?: ScoreSummary;
        speakBranch?: ScoreSummary;
        listening?: ScoreSummary;
        readWrite?: ScoreSummary;
        total?: ScoreSummary;
    };

    /**
     * Infos de debrief (Zoom) — optionnel (même si tu ne “retournes” rien depuis Zoom)
     */
    meeting?: {
        provider: "zoom";
        joinUrl?: string;
        startAt?: string; // ISO
        timezone?: string; // ex: "Europe/Berlin"
    };

    /**
     * Message optionnel de l’utilisateur pour guider le prof
     */
    userNote?: string;

    /**
     * Notes/feedback du professeur (si vous souhaitez les stocker)
     */
    teacherFeedback?: {
        text?: PortableText; // ou string
        deliveredAt?: string; // ISO
    };
};
