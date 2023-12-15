import { TabelVocProps, TabelVocFilters, ThemeWithVocab, VocabItem } from "@/app/types/sfn/blog";
import { groq } from "next-sanity";
import { SanityServerClient as client } from "../../../lib/sanity.clientServer";
import { COLORVARIABLES, natures } from "@/app/lib/constantes";
import { BsCaretRightFill } from "react-icons/bs";
import Spinner from "../../common/Spinner";
import Image from "next/image";
import { TabelVocSoundButton } from "../../animations/BlogAnimations";
import { NoteWithLang } from "./NoteWithLang";
import { NaturePostLang } from "./FrontComponents";
import urlFor from "@/app/lib/urlFor";

const queryThemes = groq`
        *[_type == "theme" && _id in $refs] 
        {
            ...,
            vocabItems[]->,
        }
    `;

export const ArticleVoc = async ({ data }: TabelVocProps) => {
    const refs = data.themes.map((theme) => theme._ref);
    const filters = data.filters;
    const themes: ThemeWithVocab[] = await client.fetch(queryThemes, { refs });
    const allVocabItems = themes?.map((theme) => theme.vocabItems).flat();
    const vocabItems = allVocabItems?.filter((item) => filterVocabItems(item, filters));
    if (!themes || !vocabItems?.length) {
        console.warn("No themes or vocabItems found");
        return null;
    }
    const category = themes[0].category;
    let imageIndex = 0;

    return (
        <div className="inner-container _600px---tablet center py-8">
            <div className="inner-container _500px---mbl center overflow-hidden">
                {vocabItems.map((vocabItem, index) => {
                    const { french, english, soundFr, noteFr, noteEn, nature, example, image } = vocabItem;
                    const natureLang = natures[nature as keyof typeof natures];
                    const imageSrc = image ? urlFor(image)?.url() : null;
                    let imagePlacement = null;
                    const isNote = noteFr || noteEn;

                    if (imageSrc) {
                        imageIndex++;
                        imagePlacement = imageIndex % 2 === 0 ? "left" : "right";
                    }
                    return (
                        <div className="my-16" key={index}>
                            <div className="flex gap-4 items-center flex-wrap mb-4">
                                <span>{index + 1}.</span>
                                <h3>
                                    <TabelVocSoundButton sound={soundFr} text={french} />
                                </h3>
                                <BsCaretRightFill style={{ color: "var(--neutral-600)", marginRight: 2, height: 16, objectFit: "contain", flexShrink: 0 }} />
                                <span className="text-neutral-600 italic">{english}</span>
                                <span className="bs italic">{!!natureLang && <NaturePostLang natureLang={natureLang} />}</span>
                            </div>
                            <div className="pl-8 md:pl-12 bg-neutral-300 pr-2 md:pr-4 py-2 sm:py-4 mb-4" style={{ borderLeft: "solid 6px var(--neutral-600)", borderRadius: 10 }}>
                                <p className="mb-0">{example}</p>
                            </div>
                            <div className={(!isNote && "flex justify-center") || ""} style={{ minHeight: imageSrc ? 200 : "none" }}>
                                {imageSrc && (
                                    <div className="flex w-full justify-center md:block mb-4">
                                        <Image
                                            src={imageSrc || ""}
                                            alt={english}
                                            height={200}
                                            width={200}
                                            style={{ objectFit: "cover", maxHeight: 200, maxWidth: 200, borderRadius: 10 }}
                                            className={`${!isNote ? "" : imagePlacement === "left" ? "md:float-left mr-4" : "md:float-right ml-4"}`}
                                        />
                                    </div>
                                )}
                                <NoteWithLang noteFr={noteFr} noteEn={noteEn} category={category} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const filterVocabItems = (item: VocabItem, filters: TabelVocFilters) => {
    const { status: filterStatus, tags: filterTags, nature: filterNature } = filters;
    const itemNature = (item.nature === "expression" ? "expressions" : "words") as "expressions" | "words" | "all";
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterTags?.length && !filterTags?.some((tag) => item.tags?.includes(tag))) return false;
    if (filterNature !== "all" && itemNature !== filterNature) return false;
    return true;
};
