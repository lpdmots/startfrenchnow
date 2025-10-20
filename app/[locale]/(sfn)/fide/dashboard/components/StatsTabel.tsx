import CircularProgressMagic from "@/app/components/common/CircularProgressMagic";
import { useTranslations } from "next-intl";
import { HeroData } from "./dashboardUtils";
import { RenderStars } from "./ExamCard";
import { SlideFromRight } from "@/app/components/animations/Slides";

interface Props {
    hero: HeroData;
    locale: "fr" | "en";
    hasPack: boolean;
}

export const StatsTabel = ({ hero, locale, hasPack }: Props) => {
    const t = useTranslations("Fide.dashboard.Exams.StatsTabel");
    const { stats } = hero?.exams || {};

    const dataStatsTabel = [
        {
            title: t("levelA1"),
            allExams: (
                <CircularProgressMagic
                    max={100}
                    min={0}
                    value={((stats?.doneCountByLevel["A1"] || 0) / (stats?.allexamsByLevel["A1"] || 1)) * 100 || 0}
                    gaugePrimaryColor="var(--secondary-5)"
                    gaugeSecondaryColor="var(--neutral-300)"
                    className="h-12 md:h-16"
                    fontHeight="text-sm md:text-lg"
                    withSize={false}
                />
            ),
            avg: <RenderStars stars={stats?.avgByLevel["A1"] || null} areBig={true} />,
        },
        {
            title: t("levelA2"),
            allExams: (
                <div>
                    <CircularProgressMagic
                        max={100}
                        min={0}
                        value={((stats?.doneCountByLevel["A2"] || 0) / (stats?.allexamsByLevel["A2"] || 1)) * 100 || 0}
                        gaugePrimaryColor="var(--secondary-5)"
                        gaugeSecondaryColor="var(--neutral-300)"
                        className="h-12 md:h-16"
                        fontHeight="text-sm md:text-lg"
                        withSize={false}
                    />
                </div>
            ),
            avg: <RenderStars stars={stats?.avgByLevel["A2"] || null} areBig={true} />,
        },
        {
            title: t("levelB1"),
            allExams: (
                <CircularProgressMagic
                    max={100}
                    min={0}
                    value={((stats?.doneCountByLevel["B1"] || 0) / (stats?.allexamsByLevel["B1"] || 1)) * 100 || 0}
                    gaugePrimaryColor="var(--secondary-5)"
                    gaugeSecondaryColor="var(--neutral-300)"
                    className="h-12 md:h-16"
                    fontHeight="text-sm md:text-lg"
                    withSize={false}
                />
            ),
            avg: <RenderStars stars={stats?.avgByLevel["B1"] || null} areBig={true} />,
        },
    ];

    return (
        <div
            className="rounded-xl p-[2px] mt-6 max-w-2xl w-full"
            style={{
                background: "linear-gradient(to bottom right, var(--secondary-5), var(--secondary-5))",
            }}
        >
            <div
                className="py-2 md:py-4 pl-4 md:pl-8 rounded-xl w-full grid grid-cols-6 lg:grid-cols-6 text-neutral-800"
                style={{ background: "linear-gradient(to bottom right, var(--neutral-200), var(--neutral-100))" }}
            >
                <div className="col-span-4 flex flex-col">
                    <div className="grid grid-cols-3 gap-8 pr-4">
                        <div className="col-span-2 flex items-center">
                            <div className="mb-0 text-xl"></div>
                        </div>
                        <div className="col-span-1 flex items-center justify-center min-h-[45px]">
                            <p className="mb-0 w-full text-center leading-tight text-sm md:text-base font-bold">{t("headings.allExams")}</p>
                        </div>
                    </div>
                    {dataStatsTabel.map((row, index) => {
                        const borderBottom = index !== dataStatsTabel.length - 1 ? "1px solid var(--secondary-5)" : "none";
                        return (
                            <div key={row.title || "sans titre"} className="grid grid-cols-3 gap-8 pr-4 min-h-24">
                                <div className="col-span-2 min-h-16 flex items-center" style={{ borderBottom }}>
                                    <div className="block mb-0 leading-tight">{row.title}</div>
                                </div>
                                <div className="col-span-1 min-h-16 flex items-center justify-center" style={{ borderBottom }}>
                                    <div className="mb-0 w-full text-center leading-tight">{row.allExams}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="col-span-2 lg:col-span-2 grid grid-cols-5">
                    <div className="col-span-5 lg:col-span-4 relative">
                        <div
                            className="rounded-xl absolute top-0 z-10 flex flex-col justify-center items-center p-4 md:px-8"
                            style={{
                                border: "2px solid var(--secondary-5)",
                                top: "50%",
                                transform: "translateY(-50%)",
                                height: "calc(100% + 60px)",
                                background: "linear-gradient(to bottom right, var(--neutral-200), var(--neutral-100))",
                                width: "calc(100% + 2px)",
                            }}
                        >
                            <div className="flex justify-center items-center w-full min-h-[45px]">
                                <p className="mb-0 w-full text-center leading-tight text-sm md:text-base font-bold">{t("headings.avg")}</p>
                            </div>
                            {dataStatsTabel.map((row, index) => {
                                const borderBottom = index !== dataStatsTabel.length - 1 ? "1px solid var(--secondary-5)" : "none";
                                return (
                                    <div key={row.title || "sans titre"} className="flex justify-center items-center min-h-24 w-full" style={{ borderBottom }}>
                                        <p className="mb-0 w-full text-center leading-tight">{row.avg}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="hidden lg:block col-span-1"></div>
                </div>
            </div>
        </div>
    );
};
