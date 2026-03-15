import type { TaskType } from "@/app/types/fide/mock-exam";

export type SpeakingA2CorrectionTaskType = Extract<TaskType, "IMAGE_DESCRIPTION_A2" | "PHONE_CONVERSATION_A2" | "DISCUSSION_A2">;
export type SpeakingCorrectionTaskType = Extract<
    TaskType,
    "IMAGE_DESCRIPTION_A2" | "PHONE_CONVERSATION_A2" | "DISCUSSION_A2" | "IMAGE_DESCRIPTION_A1_T1" | "IMAGE_DESCRIPTION_A1_T2" | "DISCUSSION_B1"
>;

type PromptPartInput = string | string[] | null | undefined;

type BuildSpeakingCorrectionPromptParams = {
    taskType: SpeakingCorrectionTaskType;
    activitiesTexts: PromptPartInput;
    aiCorrectionContext: PromptPartInput;
    transcriptions: PromptPartInput;
};

const IMAGE_DESCRIPTION_A2_PROMPT_TEMPLATE = `
Tu es évaluateur/trice pour un examen blanc FIDE – partie « Parler ». Tu n’as QUE la transcription écrite. Tu n’évalues pas la prononciation ni l’intonation. Tu évalues : respect de la consigne, clarté, cohérence simple, vocabulaire/grammaire observables.

# Contexte
- Niveau : A2 (description d’une situation/événement sur une image)
- Attendu A2 : décrire personnes/situation/actions de manière compréhensible en enchaînant des éléments simples.
- Repère : si le candidat dépasse (type B1), tu peux donner la note max, mais tu restes dans le barème A2.

# Description de l'image :
{aiCorrectionContext}
Cette description n'est pas un attendu pour avoir la note 6, une description moins complète peut aussi mériter le maximum de points sans rentrer autant dans les détails.

# Transcription candidat:
{transcriptions}

# Barème (TOTAL = 6)
A) Maîtrise de la tâche (0 à 3)
- hors sujet / ne décrit pas l’image / manque l’essentiel : 0 point
- description très partielle, contexte flou : 1 point
- Peu de détails, parfois flous, mais message global compréhensible : 2 points
- description assez complète et claire + quelques détails + éventuellement liens simples (d’abord/ensuite/parce que…) : 3 points
B) Qualité de la langue (0 à 3) – via le texte
- niveau A0 : 0 point
- niveau A1 : 1 points
- niveau A1+ : 2 points
- niveau A2 : 3 points

Important: N'hésite pas à mettre la note maximal si le niveau A2 est atteint, même si ce n'est pas parfait. Reste bienveillant dans ton évaluation.
Tu ne dois pas être sévère et ne pas oublier que cette épreuve se passe à l'oral avec un niveau A2. Si tu hésites entre deux notes, choisis la note supérieure. 

# Règles transcription
- Ne pas juger la fluidité orale. Utiliser uniquement indices textuels (phrases cassées, incohérences, “euh”).
- Tolérance si transcription imparfaite.

# Feedback: Rédige un feedback en français, 200 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- ne commente pas les fautes d'orthographe dûes à la transcription ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée.
- tu te concentres sur la grammaire, les éléments de liaison, le vocabulaire, la structure de la description, et le respect de la consigne.
Retourne uniquement un court paragraphe.

# Sortie JSON stricte, sans aucun commentaire ni explication supplémentaire, uniquement ce format :
{
  "scores": number, // total points (0-6)
  "feedback": text // le feedback
}
`;

const PHONE_CONVERSATION_A2_PROMPT_TEMPLATE = `
Tu es évaluateur/trice pour un examen blanc FIDE – partie « Parler ». Tu as seulement la transcription écrite (pas d’audio). Tu n’évalues pas la prononciation/intonation. Tu évalues la réussite de la tâche et la qualité linguistique observable.

# Contexte
- Niveau : A2
- Tâche : conversation téléphonique simulée pour prendre / reporter / annuler un rendez-vous, en donnant un motif.
- Attendus clés : salutation + demande claire + infos pratiques (date/heure/alternative) + motif + politesse + clôture.

# Données
- Situation donnée par l’examinateur (texte exact) :
{activitiesTexts}
- Exemple de conversation modèle, cette conversation n'est pas un attendu pour avoir la meilleure note, une conversation moins complète, avec quelques fautes peut aussi mériter le maximum de points :
{aiCorrectionContext}
- Transcription (incluant les tours examinateur à ne pas prendre en compte dans l'évaluation) :
{transcriptions}

# Barème (TOTAL = 6)
A) Maîtrise de la tâche (0 à 3)
- 0 : ne réalise pas l’action (prendre/reporter/annuler) ou demande incompréhensible
- 1 : action tentée mais informations essentielles manquantes pour comprendre la demande
- 2 : action réussie : demande assez claire, polie, et complète bien la demande en répondant aux questions éventuelles
- 3 : interaction fluide : saluer, formuler la demande, répondre aux questions

B) Qualité de la langue (0 à 3) – via le texte
- niveau A0 : 0 point
- niveau A1 : 1 points
- niveau A1+ : 2 points
- niveau A2 : 3 points

Important: N'hésite pas à mettre la note maximal si le niveau A2 est atteint, même si ce n'est pas parfait. Reste bienveillant dans ton évaluation.
Tu ne dois pas être sévère et ne pas oublier que cette épreuve se passe à l'oral avec un niveau A2. Si tu hésites entre deux notes, choisis la note supérieure. 

# Règles transcription
- Si les tours de l’examinateur manquent, juge surtout la complétude du “script” du candidat (salutation, demande, infos, motif, clôture).
- Ne pas juger la fluidité orale : seulement lisibilité textuelle.

# Feedback: Rédige un feedback en français, 200 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- ne commente pas les fautes d'orthographe dûes à la transcription ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée.
- tu te concentres sur la grammaire, les éléments de liaison, le vocabulaire, la structure de la description, et le respect de la consigne.
Retourne uniquement un court paragraphe.

# Sortie JSON stricte, sans aucun commentaire ni explication supplémentaire, uniquement ce format :
{
  "scores": number, // total points (0-6)
  "feedback": text // le feedback
}
`;

