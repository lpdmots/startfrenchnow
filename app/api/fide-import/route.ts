// app/api/udemy-course-import/route.ts
import { NextRequest, NextResponse } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import path from "node:path";
import fs from "node:fs";
import fsp from "node:fs/promises";
import { Image, Post, Reference } from "@/app/types/sfn/blog";
import { ProductPackage, PackageModule } from "@/app/types/sfn/stripe";
import { createSlug } from "@/app/lib/utils";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";


export const runtime = "nodejs"; // lecture disque locale

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// --------------------
// Types d'entrée JSON (identiques à ta route actuelle + modules)
// --------------------
type Resource = {
    title_fr: string;
    title_en: string;
    key: string;
};

type RawItem = {
    title_fr: string;
    title_en: string;
    description_fr: string;
    description_en: string;
    metadescription_fr: string;
    metadescription_en?: string;
    s3_key: string;
    imagePath: string;
    durationSec: number;
    subtitle_fr: string;
    subtitle_en: string;
    resources: Resource[];
};

type ModulePayload = {
    module_title_fr: string;
    module_title_en: string;
    posts: RawItem[];
};

async function uploadLocalImage(absPath: string, filename?: string) {
    const data = await fsp.readFile(absPath); // Buffer
    const asset = await client.assets.upload("image", data, {
        filename: filename ?? path.basename(absPath),
    });
    return asset; // SanityImageAssetDocument
}

export async function POST(request: NextRequest) {
    // Auth
    const secret_key = request.headers.get("SFN-API-Key");
    if (secret_key !== NEXTAUTH_SECRET) {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }

    try {
        const payload = await request.json();

        // Le body est un tableau de modules
        const modulesPayload: ModulePayload[] = Array.isArray(payload) ? payload : [payload];

        if (!modulesPayload.length) {
            return NextResponse.json({ message: "JSON vide" }, { status: 400 });
        }

        // 1) Récupérer le productPackage cible
        const productPackage = await client.fetch<(ProductPackage & { _id: string; modules?: PackageModule[] }) | null>(`*[_type == "productPackage" && referenceKey == $referenceKey][0]`, {
            referenceKey: "udemy_course_beginner",
        });

        if (!productPackage || !productPackage._id) {
            return NextResponse.json({ message: 'Aucun "productPackage" trouvé pour referenceKey = "udemy_course_beginner"' }, { status: 404 });
        }

        const allCreatedPostIds: string[] = [];
        const newModules: PackageModule[] = [];

        // 2) Loop sur les modules reçus
        for (const modulePayload of modulesPayload) {
            const { module_title_fr, module_title_en, posts } = modulePayload;

            if (!posts || !Array.isArray(posts) || posts.length === 0) {
                // On ignore les modules sans posts
                continue;
            }

            const postIdsForModule: string[] = [];

            // 2.a) Créer tous les posts du module
            for (const it of posts) {
                // Préparation mainImage
                let mainImage: Image = { _type: "image", asset: { _type: "reference", _ref: "" } };

                if (it.imagePath) {
                    if (fs.existsSync(it.imagePath) && fs.statSync(it.imagePath).isFile()) {
                        const asset = await uploadLocalImage(it.imagePath);
                        mainImage = {
                            _type: "image",
                            asset: { _type: "reference", _ref: asset._id },
                        };
                    }
                }

                // Préparation des resources pour le Post
                const resources =
                    Array.isArray(it.resources) && it.resources.length
                        ? it.resources.map((r) => ({
                              title_fr: r.title_fr,
                              title_en: r.title_en,
                              key: r.key,
                          }))
                        : undefined;

                const publishedAt = new Date().toISOString();

                const postDoc: Partial<Post> = {
                    _type: "post",
                    title: it.title_fr ?? "",
                    title_en: it.title_en ?? "",
                    description: it.description_fr,
                    description_en: it.description_en,
                    metaDescription: it.metadescription_fr,
                    metaDescription_en: it.metadescription_en,
                    mainImage,
                    categories: ["udemy_course_beginner"],
                    mainVideo: {
                        _type: "videoBlog",
                        title: "",
                        url: it.s3_key,
                        subtitleFr: it.subtitle_fr,
                        subtitleEn: it.subtitle_en,
                    },
                    slug: { _type: "slug", current: createSlug(it.title_fr) },
                    help: false,
                    publishedAt,
                    isReady: true,
                    durationSec: it.durationSec,
                    resources: resources && resources.length ? resources.map((r) => ({ ...r, _key: uuidv4() })) : undefined,
                };

                const created = await client.create(postDoc as unknown as Post);
                allCreatedPostIds.push(created._id);
                postIdsForModule.push(created._id);
            }

            // 2.b) Construire le module pour le productPackage
            const moduleDoc: PackageModule & { _type?: string } = {
                // on laisse level, subtitle, subtitle_en non définis
                title: module_title_fr,
                title_en: module_title_en,
                _key: uuidv4(),
                posts: postIdsForModule.map(
                    (id): Reference => ({
                        _type: "reference",
                        _ref: id,
                        _key: uuidv4(),
                    })
                ) as any, // cast pour coller au type PackageModule.posts
            };

            newModules.push(moduleDoc);
        }

        if (!newModules.length) {
            return NextResponse.json({ message: "Aucun module valide (avec posts) dans la payload", createdPosts: allCreatedPostIds.length }, { status: 400 });
        }

        // 3) Ajouter les nouveaux modules au productPackage (on ajoute, on ne remplace pas)
        const updated = await client
            .patch(productPackage._id)
            .setIfMissing({ modules: [] })
            .append("modules", newModules as any)
            .commit();

        return NextResponse.json(
            {
                ok: true,
                productPackageId: productPackage._id,
                createdPostsCount: allCreatedPostIds.length,
                createdPostIds: allCreatedPostIds,
                addedModulesCount: newModules.length,
                productPackage: updated,
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: error?.message ?? "Unknown error" }, { status: 400 });
    }
}
