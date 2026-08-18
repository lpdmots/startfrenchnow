import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { AiFillSignal } from "react-icons/ai";
import { LEVELDATA } from "@/app/lib/constantes";
import { Locale } from "@/i18n";
import { ImPlay2 } from "react-icons/im";
import { FlatFidePackItem } from "../page";
import { Link } from "@/i18n/navigation";

const SecondaryFidePost = ({
    post,
    locale,
    hasPack,
    hidePackageBadge = false,
    headingLevel = "h2",
}: {
    post: FlatFidePackItem;
    locale: Locale;
    hasPack: boolean;
    hidePackageBadge?: boolean;
    headingLevel?: "h2" | "h3";
}) => {
    const { packageTitle, packageColor, moduleTitle, moduleLevel, postSlug, postMainVideo, postMainImage, postTitle, postDescription, postLevel, postDurationSec, postIsPreview } = post;

    const level = postLevel?.map((lev) => LEVELDATA[lev]) ?? moduleLevel?.map((lev) => LEVELDATA[lev]) ?? null;

    const hasVideo = !!postMainVideo?.url;
    const isFree = packageTitle === (locale === "en" ? "Free" : "Gratuites");
    const isLocked = !hasPack && !postIsPreview && !isFree;

    const href = isFree ? "/blog/post/" + postSlug.current : isLocked ? "/fide/pack-fide#pack-pricing" : "/fide/videos/" + postSlug.current;
    const ariaLabel = isLocked ? `${postTitle} — contenu réservé au Pack Exam. Voir les plans.` : postTitle || "Voir la leçon";
    const Heading = headingLevel;

    return (
        <Link href={href} aria-label={ariaLabel} className="!no-underline group" data-analytics={isLocked ? "click_buy_pack_from_catalog_secondary" : undefined}>
            <div className="relative card flex p-[30px] items-center gap-x-[28px] gap-y-[28px] max-[767px]:pt-[24px] max-[767px]:pr-[24px] max-[767px]:pl-[24px] max-[767px]:flex-col max-[767px]:items-stretch link-card w-inline-block !p-4 !sm:p-8 overflow-hidden">
                {/* Image + badge pack */}
                <div className="blog-card-image-wrapper inside-card flex max-h-[242px] max-w-[274px] justify-center items-center self-start [flex:1_1] max-[991px]:max-w-[222px] max-[767px]:max-h-[none] max-[767px]:max-w-[199%] flex flex-col gap-4 h-full" style={{ maxHeight: "none", overflow: "visible" }}>
                    <div className="rounded-2xl sm:rounded-3xl" style={{ overflow: "hidden" }}>
                        <Image
                            src={urlFor(postMainImage).url()}
                            width={350}
                            height={200}
                            loading="lazy"
                            alt={postTitle || "no title"}
                            className={`fide-image-outline h-full w-full object-contain outline outline-1 -outline-offset-1 outline-black/10 transition-[opacity,transform] duration-150 group-hover:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none ${isLocked ? "group-hover:opacity-60" : ""}`}
                            style={{ width: "auto", height: "auto", maxHeight: "200px", minHeight: 150 }}
                        />
                    </div>

                    {!hidePackageBadge && (
                        <div>
                            <div className="badge-primary small" style={{ backgroundColor: packageColor }}>
                                {packageTitle}
                            </div>
                        </div>
                    )}
                </div>

                {/* Contenu carte */}
                <div className={`inner-container min-w-[205px] [flex:1_1] max-[767px]:min-w-auto flex flex-col justify-between ${isLocked ? "transition md:group-hover:opacity-70" : ""}`} style={{ minHeight: 200 }}>
                    <div>
                        <div className="flex gap-2 items-center mb-2">
                            {isLocked && <Image src="/images/cadenas-ferme.png" alt="Contenu réservé au Pack Exam" width={32} height={32} className="h-8 w-8 mt-0.5 shrink-0" />}
                            <Heading className="bl mb-0 font-extrabold">{postTitle || "Pas de titre"}</Heading>
                        </div>
                        <p className="mg-bottom-0 line-clamp-5">{postDescription || "Pas de description"}</p>
                    </div>

                    <div className="flex justify-end items-center text-300 medium color-neutral-600 mt-4 gap-2 flex-wrap text-base">
                        {hasVideo && (
                            <div className="flex items-center gap-2">
                                <ImPlay2 className="text-2xl" style={{ color: packageColor }} />
                            </div>
                        )}
                        {level && (
                            <div className="flex gap-2 items-center">
                                <p className="mb-0"> - </p>
                                {[...level].reverse().map((lv, index) => (
                                    <div className="flex items-center gap-2" key={lv.label}>
                                        {!!index && " / "}
                                        <AiFillSignal style={{ fontSize: "1.2rem", color: lv.color }} />
                                        {lv.label}
                                    </div>
                                ))}
                            </div>
                        )}
                        {!!postDurationSec && !!moduleTitle && (
                            <>
                                <p className="mb-0"> - </p>
                                <div>{postDurationSec && `${Math.floor(postDurationSec / 60)} min`}</div> - <div>{moduleTitle}</div>
                            </>
                        )}
                    </div>
                </div>

                {/* Overlay CTA (hover desktop) */}
                {isLocked && (
                    <div className="absolute inset-0 z-10 h-full w-full group pointer-events-none">
                        <div className="absolute inset-0 bg-neutral-300 opacity-0 transition-opacity duration-300 group-hover:opacity-90" />
                        <div
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4
                         opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        >
                            <Image src="/images/cadenas-ouvert.png" alt="Contenu réservé au Pack Exam" width={64} height={64} className="h-16 w-16 mb-4" />
                            <p className="text-base md:text-xl font-medium">
                                Contenu réservé au <strong>Pack Exam</strong>
                            </p>

                            <button className="mt-4 btn btn-primary small pointer-events-auto transform transition-transform duration-200 hover:-translate-y-0.5">Acheter le Pack Exam</button>

                            <span className="sr-only">— lien vers /fide/pack-fide#pack-pricing</span>
                        </div>
                    </div>
                )}
            </div>
        </Link>
    );
};

export default SecondaryFidePost;
