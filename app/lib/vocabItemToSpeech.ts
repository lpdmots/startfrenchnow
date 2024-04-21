import textToSpeech from "@google-cloud/text-to-speech";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createSlug } from "@/app/lib/utils";
import { Theme, VocabItem } from "../types/sfn/blog";

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

function uploadFile(fileBuffer: any, fileName: string, mimetype: any) {
    const uploadParams = {
        Bucket: "start-french-now",
        Body: fileBuffer,
        Key: fileName,
        ContentType: mimetype,
    };

    return s3Client.send(new PutObjectCommand(uploadParams));
}

// Creates a client using the credentials from the JSON key file
const textToSpeechAuth = JSON.parse(process.env.TEXTTOSPEECH_AUTH || "{}");

const clientTextToSpeech = new textToSpeech.TextToSpeechClient({
    credentials: textToSpeechAuth,
});

export default async function vocabItemToSpeech(vocabItem: VocabItem, theme: Theme | null) {
    const { french, english, example } = vocabItem;
    const textsToConvert = { french, english, example };
    const data = {} as { [key: string]: string };
    const correspondances = { french: "soundFr", english: "soundEn", example: "soundExample" };

    for (let key in textsToConvert) {
        const text = textsToConvert[key as keyof typeof textsToConvert];
        if (!text) continue;
        const request = {
            input: { text },
            voice: key === "english" ? { languageCode: "en-us", name: "en-US-Studio-Q" } : { languageCode: "fr-FR", name: "fr-FR-Studio-D" },
            audioConfig: {
                audioEncoding: "MP3",
                pitch: 0,
                speakingRate: 0.8,
            },
        };

        // Performs the text-to-speech request
        const [response] = await clientTextToSpeech.synthesizeSpeech(request as any);
        uploadFile(response.audioContent, `sons/${theme?.category || "libres"}/${createSlug(theme?.name || "")}/${createSlug(french)}/${createSlug(text)}.mp3`, "audio/mpeg");
        //console.log("response", response);
        const keyData = correspondances[key as keyof typeof correspondances] as any;
        data[keyData] = `sons/${theme?.category || "libres"}/${createSlug(theme?.name || "")}/${createSlug(french)}/${createSlug(text)}.mp3`;
    }

    return data;
}
