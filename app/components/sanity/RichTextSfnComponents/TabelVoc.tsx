import { TabelVocProps, TabelVocFilters, ThemeWithVocab, VocabItem } from "@/app/types/sfn/blog";
import { groq } from "next-sanity";
import { SanityServerClient as client } from "../../../lib/sanity.clientServer";
import { COLORVARIABLES } from "@/app/lib/constantes";
import { BsCaretRightFill } from "react-icons/bs";
import Spinner from "../../common/Spinner";
import Image from "next/image";
import { NotePopover, TabelVocSoundButton } from "../../animations/BlogAnimations";

const queryThemes = groq`
        *[_type == "theme" && _id in $refs] 
        {
            ...,
            vocabItems[]->,
        }
    `;

const TabelVoc = async ({ data }: TabelVocProps) => {
    const refs = data.themes.map((theme) => theme._ref);
    const filters = data.filters;
    const themes: ThemeWithVocab[] = await client.fetch(queryThemes, { refs });
    const allVocabItems = themes?.map((theme) => theme.vocabItems).flat();
    const vocabItems = allVocabItems?.filter((item) => filterVocabItems(item, filters));
    if (!themes || !vocabItems?.length) {
        console.warn("No themes or vocabItems found");
        return null;
    }
    const theme = { ...themes[0], vocabItems };

    const colorVar = COLORVARIABLES[data.color || "blue"];
    const colorLight = "var(--neutral-200)";

    return (
        <div className="inner-container _600px---tablet center py-8">
            <div className="inner-container _500px---mbl center card overflow-hidden">
                <table id="customers">
                    <tbody className="bl">
                        <tr style={{ borderBottom: "solid 2px var(--neutral-800)", backgroundColor: colorVar }}>
                            <th>
                                <span className="pl-0 sm:pl-4" style={{ marginLeft: 26 }}>
                                    <Image src="/images/france.png" height={40} width={50} alt="french flag" style={{ objectFit: "contain" }} />
                                </span>
                            </th>
                            <th>
                                <span className="pr-0 sm:pr-4">
                                    <Image src="/images/royaume-uni.png" alt="UK flag" height={40} width={50} style={{ height: 40, objectFit: "contain" }} />
                                </span>
                            </th>
                        </tr>
                        {theme ? (
                            theme.vocabItems.map((vocabItem, index) => {
                                return (
                                    <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "var(--neutral-100)" : colorLight }}>
                                        <td className="flex justify-between items-center">
                                            <TabelVocSoundButton sound={vocabItem?.soundFr} text={vocabItem.french} />
                                            <BsCaretRightFill style={{ color: "var(--neutral-600)", marginRight: 2, height: 16, objectFit: "contain", flexShrink: 0 }} />
                                        </td>
                                        <td>
                                            <div className="flex justify-between items-center">
                                                <span className="pr-0 sm:pr-4 font-bold">{vocabItem.english}</span>
                                                <NotePopover noteFr={vocabItem.noteFr} noteEn={vocabItem.noteEn} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={2}>
                                    <div className="flex flex-col items-center justify-center" style={{ minHeight: 450 }}>
                                        <Spinner radius maxHeight="40px" message="Chargement des données" color={colorVar} />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TabelVoc;

const filterVocabItems = (item: VocabItem, filters: TabelVocFilters) => {
    const { status: filterStatus, tags: filterTags, nature: filterNature } = filters;
    const itemNature = (item.nature === "expression" ? "expressions" : "words") as "expressions" | "words" | "all";
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    if (filterTags?.length && !filterTags?.some((tag) => item.tags?.includes(tag))) return false;
    if (filterNature !== "all" && itemNature !== filterNature) return false;
    return true;
};
