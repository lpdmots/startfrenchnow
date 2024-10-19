import { SlideFromBottom, SlideFromLeft } from "@/app/components/animations/Slides";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";

export const Formateur = () => {
    const t = useTranslations("Fide.Formateur");

    let COMPETENCES = [
        {
            description: t("competences.description1"),
            icon: "🎓",
            color: "#00C9A7",
        },
        {
            description: t("competences.description2"),
            icon: "🎉",
            color: "#FF3D71",
        },
        {
            description: t("competences.description3"),
            icon: "📚",
            color: "#FFB800",
        },
        {
            description: t("competences.description4"),
            icon: "🏅",
            color: "#1E86FF",
        },
    ];

    return (
        <div className="section hero v1 wf-section !py-24 px-4 lg:px-8 flex flex-col items-center max-w-7xl gap-6 lg:gap-12">
            <h2 className="mb-6 color-neutral-100 w-full text-center display-1">{t.rich("title", intelRich())}</h2>
            <SlideFromBottom>
                <div className="grid grid-cols-4 gap-4">
                    {COMPETENCES.map((item, idx) => (
                        <CompetenceCard {...item} key={idx} />
                    ))}
                </div>
            </SlideFromBottom>
            <div className="lg:grid lg:grid-cols-5 gap-6 lg:gap-12">
                <div className="flex items-center lg:col-span-2 mb-6 lg:mb-0 w-full justify-center">
                    <div className="flex flex-col w-full gap-4 sm:gap-8" style={{ maxWidth: 300 }}>
                        <div className="flex w-full items-center">
                            <Image
                                src="/images/yoh-coussot.png"
                                alt="Yohann Coussot"
                                width={300}
                                height={300}
                                className="w-full h-auto contain rounded-full col-span-1"
                                style={{ border: "3px solid var(--neutral-100)" }}
                            />
                        </div>
                        <div className="col-span-2 flex flex-col justify-center items-center">
                            <p>{t("formateurTitle")}</p>
                            <p className="text-xl lg:text-3xl font-bold">{t("formateurName")}</p>
                            {/* <p className="color-neutral-600">{t("formateurRole")}</p> */}
                        </div>
                    </div>
                </div>
                <div className="col-span-3">
                    <div className="flex flex-col gap-4 lg:gap-8 color-neutral-300">
                        <div className="flex gap-2 lg:gap-4 items-center">
                            <div className="bullet bg-secondary-2"></div>
                            <p className="mb-0">{t.rich("point1", intelRich())}</p>
                        </div>
                        <div className="flex gap-2 lg:gap-4 items-center">
                            <div className="bullet bg-secondary-4"></div>
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
                            <div className="bullet bg-secondary-2"></div>
                            <p className="mb-0">{t.rich("point5", intelRich())}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface Competence {
    description: string;
    icon: string;
    color: string;
}

const CompetenceCard = ({ description, icon, color }: Competence) => {
    return (
        <div className="col-span-4 md:col-span-2 xl:col-span-1 p-2 lg:p-4 rounded-xl w-full bg-neutral-200 color-neutral-800 flex items-center">
            <div className="flex w-full gap-4 place-items-center">
                <div
                    className="flex size-16 items-center justify-center rounded-2xl col-span-1 aspect-square"
                    style={{
                        backgroundColor: color,
                    }}
                >
                    <span className="text-4xl">{icon}</span>
                </div>
                <p className="text-sm mb-0 h-full flex items-center w-full">{description}</p>
            </div>
        </div>
    );
};
