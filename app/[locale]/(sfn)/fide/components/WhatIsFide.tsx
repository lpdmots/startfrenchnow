import { ExamVideo } from "./ExamVideo";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { AskForPdf } from "./AskForPdf";

export const WhatIsFide = () => {
    const t = useTranslations("Fide.WhatIsFide");
    const messages = {
        emailPlaceholder: t("AskForPdf.emailPlaceholder"),
        button: t("AskForPdf.button"),
        ask: t.rich("AskForPdf.ask", intelRich()),
        successMessage: t.rich("AskForPdf.successMessage", intelRich()),
        errorMessage: t("AskForPdf.errorMessage"),
    };

    return (
        <>
            <div id="whatIsFIDE" className="grid grid-cols-1 lg:grid-cols-2 gap-x-[20px] [grid-template-columns:1fr_0.7fr] min-[1440px]:gap-x-[90px] max-[991px]:gap-y-[60px] max-[991px]:[grid-template-columns:1fr] gap-8 xl:gap-12">
                <div id="w-node-d6ab327c-c12b-e1a4-6a28-7aaa783883be-b9543dac" data-w-id="d6ab327c-c12b-e1a4-6a28-7aaa783883be" className="inner-container test" style={{ maxWidth: 650 }}>
                    <div className="text-center---tablet flex flex-col gap-6 lg:gap-12 h-full">
                        <div className="inner-container max-[991px]:max-w-[550px] center">
                            <h2 className="text-[var(--neutral-800)] text-[72px] leading-[1.181em] font-bold self-end text-[var(--neutral-100)] max-[1200px]:text-[48px] max-[1200px]:leading-[1.188em] max-[479px]:text-[34px] max-[479px]:leading-[1.353em] text-neutral-800">{t.rich("title", intelRich())}</h2>
                        </div>
                        <div className="flex grow flex-col justify-center text-left">
                            <div className="flex flex-col gap-4 lg:gap-8">
                                <div className="flex gap-2 lg:gap-4 items-center">
                                    <div className="bullet bg-secondary-3"></div>
                                    <p className="mb-0">{t.rich("point1", intelRich())}</p>
                                </div>
                                <div className="flex gap-2 lg:gap-4 items-center">
                                    <div className="bullet bg-secondary-1"></div>
                                    <p className="mb-0">{t.rich("point2", intelRich())}</p>
                                </div>
                                <div className="flex gap-2 lg:gap-4 items-center">
                                    <div className="bullet bg-secondary-2"></div>
                                    <p className="mb-0">{t.rich("point3", intelRich())}</p>
                                </div>
                                <div className="flex gap-2 lg:gap-4 items-center">
                                    <div className="bullet bg-secondary-4"></div>
                                    <p className="mb-0">{t.rich("point4", intelRich())}</p>
                                </div>
                                <div className="flex gap-2 lg:gap-4 items-center">
                                    <div className="bullet bg-secondary-5"></div>
                                    <p className="mb-0">{t.rich("point5", intelRich())}</p>
                                </div>
                                {/* 
                                <LinkArrow url="/fide#FideFAQ" className="font-bold">
                                    {t("linkToFAQ")}
                                </LinkArrow> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-6 lg:gap-12 justify-center items-center">
                    <ExamVideo text={t("fullExplanation")} />
                    <AskForPdf messages={messages} />
                </div>
            </div>
        </>
    );
};