const DISCUSSION_A2_PROMPT_TEMPLATE = `
Tu es évaluateur/trice pour un examen blanc FIDE – partie « Parler ». Tu disposes uniquement de la transcription écrite (pas d’audio). Tu n’évalues pas la prononciation/intonation. Tu évalues : réponse aux questions, pertinence, développement simple, vocabulaire/grammaire observables.

# Contexte
- Niveau : A2
- Tâche : discussion guidée par questions ouvertes. Le/la candidat(e) doit décrire une préférence/habitude, un événement/expérience, ou un processus du quotidien.
- Attendu A2 : échange possible même avec aide ; détails parfois flous, mais message compréhensible.

# Données
- Questions posées (liste dans l’ordre) :
{activitiesTexts}
- Transcription :
{transcriptions}

# Barème (TOTAL = 6)
A) Maîtrise de la tâche (0 à 3)
- 0 : ne répond pas réellement / hors sujet
- 1 : réponses très courtes, peu d’infos, ne suit pas la plupart des questions
- 2 : répond à la majorité des questions, mais réponses très simples, parfois incomplètes ou floues
- 3 : répond simplement avec parfois : exemple simple, chronologie/raison simple, détail pertinent

B) Qualité de la langue (0 à 3) – via le texte
- niveau A0 : 0 point
- niveau A1 : 1 points
- niveau A1+ : 2 points
- niveau A2 : 3 points

Important: N'hésite pas à mettre la note maximal si le niveau A2 est atteint, même si ce n'est pas parfait. Reste bienveillant dans ton évaluation.
Tu ne dois pas être sévère et ne pas oublier que cette épreuve se passe à l'oral avec un niveau A2. Si tu hésites entre deux notes, choisis la note supérieure. 

# Règles transcription
- Ne pas juger la fluidité orale (débit). Utiliser seulement indices textuels.

# Feedback: Rédige un feedback en français, 200 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- ne commente pas les fautes d'orthographe dûes à la transcription ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée.
- tu te concentres sur la grammaire, les éléments de liaison, le vocabulaire, la structure de la description, et le respect de la consigne.
Retourne uniquement un court paragraphe.

# Sortie JSON stricte, sans aucun commentaire ni explication supplémentaire, uniquement ce format :
{
  "scores": number, // total points (0-6)
  "feedback": text // le feedback
}
`;

const DESCRIPTION_A1_T1_PROMPT_TEMPLATE = `
Tu es évaluateur pour un examen blanc FIDE – partie « Parler ». Tu ne disposes QUE de la TRANSCRIPTION écrite de la production du candidat. Tu ne dois donc PAS juger la prononciation, l’intonation ou la vitesse. Tu évalues uniquement ce qui est observable dans le texte.

# Contexte de l’épreuve
- Niveau évalué : A1
- Tâche : décrire/nommer ce qui se passe sur une série de 4 images (déroulement d’une action).
- Objectif A1 attendu : mots/expressions simples pour nommer lieux, personnes, actions. On attend surtout une identification suffisante de la situation et des éléments essentiels (même si très simple).

# Données à mettre en lien entre mêmes numéros:
{activityBundles}

# Barème à appliquer (TOTAL = 4 points)
Tu donnes 2 sous-notes et une note finale.

A) Maîtrise de la tâche (0 à 2)
- 0 : hors sujet / ne permet pas de deviner la situation / informations essentielles absentes
- 1 : partiel : quelques éléments (personnes/lieu/actions) mais très incomplet
- 2 : suffisant : situation globalement identifiable + actions/éléments essentiels mentionnés

B) Qualité de la langue (0 à 2) – UNIQUEMENT via le texte
Évalue : adéquation lexicale de base, lisibilité, erreurs grammaticales qui empêchent la compréhension.
- 0 : texte très difficile à comprendre / mots isolés sans liens / erreurs bloquantes fréquentes
- 1 : compréhensible avec effort / phrases très simples avec des erreurs fréquentes
- 2 : globalement compréhensible / lexique simple adapté / erreurs non bloquantes

Important: N'hésite pas à mettre la note maximal si le niveau A1 est atteint, même si ce n'est pas parfait. Reste bienveillant dans ton évaluation.
Tu ne dois pas être sévère et ne pas oublier que cette épreuve se passe à l'oral avec un niveau A1. Si tu hésites entre deux notes, choisis la note supérieure. 

# Règles importantes (spécial transcription)
- Ne pénalise pas des “pauses” invisibles. Ne juge pas la fluidité orale.
- Tu peux utiliser comme indices textuels : phrases inachevées, “euh”, répétitions, segments illisibles.
- Si la transcription semble imparfaite (mots manquants), sois tolérant(e) et juge la compréhension globale.

# Feedback: Rédige un feedback en français, 200 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- ne commente pas les fautes d'orthographe dûes à la transcription ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée et le niveau attendu A1.
- tu te concentres sur la grammaire, les éléments de liaison, le vocabulaire, la structure de la description, et le respect de la consigne.
Retourne uniquement un court paragraphe.

# Sortie JSON stricte, sans aucun commentaire ni explication supplémentaire, uniquement ce format :
{
  "scores": number, // total points (0-4)
  "feedback": text // le feedback
}
}`;

