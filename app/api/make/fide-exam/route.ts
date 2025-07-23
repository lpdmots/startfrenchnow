import { NextRequest, NextResponse } from "next/server";
//import { SanityServerClient as client } from "@/app/lib/sanity.clientServerProd";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { Exam, Response } from "@/app/types/fide/exam";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

// AWS S3
const region = process.env.AWS_REGION || "";
const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

export async function POST(request: NextRequest) {
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const data = await request.json();
        const { title, description, level } = data;
        console.log("Received data:", data);

        const examId = uuidv4();

        // Téléchargement des images
        const images = [data.image, ...data.images1, ...data.images2, ...data.images3];
        if (images.length != 10) {
            return NextResponse.json({ message: "You must provide 10 images" }, { status: 400 });
        }
        const { image, responses } = await loadImagesToSanity(images, examId);

        // Créer les tracks
        const audios = [data.situationAudio, data.question1Audio, data.audio1, data.question2Audio, data.audio2, data.question3Audio, data.audio3];
        const audioUrls = await loadAudiosToS3(audios, examId, data.level || "A1");
        const tracks = [
            {
                _key: uuidv4(),
                title: "Situation",
                src: audioUrls[0],
                text: data.situationText,
            },
            {
                _key: uuidv4(),
                title: "Question 1",
                src: audioUrls[1],
                text: data.question1Text,
            },
            {
                _key: uuidv4(),
                title: "Audio 1",
                src: audioUrls[2],
                text: data.text1,
            },
            {
                _key: uuidv4(),
                title: "Question 2",
                src: audioUrls[3],
                text: data.question2Text,
            },
            {
                _key: uuidv4(),
                title: "Audio 2",
                src: audioUrls[4],
                text: data.text2,
            },
            {
                _key: uuidv4(),
                title: "Question 3",
                src: audioUrls[5],
                text: data.question3Text,
            },
            {
                _key: uuidv4(),
                title: "Audio 3",
                src: audioUrls[6],
                text: data.text3,
            },
        ];

        // Créer le post
        const createdFideExam: Exam = await client.create({
            title,
            description,
            level,
            tracks,
            _type: "fideExam",
            _id: examId,
            image,
            responses,
            responsesB1: {
                response1: data.responsesB1?.response1 || "",
                response2: data.responsesB1?.response2 || "",
                response3: data.responsesB1?.response3 || "",
            },
        });
        return NextResponse.json({ createdFideExam }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}

async function loadImagesToSanity(images: string[], examId: string): Promise<{ image: any; responses: Response[] }> {
    const newImages: any[] = [];
    for (let index = 0; index < images.length; index++) {
        const image = images[index];
        const imageResponse = await fetch(image);
        const arrayBuffer = await imageResponse.arrayBuffer();

        // Redimensionner l'image avec Sharp
        const resizedImageBuffer = await sharp(Buffer.from(arrayBuffer))
            .resize(index === 0 ? 700 : 200, null, {
                // 700 ou 200px de large selon si mainImage, hauteur ajustée pour garder le ratio
                withoutEnlargement: true, // Empêche l'agrandissement si l'image est plus petite que 750px
            })
            .toBuffer();

        // Chargez l'image redimensionnée sur Sanity
        const uploadedImage = await client.assets.upload("image", resizedImageBuffer, {
            title: `${examId}-${index}`,
        });
        const newImage = {
            _type: "image",
            asset: {
                _type: "reference",
                _ref: uploadedImage._id,
            },
        };
        newImages.push(newImage);
    }

    return {
        image: newImages[0],
        responses: [
            ...newImages.slice(1, 4).map((img, idx) => ({
                _key: uuidv4(),
                image: img,
                isCorrect: idx === 0,
            })),
            ...newImages.slice(4, 7).map((img, idx) => ({
                _key: uuidv4(),
                image: img,
                isCorrect: idx === 0,
            })),
            ...newImages.slice(7).map((img, idx) => ({
                _key: uuidv4(),
                image: img,
                isCorrect: idx === 0,
            })),
        ],
    };
}

async function loadAudiosToS3(audioUrls: string[], examId: string, level: string): Promise<string[]> {
    const uploadedAudioUrls: string[] = [];

    for (let index = 0; index < audioUrls.length; index++) {
        const url = audioUrls[index];
        const audioResponse = await fetch(url);

        if (!audioResponse.ok) {
            throw new Error(`Échec du téléchargement de l'audio : ${url}, index: ${index}`);
        }

        const buffer = await audioResponse.buffer();
        const contentType = audioResponse.headers.get("content-type") || "audio/mpeg";
        const extension = contentType.split("/")[1];
        const filename = `fide-exam/parler/${level}/${examId}-${index + 1}.${extension}`;

        const uploadParams = {
            Bucket: "start-french-now",
            Key: filename,
            Body: buffer,
            ContentType: contentType,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        uploadedAudioUrls.push(filename);
    }

    return uploadedAudioUrls;
}
