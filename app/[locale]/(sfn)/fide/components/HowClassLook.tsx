import { SlideFromBottom } from "@/app/components/animations/Slides";
import { Scale } from "@/app/components/animations/Scale";
import { VideoFide } from "./VideoFide";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

function HowClassLook() {
    const t = useTranslations("Fide.HowClassLook");

    const STEPS = [
        {
            icon: "🗣️",
            title: "steps.oralProduction.title",
            description: "steps.oralProduction.description",
            background: "bg-secondary-1",
        },
        {
            icon: "🎧",
            title: "steps.listeningReading.title",
            description: "steps.listeningReading.description",
            background: "bg-secondary-4",
        },
        {
            icon: "✍️",
            title: "steps.homeworkExercises.title",
            description: "steps.homeworkExercises.description",
            background: "bg-secondary-2",
        },
    ];

    return (
        <div className="grid grid-cols-2 w-full gap-8 lg:gap-12">
            <div className="col-span-2 lg:col-span-1 order-2 lg:order-1 flex items-center">
                <div className="grid-1-column gap-4">
                    {STEPS.map(({ title, description, icon, background }) => (
                        <Scale className="card grid grid-cols-5 overflow-hidden border-neutral-800" key={title}>
                            <>
                                <div className={`${background} flex justify-center items-center col-span-1`}>
                                    <div className="resume-card-period-v2 text-5xl">{icon}</div>
                                </div>
                                <div className="resume-card-content-rigth p-2 lg:p-4 col-span-4">
                                    <div className="inner-container">
                                        <h3 className="display-4">{t(title)}</h3>
                                        <p className="color-neutral-800 mb-0 text-sm">{t(description)}</p>
                                    </div>
                                </div>
                            </>
                        </Scale>
                    ))}
                </div>
            </div>
            <div className="col-span-2 lg:col-span-1 flex flex-col gap-8 order-1 lg:order-2">
                <div>
                    <SlideFromBottom>
                        <h2 className="display-2 text-center mg-bottom-56px color-neutral-100">{t.rich("title", intelRich())}</h2>
                    </SlideFromBottom>
                </div>
                <div>
                    <div className="h-auto w-full">
                        <SlideFromBottom>
                            <>
                                <VideoFide videoKey={t("videoKey")} poster={t("posterImage")} />
                                <p className="mt-8 text-lg w-full text-center">{t.rich("videoDescription", intelRich())}</p>
                            </>
                        </SlideFromBottom>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HowClassLook;
