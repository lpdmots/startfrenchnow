import { useTranslations } from "next-intl";
import React from "react";
import { BsFillChatLeftQuoteFill } from "react-icons/bs";
import { MdTipsAndUpdates } from "react-icons/md";
import GrammarLogo from "../../common/logos/GrammarLogo";
import VocabularyLogo from "../../common/logos/VocabularyLogo";

function CategoriesBand() {
    const t = useTranslations("Blog.CategoriesBand");
    return (
        <div className="text-neutral-100 p-3">
            <div className="w-full flex justify-around bg-neutral-800" style={{ marginRight: "7%" }}>
                <div className="flex flex-col justify-center items-center p-2">
                    <p className="font-bold">{t("grammar")}</p>
                    <GrammarLogo height={60} width={60} />
                </div>
                <div className="flex flex-col justify-center items-center p-2">
                    <p className="font-bold">{t("vocabulary")}</p>
                    <VocabularyLogo height={60} width={60} />
                </div>
                <div className="flex flex-col justify-between items-center p-2">
                    <p className="font-bold">{t("expressions")}</p>
                    <BsFillChatLeftQuoteFill style={{ height: 60, width: 60 }} />
                </div>
                <div className="flex flex-col justify-between items-center p-2">
                    <p className="font-bold">{t("tips")}</p>
                    <MdTipsAndUpdates style={{ height: 60, width: 60 }} />
                </div>
            </div>
        </div>
    );
}

export default CategoriesBand;