const INTERACTION_A1_T2_PROMPT_TEMPLATE = `
Tu es évaluateur/trice pour un examen blanc FIDE – partie « Parler ». Tu ne disposes QUE de la TRANSCRIPTION écrite (pas d’audio). Tu ne juges pas la prononciation/intonation. Tu évalues uniquement ce qui est observable.

# Contexte de l’épreuve
- Niveau : A1
- Tâche : interaction simple à partir d’images.
- Attendu A1 : réponses courtes, souvent stéréotypées.

# Données fournies
- Situation: {situation}
- Interactions (demande, réponses possibles et transcription regroupées par numéro) :
{activityBundles}

# Barème (TOTAL = 4)
A) Maîtrise de la tâche (0 à 2)
- 0 : réponses non pertinentes / ne répond pas aux sollicitations / interaction impossible
- 1 : répond partiellement (oui/non, mots isolés), pertinence variable
- 2 : réponses globalement pertinentes : saluer, répondre, demander/clarifier simplement

B) Qualité de la langue (0 à 2) – via le texte
- 0 : incompréhensible / erreurs bloquantes
- 1 : compréhensible avec effort, lexique très limité
- 2 : compréhensible, formules simples appropriées

Important: N'hésite pas à mettre la note maximal si le niveau A1 est atteint, même si ce n'est pas parfait. Reste bienveillant dans ton évaluation.
Tu ne dois pas être sévère et ne pas oublier que cette épreuve se passe à l'oral avec un niveau A1. Si tu hésites entre deux notes, choisis la note supérieure. 

# Règles transcription
- Pas d’évaluation de fluidité orale : seulement clarté textuelle.

# Feedback: Rédige un feedback en français, 200 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- ne commente pas les fautes d'orthographe dûes à la transcription ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée et le niveau attendu A1.
- tu te concentres sur la grammaire, les éléments de liaison, le vocabulaire, la structure de la description, et le respect de la consigne.
Retourne uniquement un court paragraphe.

# Sortie JSON stricte, sans aucun commentaire ni explication supplémentaire, uniquement ce format :
{
  "scores": number, // total points (0-4)
  "feedback": text // le feedback
}
}`;

const DISCUSSION_B1_PROMPT_TEMPLATE = `
Tu es évaluateur/trice pour un examen blanc FIDE – partie « Parler ». Tu n’as QUE la transcription écrite (pas d’audio). Tu n’évalues pas la prononciation/intonation. Tu évalues : contenu, structuration, justification/opinion, cohérence, vocabulaire/grammaire observables.

# Contexte
- Niveau : B1
- Tâche : discussion sur un sujet (2 sujets au choix). Le/la candidat(e) doit raconter, expliquer, comparer, exprimer une opinion, donner avantages/inconvénients, ou prendre position sur une situation hypothétique et justifier.
- L’épreuve est découpée (dans l’app) en 4 questions, chacune notée /6.

# Données
- Question posée (liste dans l’ordre) :
{activitiesTexts}
- Transcription :
{transcriptions}

# Barème de la question (TOTAL = 6 = 3 + 3)
A) Maîtrise de la tâche (0 à 3)
- 0 : ne répond pas / hors sujet
- 1 : répond partiellement, peu développé, logique faible
- 2 : réponse structurée, quelques détails, opinion/explication présente, mais parfois floue ou incomplète
- 3 : réponse claire et cohérente + détails/exemples + justification + liens simples (éventuellement cause/conséquence, comparaison)

B) Qualité de la langue (0 à 3) – via le texte
- 0 : erreurs bloquantes, difficile à suivre
- 1 : compréhensible mais erreurs/hésitations textuelles nombreuses, lexique trop limité pour du B1
- 2 : globalement correct ; connecteurs simples ; lexique adapté
- 3 : assez précis ; bonne cohérence textuelle ; erreurs non bloquantes ; niveau B1 observable

# Règles transcription
- Ne pas juger débit/intonation. Utiliser seulement indices textuels.
- Si un segment est très court, ne “remplis” pas avec des suppositions : évalue ce qui est écrit.
- Si la transcription est bruitée, sois tolérant(e) mais garde l’exigence B1 sur structure + justification.

# Feedback: Rédige un feedback en français, 100 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- ne commente pas les fautes d'orthographe dûes à la transcription ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée et le niveau attendu B1.
- tu te concentres sur la grammaire, les éléments de liaison, le vocabulaire, la structure de la description, et le respect de la consigne.
Retourne uniquement un court paragraphe.

# Sortie JSON stricte, sans aucun commentaire ni explication supplémentaire, uniquement ce format :
{
  "scores": number, // total points (0-6)
  "feedback": text // le feedback
}
}`;

