import { SlideFromBottom, SlideFromRight } from "@/app/components/animations/Slides";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import Image from "next/image";
import { AiOutlineTags } from "react-icons/ai";
import { FaCheck, FaTimes } from "react-icons/fa";

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
            <div className="lg:grid lg:grid-cols-5 gap-6 lg:gap-12 w-full">
                <div className="flex flex-col items-center lg:col-span-2 mb-6 lg:mb-0 w-full justify-center gap-4">
                    <div className="flex flex-col w-full gap-4 sm:gap-8 justify-center" style={{ maxWidth: 300 }}>
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
                            <p className="text-xl lg:text-3xl font-bold mb-0">{t("formateurName")}</p>
                        </div>
                    </div>
                    <div className="flex w-full justify-center">
                        <Link href="#priceSliderFide" className="no-underline w-full sm:w-auto">
                            <ShimmerButton className="w-button flex items-center justify-center w-full sm:w-auto" variant="secondary">
                                <AiOutlineTags className="mr-2 text-xl" />
                                {t("cta")}
                            </ShimmerButton>
                        </Link>
                    </div>
                </div>
                <div className="col-span-3">
                    <div className="flex flex-col gap-4 lg:gap-8 color-neutral-300">
                        <ComparativeTabel />
                    </div>
                </div>
            </div>
            <SlideFromBottom>
                <div className="flex justify-center">
                    <div className="mb-0 max-w-2xl text-center text-lg md:text-xl mt-4 lg:mt-0">{t.rich("citation", intelRich())}</div>
                </div>
            </SlideFromBottom>
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

const ComparativeTabel = () => {
    const t = useTranslations("Fide.Formateur.ComparativeTabel");

    const dataComparativTabel = [
        {
            title: t("titles.FIDE_Expertise"),
            smallTitle: t("smallTitles.FIDE_Expertise"),
            sfn: <FaCheck className="h-6 w-6 text-secondary-5" />,
            others: <FaCheck className="h-6 w-6 text-secondary-5" />,
        },
        {
            title: t("titles.Personalized_Preparation"),
            smallTitle: t("smallTitles.Personalized_Preparation"),
            sfn: <FaCheck className="h-6 w-6 text-secondary-5" />,
            others: <FaCheck className="h-6 w-6 text-secondary-5" />,
        },
        {
            title: t("titles.Flexible_Scheduling"),
            smallTitle: t("smallTitles.Flexible_Scheduling"),
            sfn: <FaCheck className="h-6 w-6 text-secondary-5" />,
            others: <FaTimes className="h-6 w-6 text-secondary-4" />,
        },
        {
            title: t("titles.Latest_Scenarios"),
            smallTitle: t("smallTitles.Latest_Scenarios"),
            sfn: <FaCheck className="h-6 w-6 text-secondary-5" />,
            others: <FaTimes className="h-6 w-6 text-secondary-4" />,
        },
        {
            title: t("titles.Self_Study_Platform"),
            smallTitle: t("smallTitles.Self_Study_Platform"),
            sfn: <FaCheck className="h-6 w-6 text-secondary-5" />,
            others: <FaTimes className="h-6 w-6 text-secondary-4" />,
        },
        {
            title: t("titles.Continuous_Support"),
            smallTitle: t("smallTitles.Continuous_Support"),
            sfn: <FaCheck className="h-6 w-6 text-secondary-5" />,
            others: <FaTimes className="h-6 w-6 text-secondary-4" />,
        },
        {
            title: t("titles.Price_Hour"),
            smallTitle: t("smallTitles.Price_Hour"),
            sfn: <span>{t.rich("offers.Price_From", intelRich())}</span>,
            others: <span>{t.rich("offers.Others_Range", intelRich())}</span>,
        },
    ];

    return (
        <div
            className="rounded-xl p-[2px] mt-6"
            style={{
                background: "linear-gradient(to bottom right, var(--secondaryShades-2), var(--secondary-2))",
            }}
        >
            <div
                className="py-2 md:py-4 pl-4 md:pl-8 rounded-xl w-full grid grid-cols-6 lg:grid-cols-6 text-neutral-200"
                style={{ background: "linear-gradient(to bottom right, var(--neutral-700), var(--neutral-800))" }}
            >
                <div className="col-span-4 flex flex-col">
                    <div className="grid grid-cols-3 gap-8 pr-4">
                        <div className="col-span-2 flex items-center">
                            <div className="mb-0 text-xl"></div>
                        </div>
                        <div className="col-span-1 flex items-center justify-center min-h-[45px]">
                            <p className="mb-0 w-full text-center leading-tight text-sm md:text-base">{t("headings.Others")}</p>
                        </div>
                    </div>
                    {dataComparativTabel.map((row, index) => {
                        const borderBottom = index !== dataComparativTabel.length - 1 ? "1px solid var(--secondary-2)" : "none";
                        return (
                            <div key={row.title || "sans titre"} className="grid grid-cols-3 gap-8 pr-4">
                                <div className="col-span-2 min-h-16 flex items-center" style={{ borderBottom }}>
                                    <div className="hidden md:block mb-0 text-xl leading-tight">{row.title}</div>
                                    <div className="block md:hidden mb-0 text-lg leading-tight">{row.smallTitle}</div>
                                </div>
                                <div className="col-span-1 min-h-16 flex items-center justify-center" style={{ borderBottom }}>
                                    <p className="mb-0 w-full text-center leading-tight">{row.others}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="col-span-2 lg:col-span-2 grid grid-cols-5">
                    <div className="col-span-5 lg:col-span-4 relative">
                        <SlideFromRight>
                            <div
                                className="rounded-xl absolute top-0 z-10 flex flex-col justify-center items-center p-4 px-8"
                                style={{
                                    border: "2px solid var(--secondary-2)",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    height: "calc(100% + 60px)",
                                    background: "linear-gradient(to bottom right, var(--neutral-750), var(--neutral-800))",
                                    width: "calc(100% + 2px)",
                                }}
                            >
                                <div className="flex justify-center items-center w-full min-h-[45px]">
                                    <p className="mb-0 w-full text-center leading-tight text-sm md:text-base">{t("headings.OurOffer")}</p>
                                </div>
                                {dataComparativTabel.map((row, index) => {
                                    const borderBottom = index !== dataComparativTabel.length - 1 ? "1px solid var(--secondary-2)" : "none";
                                    return (
                                        <div key={row.title || "sans titre"} className="flex justify-center items-center min-h-16 w-full" style={{ borderBottom }}>
                                            <p className="mb-0 w-full text-center leading-tight">{row.sfn}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </SlideFromRight>
                    </div>
                    <div className="hidden lg:block col-span-1"></div>
                </div>
            </div>
        </div>
    );
};

/* 
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
*/
