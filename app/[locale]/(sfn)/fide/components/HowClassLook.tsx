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
        <div className="grid grid-cols-1 w-full gap-8 lg:grid-cols-12 lg:gap-12">
            <div className="order-2 flex items-center lg:order-1 lg:col-span-5">
                <div className="grid-1-column gap-4 lg:gap-8">
                    {STEPS.map(({ title, description, icon, background }) => (
                        <Scale className="card grid grid-cols-5 overflow-hidden border-neutral-800" key={title}>
                            <>
                                <div className={`${background} flex justify-center items-center col-span-1`}>
                                    <div className="text-[var(--neutral-800)] text-4xl lg:text-5xl">{icon}</div>
                                </div>
                                <div className="flex w-full p-[45px_40px] justify-between items-center gap-x-[34px] max-[767px]:p-[35px_24px] max-[767px]:gap-x-[24px] max-[767px]:gap-y-[24px] max-[479px]:flex-wrap-reverse p-2 lg:p-4 col-span-4">
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
            <div className="order-1 flex flex-col gap-8 lg:order-2 lg:col-span-7">
                <div>
                    <SlideFromBottom>
                        <h2 className="display-2 text-center mb-[56px] max-[767px]:mb-[48px] max-[479px]:mb-[40px] text-neutral-100">
                            {t.rich("title1", intelRich())}
                            <br />
                            {t.rich("title2", intelRich())}
                        </h2>
                    </SlideFromBottom>
                </div>
                <div>
                    <div className="h-auto w-full">
                        <SlideFromBottom>
                            <>
                                <VideoFide videoKey={t("videoKey")} poster={t("posterImage")} subtitleFRUrl="fide/apercu-d-une-classe.vtt" />
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