const PROMPT_TEMPLATES: Record<SpeakingCorrectionTaskType, string> = {
    IMAGE_DESCRIPTION_A2: IMAGE_DESCRIPTION_A2_PROMPT_TEMPLATE,
    PHONE_CONVERSATION_A2: PHONE_CONVERSATION_A2_PROMPT_TEMPLATE,
    DISCUSSION_A2: DISCUSSION_A2_PROMPT_TEMPLATE,
    IMAGE_DESCRIPTION_A1_T1: DESCRIPTION_A1_T1_PROMPT_TEMPLATE,
    IMAGE_DESCRIPTION_A1_T2: INTERACTION_A1_T2_PROMPT_TEMPLATE,
    DISCUSSION_B1: DISCUSSION_B1_PROMPT_TEMPLATE,
};

const cleanText = (value: string) => value.replace(/\r\n/g, "\n").trim();

const asStringArray = (value: PromptPartInput) => (Array.isArray(value) ? value.map((item) => cleanText(String(item || ""))) : null);

const buildNumberedList = (items: string[], emptyLine = "(vide)") => {
    if (!items.length) return "Aucune donnée.";
    return items.map((item, index) => `${index + 1}. ${item || emptyLine}`).join("\n");
};

const buildRawOrNumberedBlock = (value: PromptPartInput) => {
    const asArray = asStringArray(value);
    if (asArray) {
        return buildNumberedList(asArray);
    }
    const text = cleanText(String(value || ""));
    return text || "Aucune donnée.";
};

const buildAlignedBlocks = (activitiesTexts: PromptPartInput, aiCorrectionContext: PromptPartInput, transcriptions: PromptPartInput) => {
    const activitiesList = asStringArray(activitiesTexts);
    const contextList = asStringArray(aiCorrectionContext);
    const transcriptionsList = asStringArray(transcriptions);

    const allArrays = activitiesList && contextList && transcriptionsList;
    if (!allArrays) {
        return {
            activitiesTexts: buildRawOrNumberedBlock(activitiesTexts),
            aiCorrectionContext: buildRawOrNumberedBlock(aiCorrectionContext),
            transcriptions: buildRawOrNumberedBlock(transcriptions),
        };
    }

    const maxLength = Math.max(activitiesList.length, contextList.length, transcriptionsList.length);
    const normalizeByIndex = (list: string[]) => Array.from({ length: maxLength }, (_, index) => list[index] || "");

    return {
        activitiesTexts: buildNumberedList(normalizeByIndex(activitiesList)),
        aiCorrectionContext: buildNumberedList(normalizeByIndex(contextList)),
        transcriptions: buildNumberedList(normalizeByIndex(transcriptionsList)),
    };
};

const buildGroupedActivityBlock = ({
    activities,
    contexts,
    transcriptions,
    groupLabel,
    activityLabel,
    contextLabel,
    transcriptionLabel,
}: {
    activities: string[];
    contexts: string[];
    transcriptions: string[];
    groupLabel: string;
    activityLabel: string;
    contextLabel: string;
    transcriptionLabel: string;
}) => {
    const maxLength = Math.max(activities.length, contexts.length, transcriptions.length);
    if (!maxLength) return "Aucune donnée.";

    return Array.from({ length: maxLength }, (_, index) => {
        const rank = index + 1;
        return [
            `${groupLabel} ${rank}:`,
            `- ${activityLabel}: ${activities[index] || "(vide)"}`,
            `- ${contextLabel}: ${contexts[index] || "(vide)"}`,
            `- ${transcriptionLabel}: ${transcriptions[index] || "(vide)"}`,
        ].join("\n");
    }).join("\n\n");
};

const replacePromptToken = (template: string, token: string, value: string) => template.split(`{${token}}`).join(value);

const buildA1T1ActivityBundles = (activitiesTexts: PromptPartInput, aiCorrectionContext: PromptPartInput, transcriptions: PromptPartInput) => {
    const activitiesList = asStringArray(activitiesTexts);
    const contextList = asStringArray(aiCorrectionContext);
    const transcriptionsList = asStringArray(transcriptions);

    if (activitiesList && contextList && transcriptionsList) {
        return buildGroupedActivityBlock({
            activities: activitiesList,
            contexts: contextList,
            transcriptions: transcriptionsList,
            groupLabel: "Image",
            activityLabel: "Demande",
            contextLabel: "Réponses possibles (exemples)",
            transcriptionLabel: "Transcription candidat",
        });
    }

    return [
        "Demandes:",
        buildRawOrNumberedBlock(activitiesTexts),
        "",
        "Réponses possibles (exemples):",
        buildRawOrNumberedBlock(aiCorrectionContext),
        "",
        "Transcriptions:",
        buildRawOrNumberedBlock(transcriptions),
    ].join("\n");
};

