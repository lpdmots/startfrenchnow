import textToSpeech from "@google-cloud/text-to-speech";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createSlug } from "@/app/lib/utils";

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
const clientTextToSpeech = new textToSpeech.TextToSpeechClient({
    keyFilename: "./app/lib/text-to-speech-service-account-file.json",
});

export default async function textToSpeechSimple(text: string, lang: "french" | "english") {
    const request = {
        input: { text },
        voice: lang === "english" ? { languageCode: "en-us", name: "en-US-Studio-Q" } : { languageCode: "fr-FR", name: "fr-FR-Studio-D" },
        audioConfig: {
            audioEncoding: "MP3",
            pitch: 0,
            speakingRate: 0.8,
        },
    };

    // Performs the text-to-speech request
    const [response] = await clientTextToSpeech.synthesizeSpeech(request as any);
    uploadFile(response.audioContent, `sons/noRoots/${createSlug(text)}.mp3`, "audio/mpeg");
}
