import { SlideFromBottom, SlideFromRight, SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import VideoBlog from "@/app/components/sanity/RichTextSfnComponents/VideoBlog";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";

const TestPage = () => {
    const t = useTranslations("TestPage");

    const LevelsData = [
        {
            level: "A1",
            title: t("levels.a1.title"),
            content: t("levels.a1.content"),
            color: "#b0a2f9",
        },
        {
            level: "A2",
            title: t("levels.a2.title"),
            content: t("levels.a2.content"),
            color: "#18b8da",
        },
        {
            level: "B1",
            title: t("levels.b1.title"),
            content: t("levels.b1.content"),
            color: "#bbcd2b",
        },
        {
            level: "B2",
            title: t("levels.b2.title"),
            content: t("levels.b2.content"),
            color: "#ffd33f",
        },
        {
            level: "C1",
            title: t("levels.c1.title"),
            content: t("levels.c1.content"),
            color: "#f4973a",
        },
        {
            level: "C2",
            title: t("levels.c2.title"),
            content: t("levels.c2.content"),
            color: "#e770d4",
        },
    ];

    return (
        <div className="overflow-hidden pb-12">
            <div className="py-8 md:py-12 lg:py-24">
                <div className="container-default w-container">
                    <div className="inner-container _600px---mbl center">
                        <div className="text-center">
                            <div className="inner-container max-w-[1015px] max-[991px]:max-w-full center">
                                <h1 className="display-1 mg-bottom-12px">{t.rich("heroTitle", intelRich())}</h1>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <VideoBlog
                            values={{
                                url: "https://www.youtube.com/watch?v=-UVoKCZM-5s&ab_channel=StartFrenchNow",
                                title: undefined,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 lg:pb-12">
                <SlideFromBottom>
                    <h2 className="display-2">{t.rich("whyTestTitle", intelRich())}</h2>
                </SlideFromBottom>
                <SlideFromBottom>
                    <p className="text-lg">{t.rich("whyTestDescription", intelRich())}</p>
                </SlideFromBottom>
                <SlideFromBottom>
                    <p className="text-lg">{t.rich("whyTestAdditional", intelRich())}</p>
                </SlideFromBottom>
                <h3 className="display-3 pt-4 lg:pt-8">{t("globalDistribution")}</h3>
                <SlideFromRight>
                    <div className="card p-2 md:p-4 lg:p-8 my-4 lg:my-8">
                        <Image src="/images/cecr.png" alt={t("cecrImageAlt")} width={1200} height={1200} className="object-contain h-auto rounded-xl" />
                    </div>
                </SlideFromRight>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                <SlideInOneByOneParent>
                    <div>
                        <div className="mg-bottom-54px">
                            <div className="text-center---tablet">
                                <div className="w-layout-grid grid-2-columns title-and-paragraph">
                                    <div className="inner-container max-w-[525px] max-[991px]:max-w-full">
                                        <div className="inner-container _400px---mbl center">
                                            <div className="inner-container max-[479px]:max-w-[350px] center">
                                                <h2 className="display-2">{t.rich("cefrLevelsTitle", intelRich())}</h2>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="inner-container max-w-[525px] max-[991px]:max-w-full">
                                        <p className="mg-bottom-0 text-neutral-700">{t.rich("cefrLevelsDescription", intelRich())}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-layout-grid grid-2-columns items-stretch max-[991px]:[grid-template-columns:1fr]">
                            {LevelsData.map(({ level, title, content, color }) => (
                                <div key={level}>
                                    <SlideInOneByOneChild>
                                        <div className="card grid overflow-hidden items-center [grid-auto-columns:1fr] gap-x-0 gap-y-0 [grid-template-columns:minmax(200px\,_0.65fr)_1fr] [grid-template-rows:auto] shadow-[none] hover:[transform:none] max-[767px]:[grid-template-columns:minmax(189px\,_0.65fr)_1fr] max-[479px]:[grid-template-columns:auto] h-full !pr-0">
                                            <div className="flex justify-center items-center p-6 lg:p-12">
                                                <div
                                                    className="flex justify-center items-center text-5xl xl:text-7xl rounded-full aspect-square h-32 w-32 md:h-40 md:w-40"
                                                    style={{ backgroundColor: color, color: "white" }}
                                                >
                                                    {level}
                                                </div>
                                            </div>
                                            <div className="flex flex-col h-full p-4 sm:!pl-0">
                                                <h3>{title}</h3>
                                                <p className="mg-bottom-0">{content}</p>
                                            </div>
                                        </div>
                                    </SlideInOneByOneChild>
                                </div>
                            ))}
                        </div>
                    </div>
                </SlideInOneByOneParent>
            </div>
        </div>
    );
};

export default TestPage;