const buildA1T2Tokens = (activitiesTexts: PromptPartInput, aiCorrectionContext: PromptPartInput, transcriptions: PromptPartInput) => {
    const activitiesList = asStringArray(activitiesTexts);
    const contextList = asStringArray(aiCorrectionContext) || [];
    const transcriptionsList = asStringArray(transcriptions) || [];

    if (!activitiesList) {
        return {
            situation: "Aucune donnée.",
            activityBundles: [
                "Demandes:",
                buildRawOrNumberedBlock(activitiesTexts),
                "",
                "Réponses possibles (exemples):",
                buildRawOrNumberedBlock(aiCorrectionContext),
                "",
                "Transcriptions:",
                buildRawOrNumberedBlock(transcriptions),
            ].join("\n"),
        };
    }

    const situation = activitiesList[0] || "Aucune donnée.";
    const promptItems = activitiesList.slice(1);

    const contextItems = contextList.length === activitiesList.length ? contextList.slice(1) : contextList;
    const transcriptionItems = transcriptionsList.length === activitiesList.length ? transcriptionsList.slice(1) : transcriptionsList;

    return {
        situation,
        activityBundles: buildGroupedActivityBlock({
            activities: promptItems,
            contexts: contextItems,
            transcriptions: transcriptionItems,
            groupLabel: "Interaction",
            activityLabel: "Demande",
            contextLabel: "Réponses possibles (exemples)",
            transcriptionLabel: "Transcription candidat",
        }),
    };
};

export const buildSpeakingA2CorrectionPrompt = ({ taskType, activitiesTexts, aiCorrectionContext, transcriptions }: BuildSpeakingCorrectionPromptParams) => {
    const template = PROMPT_TEMPLATES[taskType];
    const blocks = buildAlignedBlocks(activitiesTexts, aiCorrectionContext, transcriptions);
    const baseActivityBundles = ["Demandes:", blocks.activitiesTexts, "", "Réponses possibles (exemples):", blocks.aiCorrectionContext, "", "Transcriptions:", blocks.transcriptions].join("\n");

    const tokenValues = {
        activitiesTexts: blocks.activitiesTexts,
        aiCorrectionContext: blocks.aiCorrectionContext,
        transcriptions: blocks.transcriptions,
        situation: "Aucune donnée.",
        activityBundles: baseActivityBundles,
    };

    if (taskType === "IMAGE_DESCRIPTION_A1_T1") {
        tokenValues.activityBundles = buildA1T1ActivityBundles(activitiesTexts, aiCorrectionContext, transcriptions);
    }

    if (taskType === "IMAGE_DESCRIPTION_A1_T2") {
        const a1t2 = buildA1T2Tokens(activitiesTexts, aiCorrectionContext, transcriptions);
        tokenValues.situation = a1t2.situation;
        tokenValues.activityBundles = a1t2.activityBundles;
    }

    return Object.entries(tokenValues)
        .reduce((acc, [token, value]) => replacePromptToken(acc, token, value), template)
        .trim();
};

export const buildDiscussionB1PerQuestionPrompt = ({ question, transcription }: { question: string; transcription: string }) =>
    buildSpeakingA2CorrectionPrompt({
        taskType: "DISCUSSION_B1",
        activitiesTexts: [question],
        aiCorrectionContext: [],
        transcriptions: [transcription],
    });

export type ReadWriteCorrectionQuestionType = "single_choice" | "numbered_fill" | "text_extract" | "long_text";

/**
 * Tokens attendus (communs) pour Lire/Ecrire:
 * {examLabel}
 * {moduleNumber}
 * {moduleTitle}
 * {activityNumber}
 * {activityTitle}
 * {questionNumber}
 * {questionType}
 * {activityPromptText}
 * {instructionText}
 * {instructionImageAlternativeText}
 * {questionText}
 * {questionContentText}
 * {imageAlternativeText}
 * {aiCorrectionContextActivity}
 * {aiCorrectionContextQuestion}
 * {studentAnswer}
 * {maxPoints}
 */
export const READ_WRITE_CORRECTION_GENERAL_PROMPT_TEMPLATE = `
Tu es évaluateur/trice d'un examen blanc FIDE - partie "Lire/Ecrire".
Tu corriges UNIQUEMENT à partir des informations fournies dans les tokens.
Tu dois rester strictement dans le contexte du module/question et ne rien inventer.

# Contexte examen
- Epreuve: {examLabel}
- Module: {moduleNumber} - {moduleTitle}
- Tâche: {activityNumber} - {activityTitle}
- Question: {questionNumber}
- Type: {questionType}
- Points max pour cette question: {maxPoints}

# Données pédagogiques
- Situation générale (activité): {activityPromptText}
- Consigne générale (question): {instructionText}
- Texte alternatif de la consigne: {instructionImageAlternativeText}
- Énoncé de la question: {questionText}
- Contenu additionnel (portable text): {questionContentText}
- Texte alternatif support: {imageAlternativeText}
- Contexte IA activité: {aiCorrectionContextActivity}
- Contexte IA question (peut contenir 1-2 exemples de réponse attendue méritant la note max): {aiCorrectionContextQuestion}

# Réponse candidat
{studentAnswer}

# Règles de correction
- Évalue uniquement la pertinence par rapport à la consigne et au type de question.
- N'invente pas d'informations absentes.
- Si la donnée est insuffisante pour conclure, indique-le dans le feedback.
- Le score doit être un entier entre 0 et {maxPoints}.
- Le feedback doit rester très court (max 35 mots), concret et actionnable.
- Sois juste et non sévère: si la réponse correspond globalement au niveau attendu, n'hésite pas à attribuer la meilleure note.
- N'enlève pas de points pour de petites erreurs isolées.
- L'orthographe compte peu: elle retire des points seulement si les erreurs gênent réellement la compréhension.
- Ne cherche pas la "petite faute" quand le fond est correct et pertinent.
- Si la réponse est très bonne, un feedback très bref est suffisant (ex: "Bravo, c'est très bien.").

# Sortie JSON stricte, sans texte additionnel:
{
  "score": number,
  "feedback": string
}
`;

