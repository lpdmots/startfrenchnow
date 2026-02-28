import { Block, Image } from "../sfn/blog";

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
    | "IMAGE_DESCRIPTION_A1"
    | "DISCUSSION_B1"
    | "READ_WRITE_M1"
    | "READ_WRITE_M2"
    | "READ_WRITE_M3_M4"
    | "READ_WRITE_M5"
    | "READ_WRITE_M6";

export type TaskMediaBlock = {
    /** Tips / instructions courtes affichées avant de démarrer, ou correction écrite en fin */
    text?: PortableText;
    /** Vidéo d’intro skippable (S3/CloudFront) ou de correction */
    videoUrl?: string;
    /** Image d’intro optionnelle (Sanity) ou de correction*/
    image?: Image;
    layout?: "vertical" | "horizontal"; // optionnel, pour gérer le layout de l’intro (ex: vidéo à côté du texte vs au-dessus)
};

/**
 * Une activity = un "prompt" successif à enregistrer.
 * - Pour IMAGE_DESCRIPTION_A2: en général 1 activity (image + audio question).
 * - Pour IMAGE_DESCRIPTION_A1: plusieurs activities (chaque activity peut avoir image+audio).
 * - Pour PHONE_CONVERSATION / DISCUSSION: plusieurs activities avec audio + (optionnel) texte.
 */
export type Activity = {
    /** _key Sanity (stable) — pas besoin de le stocker ici, mais on le documente */
    // _key: string; // fourni par Sanity au runtime

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

    /** Points max attribuables à cette activity (barème détaillé géré par l'IA / programme) */
    maxPoints: number;
};

export type MockExamTask = {
    // document Sanity
    /** _id Sanity (utilisé comme identifiant de tâche) */
    // _id: string; // fourni par Sanity

    taskType: TaskType;
    introBlocks: TaskMediaBlock[]; // defaut array pouvant être vide []

    /**
     * Contexte commun ajouté au prompt IA global (défini dans le programme).
     * Les aiContext des activities viennent en complément par activité.
     */
    aiTaskContext?: string;

    /**
     * Liste ordonnée d’activities (= prompts successifs).
     * L’identifiant stable de chaque activity est son `_key` fourni par Sanity.
     */
    activities: Activity[];

    /**
     * Correction type associée à la tâche (affichée dans le feedback de fin de section,
     * ou à l’endroit que le programme décide).
     */
    correctionBlocks: TaskMediaBlock[]; // defaut array pouvant être vide []
};

/**
 * ExamCompilation
 * - On refetch toujours les tasks (Sanity) au moment d’exécuter/afficher, si elles ne sont pas déjà renseignées dans MockExamConfigRef (dans ce cas c'est un replay)
 * - On stocke seulement : config (IDs), choix, progression, réponses, scores
 */

export type SessionStatus = "in_progress" | "completed" | "abandoned";
export type OralBranch = "A1" | "B1";
export type WrittenCombo = "A1_A2" | "A2_B1";

export type ScoreSummary = { score: number; max: number };
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

export type SpeakingAnswer = {
    taskId: string; // Sanity _id
    activityKey: string; // _key de l’activity dans la task Sanity
    audioUrl: string;
    transcriptFinal: string;
    AiFeedback?: string;
    AiScore?: ScoreSummary;
};

export type ReadWriteAnswer = {
    taskId: string; // Sanity _id
    activityKey: string; // _key de l’activity dans la task Sanity
    textAnswer: string;
    AiFeedback?: string;
    AiScore?: ScoreSummary;
};

export type ResumePointer = {
    state: string; // ex: "SPEAK_A2_REVIEW"
    taskId?: string;
    activityKey?: string;
    updatedAt: string;
};

export type ExamCompilation = {
    // <-- un champs examCompilations à ajouter au schema User.
    _id: string; // identifiant de session (généré à la création, utilisé pour fetch/update)
    userId: string;

    createdAt: string; // ne pas créer dans le schéma car intégré dans les docs Sanity
    updatedAt: string; // ne pas créer dans le schéma car intégré dans les docs Sanity

    /** Configuration compilée sous forme de références */
    examConfig: MockExamConfigRef;

    /** IA propose, user choisit */
    oralBranch: { recommended: OralBranch; chosen?: OralBranch };
    writtenCombo: { recommended: WrittenCombo; chosen?: WrittenCombo };

    session: MockExamSession[];
};

export type MockExamSession = {
    // Si une ancienne session est noté non terminée, elle est écrasée par la nouvelle session (même userId) créée au début de l’exam. Donc il n’y a jamais que 0 ou 1 session "in_progress" par userId. On garde les 5 dernières sessions uniquement. À la fin d'une session, l'utilisateur a la possibilité de demander un retour du professeur sur son travail, auquel cas les réponses fournies speakA2Answers, speakBranchAnswers, readWriteAnswers sont sotckées dans un document ExamReview. Dans tous les cas, les réponses sont supprimées de la session à la fin.
    _key: string; // identifiant de l’activité en cours
    status: SessionStatus;
    startedAt: string;
    /** Progression (reprise au dernier écran) */
    resume: ResumePointer;
    /** Réponses */
    speakA2Answers: SpeakingAnswer[];
    speakBranchAnswers: SpeakingAnswer[];
    readWriteAnswers: ReadWriteAnswer[];

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
