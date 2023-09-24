import { MyFreeVideoFront } from "@/app/components/sfn/myFreeVideo/MyFreeVideoFront";
import { useTranslations } from "next-intl";
import React from "react";

function MyFreeVideo() {
    const t = useTranslations("MyFreeVideo");
    const translation = getMyFreeVideoTranslation(t);
    return <MyFreeVideoFront translation={translation} />;
}

export default MyFreeVideo;

const getMyFreeVideoTranslation = (t: any) => {
    return {
        Form: {
            title: t("Form.title"),
            description: t("Form.description"),
            emailPlaceholder: t("Form.emailPlaceholder"),
            submitBtn: t("Form.submitBtn"),
        },
        UnknownSub: {
            title: t("UnknownSub.title"),
            description: t("UnknownSub.description"),
            tryAgainBtn: t("UnknownSub.tryAgainBtn"),
            goHomeBtn: t("UnknownSub.goHomeBtn"),
        },
        ErrorLayout: {
            title: t("ErrorLayout.title"),
            description: t("ErrorLayout.description"),
            tryAgainBtn: t("ErrorLayout.tryAgainBtn"),
            contactBtn: t("ErrorLayout.contactBtn"),
        },
        VideoChoice: {
            title: t("VideoChoice.title"),
            description: t("VideoChoice.description"),
            btnBeginner: t("VideoChoice.btnBeginner"),
            btnIntermediate: t("VideoChoice.btnIntermediate"),
        },
    };
};