/**
 * Tokens additionnels:
 * {answerOptionsWithCorrectness} // ex: "- Option A (isCorrect: false) ..."
 * {studentSelectedOption}
 * {expectedCorrectOption}
 */
export const READ_WRITE_SINGLE_CHOICE_CORRECTION_PROMPT_TEMPLATE = `
{READ_WRITE_CORRECTION_GENERAL_PROMPT_TEMPLATE}

# Spécifique type single_choice
- Réponse sélectionnée par le candidat:
{studentSelectedOption}
- Réponse correcte attendue:
{expectedCorrectOption}
- Options proposées (avec indicateur de validité):
{answerOptionsWithCorrectness}

Règles:
- Vérifie d'abord la correspondance entre la réponse sélectionnée et la réponse correcte attendue.
- Score attendu:
  - réponse correcte: {maxPoints}
  - réponse incorrecte ou vide: 0
- Feedback court et précis, sans ambiguïté.
`;

/**
 * Tokens additionnels:
 * {numberingExpected} // ex: "1,2,3,4"
 * {studentAnswerByNumber} // ex: "1: ...\n2: ..."
 */
export const READ_WRITE_NUMBERED_FILL_CORRECTION_PROMPT_TEMPLATE = `
{READ_WRITE_CORRECTION_GENERAL_PROMPT_TEMPLATE}

# Spécifique type numbered_fill
- Numéros attendus: {numberingExpected}
- Réponse candidat structurée par numéro:
{studentAnswerByNumber}

Règles:
- Corrige numéro par numéro (pertinence + exactitude de l'information attendue).
- Pondère équitablement chaque numéro.
- Le score final est la somme, bornée entre 0 et {maxPoints}.
- Feedback: mentionne clairement les numéros réussis et ceux à retravailler.
`;

/**
 * Tokens additionnels:
 * {sourceTextReference} // passage texte de référence, si disponible
 */
export const READ_WRITE_TEXT_EXTRACT_CORRECTION_PROMPT_TEMPLATE = `
{READ_WRITE_CORRECTION_GENERAL_PROMPT_TEMPLATE}

# Spécifique type text_extract
- Texte source de référence (si fourni):
{sourceTextReference}

Règles:
- Évalue si l'extrait copié/collé répond bien à la demande.
- Accepte de légères variations de ponctuation/casse.
- Si la réponse est partielle mais pertinente, attribue un score partiel.
- Si hors sujet: score très faible ou nul.
`;

/**
 * Tokens additionnels:
 * {evaluationAxes} // ex: "respect de la consigne; cohérence; clarté; correction grammaticale"
 */
export const READ_WRITE_LONG_TEXT_CORRECTION_PROMPT_TEMPLATE = `
{READ_WRITE_CORRECTION_GENERAL_PROMPT_TEMPLATE}

# Spécifique type long_text
- Axes d'évaluation:
{evaluationAxes}

Règles:
- Évalue le fond (respect de consigne + pertinence) et la forme (cohérence + langue).
- Favorise une correction utile: points forts + priorités d'amélioration.
- Évite les critiques superficielles.
- Score entier entre 0 et {maxPoints}, proportionné à la qualité globale.
`;

export const READ_WRITE_CORRECTION_PROMPT_TEMPLATES: Record<ReadWriteCorrectionQuestionType, string> = {
    single_choice: READ_WRITE_SINGLE_CHOICE_CORRECTION_PROMPT_TEMPLATE,
    numbered_fill: READ_WRITE_NUMBERED_FILL_CORRECTION_PROMPT_TEMPLATE,
    text_extract: READ_WRITE_TEXT_EXTRACT_CORRECTION_PROMPT_TEMPLATE,
    long_text: READ_WRITE_LONG_TEXT_CORRECTION_PROMPT_TEMPLATE,
};

type BuildReadWriteCorrectionPromptParams = {
    questionType: ReadWriteCorrectionQuestionType;
    examLabel: string;
    moduleNumber: string;
    moduleTitle: string;
    activityNumber: string;
    activityTitle: string;
    questionNumber: string;
    activityPromptText: string;
    instructionText: string;
    instructionImageAlternativeText: string;
    questionText: string;
    questionContentText: string;
    imageAlternativeText: string;
    aiCorrectionContextActivity: string;
    aiCorrectionContextQuestion: string;
    studentAnswer: string;
    maxPoints: string;
    answerOptionsWithCorrectness?: string;
    studentSelectedOption?: string;
    expectedCorrectOption?: string;
    numberingExpected?: string;
    studentAnswerByNumber?: string;
    sourceTextReference?: string;
    evaluationAxes?: string;
};

