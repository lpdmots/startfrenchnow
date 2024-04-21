import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerProd";
import { v4 as uuidv4 } from "uuid";

// Fonctio
export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== process.env.NEXTAUTH_SECRET) {
        return new NextResponse(JSON.stringify({ message: "Bad request" }), { status: 400 });
    }

    try {
        let { questions, exerciseId } = await request.json();

        // Validation des données reçues
        if (!exerciseId || !questions || !Array.isArray(questions) || questions.length === 0) {
            return new NextResponse(JSON.stringify({ message: "exerciseId et questions sont requis et doivent être valides" }), { status: 400 });
        }

        // Ajout de _key aux réponses dans chaque question
        questions = questions.map((question) => ({
            ...question,
            responses: question.responses.map((response: any) => ({
                ...response,
                _key: uuidv4(),
            })),
        }));

        // Recherche de l'exercice dans Sanity
        const exercise = await client.fetch(`*[_type == "exercise" && _id == $exerciseId][0]`, { exerciseId });
        if (!exercise) {
            return new NextResponse(JSON.stringify({ message: "Exercice non trouvé" }), { status: 404 });
        }

        // Mise à jour de l'exercice avec les nouvelles questions
        await client
            .patch(exerciseId)
            .setIfMissing({ questions: [] })
            .append(
                "questions",
                questions.map((question: any) => ({ ...question, _key: uuidv4() }))
            )
            .commit();

        return new NextResponse(JSON.stringify({ message: "Questions ajoutées avec succès" }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ error, message: "Erreur lors de la mise à jour de l'exercice" }), { status: 500 });
    }
}
