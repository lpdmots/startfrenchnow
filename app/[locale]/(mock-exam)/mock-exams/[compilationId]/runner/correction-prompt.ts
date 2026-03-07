import type { TaskType } from "@/app/types/fide/mock-exam";

export type SpeakingA2CorrectionTaskType = Extract<TaskType, "IMAGE_DESCRIPTION_A2" | "PHONE_CONVERSATION_A2" | "DISCUSSION_A2">;

type PromptPartInput = string | string[] | null | undefined;

type BuildSpeakingA2CorrectionPromptParams = {
    taskType: SpeakingA2CorrectionTaskType;
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

# Description de l'image en un exemple de ce qui peut être attendu :
{aiCorrectionContext}

# Transcription candidat:
{transcriptions}

# Barème (TOTAL = 6)
A) Maîtrise de la tâche (0 à 3)
- 0 : hors sujet / ne décrit pas l’image / manque l’essentiel
- 1 : description partielle (personnes OU actions), contexte flou
- 2 : description compréhensible (personnes + actions + lieu) avec enchaînement simple
- 3 : description complète et claire + quelques détails + liens simples (d’abord/ensuite/parce que…)

B) Qualité de la langue (0 à 3) – via le texte
Évaluer globalement : vocabulaire de base pertinent, structures simples, erreurs (bloquantes ou non), cohésion minimale.
- 0 : compréhension difficile / erreurs bloquantes fréquentes / lexique inadéquat
- 1 : compréhensible mais erreurs très fréquentes + phrases limitées
- 2 : globalement correct avec erreurs non bloquantes ; lexique A2 suffisant
- 3 : plutôt précis, connecteurs simples, accord/temps majoritairement maîtrisés

# Règles transcription
- Ne pas juger la fluidité orale. Utiliser uniquement indices textuels (phrases cassées, incohérences, “euh”).
- Tolérance si transcription imparfaite.

# Feedback: Rédige un feedback en français, 200 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée.
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
- Exemple de conversation modèle (adaptée à la situation, avec les éléments attendus) :
{aiCorrectionContext}
- Transcription (incluant les tours examinateur à ne pas prendre en compte dans l'évaluation) :
{transcriptions}

# Barème (TOTAL = 6)
A) Maîtrise de la tâche (0 à 3)
- 0 : ne réalise pas l’action (prendre/reporter/annuler) ou demande incompréhensible
- 1 : action tentée mais informations essentielles manquantes (motif absent, pas de proposition, pas de confirmation)
- 2 : action réussie : demande claire + motif + au moins une info pratique (date/heure/alternative) + politesse basique
- 3 : interaction complète : saluer, formuler la demande, proposer/valider, confirmer, remercier/prendre congé

B) Qualité de la langue (0 à 3) – via le texte
- 0 : erreurs bloquantes / phrases trop fragmentées / registre inadapté
- 1 : compréhensible mais erreurs fréquentes ; formules limitées
- 2 : structures simples correctes ; politesse adéquate ; lexique de base OK
- 3 : clair et cohérent ; connecteurs simples ; bonne adéquation sociolinguistique

# Règles transcription
- Si les tours de l’examinateur manquent, juge surtout la complétude du “script” du candidat (salutation, demande, infos, motif, clôture).
- Ne pas juger la fluidité orale : seulement lisibilité textuelle.

# Feedback: Rédige un feedback en français, 200 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée.
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
- 2 : répond à la majorité des questions avec infos pertinentes + quelques détails
- 3 : répond de manière structurée : exemples simples, chronologie/raison simple, enchaînement clair

B) Qualité de la langue (0 à 3) – via le texte
- 0 : compréhension difficile / erreurs bloquantes
- 1 : compréhensible avec effort, lexique limité, erreurs fréquentes
- 2 : globalement correct en phrases simples ; erreurs non bloquantes
- 3 : lexique plus précis + connecteurs simples + bonne cohérence textuelle

# Règles transcription
- Ne pas juger la fluidité orale (débit). Utiliser seulement indices textuels.

# Feedback: Rédige un feedback en français, 200 mots maximum, utile et bienveillant.
Consignes :
- appuie-toi uniquement sur la transcription écrite ;
- ne commente pas la prononciation, l’accent, l’intonation ou le débit ;
- dis ce qui est réussi ;
- indique seulement les points à améliorer vraiment pertinents ;
- reste concret, direct et sans blabla ;
- si un point n’apporte rien, n’en parle pas ;
- reste cohérent avec la note donnée.
Retourne uniquement un court paragraphe.

# Sortie JSON stricte, sans aucun commentaire ni explication supplémentaire, uniquement ce format :
{
  "scores": number, // total points (0-6)
  "feedback": text // le feedback
}
`;

const PROMPT_TEMPLATES: Record<SpeakingA2CorrectionTaskType, string> = {
    IMAGE_DESCRIPTION_A2: IMAGE_DESCRIPTION_A2_PROMPT_TEMPLATE,
    PHONE_CONVERSATION_A2: PHONE_CONVERSATION_A2_PROMPT_TEMPLATE,
    DISCUSSION_A2: DISCUSSION_A2_PROMPT_TEMPLATE,
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

export const buildSpeakingA2CorrectionPrompt = ({ taskType, activitiesTexts, aiCorrectionContext, transcriptions }: BuildSpeakingA2CorrectionPromptParams) => {
    const template = PROMPT_TEMPLATES[taskType];
    const blocks = buildAlignedBlocks(activitiesTexts, aiCorrectionContext, transcriptions);

    return template
        .replace("{activitiesTexts}", blocks.activitiesTexts)
        .replace("{aiCorrectionContext}", blocks.aiCorrectionContext)
        .replace("{transcriptions}", blocks.transcriptions)
        .trim();
};