const sanitizePromptToken = (value: unknown) => {
    const text = cleanText(String(value ?? ""));
    return text || "Aucune donnée.";
};

const applyPromptTokens = (template: string, tokens: Record<string, string>) => {
    return Object.entries(tokens).reduce((acc, [token, value]) => replacePromptToken(acc, token, sanitizePromptToken(value)), template);
};

export const buildReadWriteCorrectionPrompt = ({
    questionType,
    examLabel,
    moduleNumber,
    moduleTitle,
    activityNumber,
    activityTitle,
    questionNumber,
    activityPromptText,
    instructionText,
    instructionImageAlternativeText,
    questionText,
    questionContentText,
    imageAlternativeText,
    aiCorrectionContextActivity,
    aiCorrectionContextQuestion,
    studentAnswer,
    maxPoints,
    answerOptionsWithCorrectness,
    studentSelectedOption,
    expectedCorrectOption,
    numberingExpected,
    studentAnswerByNumber,
    sourceTextReference,
    evaluationAxes,
}: BuildReadWriteCorrectionPromptParams) => {
    const specificTemplate = READ_WRITE_CORRECTION_PROMPT_TEMPLATES[questionType] || READ_WRITE_CORRECTION_GENERAL_PROMPT_TEMPLATE;
    const templateWithGeneral = replacePromptToken(specificTemplate, "READ_WRITE_CORRECTION_GENERAL_PROMPT_TEMPLATE", READ_WRITE_CORRECTION_GENERAL_PROMPT_TEMPLATE.trim());

    const tokens: Record<string, string> = {
        examLabel,
        moduleNumber,
        moduleTitle,
        activityNumber,
        activityTitle,
        questionNumber,
        questionType,
        activityPromptText,
        instructionText,
        instructionImageAlternativeText,
        questionText,
        questionContentText,
        imageAlternativeText,
        aiCorrectionContextActivity,
        aiCorrectionContextQuestion,
        studentAnswer,
        maxPoints,
        answerOptionsWithCorrectness: answerOptionsWithCorrectness || "Aucune donnée.",
        studentSelectedOption: studentSelectedOption || studentAnswer || "Aucune donnée.",
        expectedCorrectOption: expectedCorrectOption || "Aucune donnée.",
        numberingExpected: numberingExpected || "Aucune donnée.",
        studentAnswerByNumber: studentAnswerByNumber || studentAnswer || "Aucune donnée.",
        sourceTextReference: sourceTextReference || "Aucune donnée.",
        evaluationAxes:
            evaluationAxes ||
            "respect de la consigne; pertinence du contenu; cohérence et structure; clarté des formulations; correction grammaticale et lexicale.",
    };

    return applyPromptTokens(templateWithGeneral, tokens).trim();
};

export type ReadWriteSingleChoiceActivityQuestionPromptInput = {
    questionKey: string;
    questionNumber: string;
    questionText: string;
    studentSelectedOption: string;
    expectedCorrectOption: string;
    answerOptionsWithCorrectness: string;
    aiCorrectionContextQuestion?: string;
    maxPoints: string;
};

type BuildReadWriteSingleChoiceActivityPromptParams = {
    examLabel: string;
    moduleNumber: string;
    moduleTitle: string;
    activityNumber: string;
    activityTitle: string;
    activityPromptText: string;
    instructionText: string;
    instructionImageAlternativeText: string;
    aiCorrectionContextActivity: string;
    questions: ReadWriteSingleChoiceActivityQuestionPromptInput[];
};

