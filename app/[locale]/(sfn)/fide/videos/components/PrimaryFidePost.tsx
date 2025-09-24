import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import React from "react";
import { AiFillSignal } from "react-icons/ai";
import { ImPlay2 } from "react-icons/im";
import { FiLock } from "react-icons/fi";
import Link from "next-intl/link";
import { LEVELDATA } from "@/app/lib/constantes";
import { FlatFidePackItem } from "../page";
import { ScaleChildren } from "@/app/components/animations/ParentToChildrens";
import clsx from "clsx";

const PrimaryFidePost = ({ post, locale, hasPack }: { post: FlatFidePackItem; locale: string; hasPack: boolean }) => {
    const { packageTitle, packageColor, moduleTitle, moduleLevel, postSlug, postMainVideo, postMainImage, postTitle, postDescription, postLevel, postDurationSec, postIsPreview } = post;

    const level = postLevel?.map((lev) => LEVELDATA[lev]) ?? moduleLevel?.map((lev) => LEVELDATA[lev]) ?? null;

    const hasVideo = !!postMainVideo?.url;
    const isLocked = !hasPack && !postIsPreview;

    const href = isLocked ? "/fide/pack-fide#plans" : "/fide/videos/" + postSlug.current;
    const ariaLabel = isLocked ? `${postTitle} — contenu réservé au Pack FIDE. Voir les plans.` : postTitle || "Voir la leçon";

    return (
        <Link
            href={href}
            aria-label={ariaLabel}
            className="!no-underline group" // group = hover parent
            data-analytics={isLocked ? "click_buy_pack_from_catalog" : undefined}
        >
            <div className="relative blog-card-wrapper card link-card w-inline-block overflow-hidden">
                {/* Image + badges */}
                <div className="blog-card-image-wrapper inside-card max-heigth-330px">
                    <ScaleChildren>
                        <Image
                            src={urlFor(postMainImage).url()}
                            width={400}
                            height={400}
                            loading="lazy"
                            alt={postTitle || "no title"}
                            className={`blog-card-image transition duration-200 ${isLocked ? "group-hover:opacity-60" : ""}`}
                            style={{ minHeight: 150, objectFit: "contain" }}
                        />
                    </ScaleChildren>

                    {/* Badge pack (existant) */}
                    <div className="blog-card-badge-wrapper-top text-right pointer-events-none">
                        <div className="badge-primary small" style={{ backgroundColor: packageColor }}>
                            {packageTitle}
                        </div>
                    </div>
                </div>

                {/* Contenu carte */}
                <div className={`blog-card-content-inside ${isLocked ? "transition md:group-hover:opacity-70" : ""}`}>
                    <div className="inner-container _350px---mbl flex items-center gap-2 mb-2">
                        {isLocked && <Image src="/images/cadenas-ferme.png" alt="Contenu réservé au Pack FIDE" width={32} height={32} className="h-8 w-8" />}
                        <h2 className="blog-card-title display-4 mg-bottom-24px mb-0">{postTitle}</h2>
                    </div>
                    <div className="mg-top-auto">
                        <div className="flex-col gap-24px _15px---mbp">
                            <p className="line-clamp-4">{postDescription}</p>

                            <div className="flex justify-end items-center text-300 medium color-neutral-600 gap-2 flex-wrap">
                                {hasVideo && (
                                    <div className="flex items-center gap-2">
                                        <ImPlay2 className="text-2xl" style={{ color: packageColor }} />
                                        <p className="mb-0"> - </p>
                                    </div>
                                )}
                                {level && (
                                    <div className="flex gap-2 items-center">
                                        {[...level].reverse().map(
                                            (
                                                lv,
                                                index // éviter le reverse() mutateur
                                            ) => (
                                                <div className="flex items-center gap-2" key={lv.label}>
                                                    {!!index && " / "}
                                                    <AiFillSignal style={{ fontSize: "1.2rem", color: lv.color }} />
                                                    {lv.label}
                                                </div>
                                            )
                                        )}
                                        <p className="mb-0"> - </p>
                                    </div>
                                )}
                                <div>{postDurationSec && `${Math.floor(postDurationSec / 60)} min`}</div> - <div>{moduleTitle}</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Overlay CTA au hover (visible en desktop au hover, visible en permanence sur mobile) */}
                {isLocked && (
                    <div className="absolute inset-0 z-10 h-full w-full group pointer-events-none">
                        <div className="absolute inset-0 bg-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                        <div
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4
                    opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        >
                            <Image src="/images/cadenas-ouvert.png" alt="Contenu réservé au Pack FIDE" width={64} height={64} className="h-16 w-16 mb-4" />
                            <p className="text-base md:text-xl font-medium">
                                Contenu réservé au <strong>Pack FIDE</strong>
                            </p>

                            <button className="mt-4 btn btn-primary small pointer-events-auto transform transition-transform duration-200 hover:-translate-y-0.5">Acheter le Pack FIDE</button>

                            <span className="sr-only">— lien vers /fide/pack-fide#plans</span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default PrimaryFidePost;
