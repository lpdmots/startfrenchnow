// app/api/fide-import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import type { SanityDocumentStub } from "@sanity/client";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { Image, Post } from "@/app/types/sfn/blog";
import { createSlug } from "@/app/lib/utils";

export const runtime = "nodejs"; // lecture disque locale

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// --------------------
// Entrée: exactement tes clés JSON
// --------------------
type RawItem = {
    title?: string;
    titleEn?: string;
    ["description FR"]?: string | null;
    ["description EN"]?: string | null;
    ["Meta-description FR"]?: string | null;
    ["Meta-description EN"]?: string | null;
    s3Key?: string | null; // ignoré pour Post
    imagePath?: string | null; // sert à uploader l'asset pour mainImage
    durationSec?: number | null;
};

// --------------------
// Types minimaux côté Post (UNIQUEMENT les champs fournis)
// --------------------
type MinimalPostImage = {
    _type: "image";
    asset: { _type: "reference"; _ref: string };
};

// --------------------
// Helpers upload image (aucune réduction)
// --------------------
function resolveLocalPath(localRoot: string, rel: string) {
    const safeRel = rel.replace(/^[/\\]+/, "");
    return path.join(localRoot, safeRel);
}

async function uploadLocalImage(absPath: string, filename?: string) {
    const data = await fsp.readFile(absPath); // Buffer
    const asset = await client.assets.upload("image", data, {
        filename: filename ?? path.basename(absPath),
    });
    return asset; // SanityImageAssetDocument
}

export async function POST(request: NextRequest) {
    // Auth: même logique que ton fichier existant
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const payload = await request.json();
        const items: RawItem[] = Array.isArray(payload) ? payload : [payload];

        if (!items.length) {
            return NextResponse.json({ message: "JSON vide" }, { status: 400 });
        }

        const LOCAL_MEDIA_ROOT = "D:\\videos FIDE\\e-learning-fide";

        const results: Array<{
            _id: string;
            title?: string | null;
            title_en?: string | null;
            imageRef?: string | null;
            note?: string;
        }> = [];

        for (const it of items) {
            // 1) Prépare mainImage en uploadant l'asset si imagePath valide
            let mainImage: Image = { _type: "image", asset: { _type: "reference", _ref: "" } };

            if (it.imagePath) {
                const abs = resolveLocalPath(LOCAL_MEDIA_ROOT, it.imagePath);
                if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
                    const asset = await uploadLocalImage(abs);
                    mainImage = {
                        _type: "image",
                        asset: { _type: "reference", _ref: asset._id },
                    };
                } else {
                    results.push({
                        _id: "(pending)",
                        title: it.title ?? null,
                        title_en: it.titleEn ?? null,
                        imageRef: null,
                        note: `Image introuvable: ${abs}`,
                    });
                }
            }

            // 2) Document Post avec SEULEMENT les champs fournis (mappage exact)
            const postDoc: Partial<Post> = {
                _type: "post",
                title: it.title ?? "",
                title_en: it.titleEn ?? "",
                description: it["description FR"] ?? "",
                description_en: it["description EN"] ?? "",
                metaDescription: it["Meta-description FR"] ?? "",
                metaDescription_en: it["Meta-description EN"] ?? "",
                mainImage,
                categories: ["pack_fide"],
                mainVideo: {
                    _type: "videoBlog",
                    title: "",
                    url: it.s3Key ?? "",
                },
                slug: { _type: "slug", current: createSlug(it.title ?? it.titleEn ?? "untitled") },
                help: false,
                publishedAt: new Date().toISOString(),
                isReady: true,
                durationSec: it.durationSec ?? 0,
            };

            // 3) Création
            const created = await client.create(postDoc as unknown as Post);

            results.push({
                _id: created._id,
                title: postDoc.title ?? null,
                title_en: postDoc.title_en ?? null,
                imageRef: mainImage ? mainImage.asset._ref : null,
                note: mainImage ? "image liée à mainImage" : "sans image",
            });
        }

        return NextResponse.json({ ok: true, count: results.length, created: results }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error?.message ?? "Unknown error" }, { status: 400 });
    }
}
