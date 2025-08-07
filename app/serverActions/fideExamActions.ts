"use server";
import { SanityServerClient as client } from "../lib/sanity.clientServerDev";
import { groq } from "next-sanity";
import { Log, UserProps } from "../types/sfn/auth";
import { v4 as uuidv4 } from "uuid";
import { OpenAI } from "openai";
import { extractJsonSafe } from "../lib/utils";
import { ResponseB1 } from "../types/fide/exam";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const queryFideExamProgress = groq`
  *[_type == "user" && _id == $userId][0] {
    learningProgress[ type == $type ]
  }
`;

export const getFideExamProgress = async (userId: string, type: string) => {
    return (await client.fetch(queryFideExamProgress, { userId, type })) as UserProps | null;
};

export const updateUserProgress = async (progressType: string, examId: string, newScore: number, userId?: string) => {
    const query = groq`
      *[_type == "user" && _id == $userId][0] {
        learningProgress[ type == $progressType ]
      }
    `;

    const user: UserProps | null = await client.fetch(query, { userId, progressType });
    const logs = user?.learningProgress?.[0]?.logs as Log[] | undefined;
    console.log("userProgress", user);
    if (logs) {
        // Si le log pour l'examen existe déjà il faut l'update, sinon il faut le créer
        const existingLogIndex = logs?.findIndex((log) => log.exam._ref === examId);
        if (existingLogIndex !== -1) {
            // Mettre à jour le score existant
            logs[existingLogIndex].score = newScore;
            logs[existingLogIndex].date = new Date().toISOString();
        } else {
            // Ajouter un nouveau log
            logs.push({
                _key: uuidv4(),
                exam: { _type: "reference", _ref: examId },
                score: newScore,
                date: new Date().toISOString(),
            });
        }
        // Mettre à jour la progression de l'utilisateur
        await client
            .patch(userId || "")
            .unset([`learningProgress[type == "${progressType}"]`]) // supprimer l'existante
            .insert("after", "learningProgress[-1]", [
                // en réinsérant une nouvelle
                {
                    _key: uuidv4(),
                    type: progressType,
                    logs,
                },
            ])
            .commit();
        return logs;
    } else {
        const newLog = {
            _key: uuidv4(),
            exam: { _type: "reference", _ref: examId },
            score: newScore,
            date: new Date().toISOString(),
        };
        const logs: Log[] = [newLog];
        // Créer une nouvelle progression de l'utilisateur
        await client
            .patch(userId || "")
            .setIfMissing({ learningProgress: [] }) // Assurez-vous que le tableau learningProgress existe
            .insert("after", "learningProgress[-1]", [
                {
                    _key: uuidv4(),
                    type: progressType,
                    logs,
                },
            ])
            .commit();
        return logs;
    }
};

type EvaluationResult = {
    score: 0 | 0.5 | 1;
    feedback?: string;
};

export async function evaluateB1Answer({
    audioText,
    answerText,
    responseB1,
    question,
}: {
    audioText: string;
    answerText: string;
    responseB1: ResponseB1;
    question: string;
}): Promise<EvaluationResult | { error: string }> {
    if (!audioText || !answerText || !responseB1 || !question) {
        return { error: "Paramètres manquants" };
    }
    console.log(responseB1);
    const prompt = `
        Tu es examinateur FIDE pour l'examen B1 (compréhension orale).

        Texte audio :
        """
        ${audioText}
        """

        La question : :
        """
        ${question}
        """

        Réponse de l’étudiant :
        """
        ${answerText}
        """

        Donne une évaluation au format JSON brut :

        {
        "score": 0 | 0.5 | 1,
        "feedback": string | undefined 
        }

        La réponse de l'étudiant est une transcription de l'oral, donc il peut y avoir des incohérences. À toi de les déceler et les prendre en compte intelligemment dans l'évaluation. Le score et le feedback ignorent les fautes de grammaire ou d'orthographe (surtout les noms propres !) contenues dans la réponse.

        Score: 
        - 1 pour une réponse juste similaire à "${responseB1.modelAnswer}". Où encore si ${responseB1.correctIf}. 
        - 0.5 pour une réponse approximative si ${responseB1.partialIf}.
        - 0 pour une réponse fausse : ${responseB1.incorrectIf}.

        feedback: max 20 mots. Aucune remarque générale. Il s'adresse directement à l'étudiant avec vous.
        - si score est 1, de courtes et simples félicitations.
        - si score est 0.5, donne un feedback court expliquant pourquoi c'est approximatif.
        - si score est 0, donne un feedback court expliquant pourquoi c'est faux.

    `;

    try {
        const res = await openai.chat.completions.create({
            model: "gpt-4.1-mini", //gpt-4.1-nano
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
        });

        const content = res.choices[0].message?.content;

        if (!content) return { error: "Réponse vide du modèle" };
        const parsed = extractJsonSafe(content);
        return parsed;
    } catch (err: any) {
        console.error("Erreur GPT ou parsing :", err);
        return { error: "Erreur GPT ou parsing JSON" };
    }
}