export const buildReadWriteSingleChoiceActivityPrompt = ({
    examLabel,
    moduleNumber,
    moduleTitle,
    activityNumber,
    activityTitle,
    activityPromptText,
    instructionText,
    instructionImageAlternativeText,
    aiCorrectionContextActivity,
    questions,
}: BuildReadWriteSingleChoiceActivityPromptParams) => {
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const questionsBlock = safeQuestions.length
        ? safeQuestions
              .map((question, index) => {
                  const rank = index + 1;
                  const questionLabel = sanitizePromptToken(question.questionText);
                  const selected = sanitizePromptToken(question.studentSelectedOption);
                  const expected = sanitizePromptToken(question.expectedCorrectOption);
                  const options = sanitizePromptToken(question.answerOptionsWithCorrectness);
                  const context = sanitizePromptToken(question.aiCorrectionContextQuestion || "");
                  const maxPoints = sanitizePromptToken(question.maxPoints);
                  return [
                      `Question ${rank}:`,
                      `- questionKey: ${sanitizePromptToken(question.questionKey)}`,
                      `- questionNumber: ${sanitizePromptToken(question.questionNumber)}`,
                      `- questionText: ${questionLabel}`,
                      `- maxPoints: ${maxPoints}`,
                      `- réponse candidat: ${selected}`,
                      `- réponse correcte attendue: ${expected}`,
                      `- options (avec isCorrect):`,
                      options,
                      `- contexte correction IA question: ${context}`,
                  ].join("\n");
              })
              .join("\n\n")
        : "Aucune question exploitable.";

    return `
Tu es évaluateur/trice d'un examen blanc FIDE - partie "Lire/Ecrire".
Tu corriges UNE ACTIVITÉ complète contenant uniquement des questions de type "single_choice".

# Contexte activité
- Epreuve: ${sanitizePromptToken(examLabel)}
- Module: ${sanitizePromptToken(moduleNumber)} - ${sanitizePromptToken(moduleTitle)}
- Tâche: ${sanitizePromptToken(activityNumber)} - ${sanitizePromptToken(activityTitle)}
- Situation activité: ${sanitizePromptToken(activityPromptText)}
- Consigne générale: ${sanitizePromptToken(instructionText)}
- Texte alternatif consigne: ${sanitizePromptToken(instructionImageAlternativeText)}
- Contexte correction IA activité: ${sanitizePromptToken(aiCorrectionContextActivity)}

# Questions à corriger
${questionsBlock}

# Règles de correction
- Corrige chaque question indépendamment.
- Pour chaque question:
  - si la réponse candidat correspond à la réponse correcte attendue: score = maxPoints;
  - sinon score = 0.
- Le feedback par question doit être très court (max 20 mots), concret, et sans blabla.
- Sois bienveillant et clair.

# Sortie JSON stricte, sans texte additionnel:
{
  "results": [
    {
      "questionKey": string,
      "questionNumber": string,
      "score": number,
      "feedback": string
    }
  ]
}
`.trim();
};

export type ReadWriteTextExtractActivityQuestionPromptInput = {
    questionKey: string;
    questionNumber: string;
    questionText: string;
    studentAnswer: string;
    sourceTextReference: string;
    aiCorrectionContextQuestion?: string;
    maxPoints: string;
};

type BuildReadWriteTextExtractActivityPromptParams = {
    examLabel: string;
    moduleNumber: string;
    moduleTitle: string;
    activityNumber: string;
    activityTitle: string;
    activityPromptText: string;
    instructionText: string;
    instructionImageAlternativeText: string;
    aiCorrectionContextActivity: string;
    questions: ReadWriteTextExtractActivityQuestionPromptInput[];
};

export const buildReadWriteTextExtractActivityPrompt = ({
    examLabel,
    moduleNumber,
    moduleTitle,
    activityNumber,
    activityTitle,
    activityPromptText,
    instructionText,
    instructionImageAlternativeText,
    aiCorrectionContextActivity,
    questions,
}: BuildReadWriteTextExtractActivityPromptParams) => {
    const safeQuestions = Array.isArray(questions) ? questions : [];
    const questionsBlock = safeQuestions.length
        ? safeQuestions
              .map((question, index) => {
                  const rank = index + 1;
                  return [
                      `Question ${rank}:`,
                      `- questionKey: ${sanitizePromptToken(question.questionKey)}`,
                      `- questionNumber: ${sanitizePromptToken(question.questionNumber)}`,
                      `- questionText: ${sanitizePromptToken(question.questionText)}`,
                      `- maxPoints: ${sanitizePromptToken(question.maxPoints)}`,
                      `- réponse candidat: ${sanitizePromptToken(question.studentAnswer)}`,
                      `- texte source de référence: ${sanitizePromptToken(question.sourceTextReference)}`,
                      `- contexte correction IA question: ${sanitizePromptToken(question.aiCorrectionContextQuestion || "")}`,
                  ].join("\n");
              })
              .join("\n\n")
        : "Aucune question exploitable.";

    return `
Tu es évaluateur/trice d'un examen blanc FIDE - partie "Lire/Ecrire".
Tu corriges UNE ACTIVITÉ complète contenant uniquement des questions de type "text_extract".

# Contexte activité
- Epreuve: ${sanitizePromptToken(examLabel)}
- Module: ${sanitizePromptToken(moduleNumber)} - ${sanitizePromptToken(moduleTitle)}
- Tâche: ${sanitizePromptToken(activityNumber)} - ${sanitizePromptToken(activityTitle)}
- Situation activité: ${sanitizePromptToken(activityPromptText)}
- Consigne générale: ${sanitizePromptToken(instructionText)}
- Texte alternatif consigne: ${sanitizePromptToken(instructionImageAlternativeText)}
- Contexte correction IA activité: ${sanitizePromptToken(aiCorrectionContextActivity)}

# Questions à corriger
${questionsBlock}

# Règles de correction
- Corrige chaque question indépendamment.
- Évalue la pertinence de l'extrait fourni par rapport à la demande.
- Accepte de légères variations de ponctuation/casse.
- Si la réponse est partielle mais pertinente: score partiel possible.
- Si hors sujet: score faible ou nul.
- Le score doit être un entier entre 0 et maxPoints de la question.
- Le feedback par question doit être court (max 20 mots), concret et utile.

# Sortie JSON stricte, sans texte additionnel:
{
  "results": [
    {
      "questionKey": string,
      "questionNumber": string,
      "score": number,
      "feedback": string
    }
  ]
}
`.trim();
};
