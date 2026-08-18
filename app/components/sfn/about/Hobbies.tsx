import { GiCroissant, GiMountainRoad, GiRunningShoe } from "react-icons/gi";
import { IoBeer, IoLanguageSharp } from "react-icons/io5";
import { SiYourtraveldottv } from "react-icons/si";
import { ImFilm } from "react-icons/im";
import { MdOutlineEmail } from "react-icons/md";
import { Link } from "@/i18n/navigation";
import { SlideFromBottom } from "../../animations/Slides";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

const HOBBIES = [
    {
        key: "languages",
        icon: <IoLanguageSharp style={{ fontSize: "79px" }} />,
        background: "bg-secondary-1",
    },
    {
        key: "travel",
        icon: <SiYourtraveldottv style={{ fontSize: "79px" }} />,
        background: "bg-neutral-200",
    },
    {
        key: "running",
        icon: <GiRunningShoe style={{ fontSize: "79px" }} />,
        background: "bg-neutral-200",
    },
    {
        key: "mountains",
        icon: <GiMountainRoad style={{ fontSize: "79px" }} />,
        background: "bg-neutral-200",
    },
    {
        key: "films",
        icon: <ImFilm style={{ fontSize: "79px" }} />,
        background: "bg-neutral-200",
    },
    {
        key: "croissants",
        icon: <GiCroissant style={{ fontSize: "79px" }} />,
        background: "bg-neutral-200",
    },
    {
        key: "goingOut",
        icon: <IoBeer style={{ fontSize: "79px" }} />,
        background: "bg-neutral-200",
    },
] as const;

function Hobbies() {
    const t = useTranslations("About.Hobbies");
    return (
        <section className="section wf-section pt-0" data-about-hobbies>
            <div className="container-default w-container">
                <div className="inner-container _500px---mbl center">
                    <SlideFromBottom>
                        <div className="mx-auto mb-12 max-w-[720px] text-center md:mb-14">
                            <h2 className="display-2 mb-4">{t.rich("title", intelRich())}</h2>
                            <p className="mb-0">{t("intro")}</p>
                        </div>
                    </SlideFromBottom>
                    <div className="inner-container max-w-[1100px] center">
                        <SlideFromBottom delay={0.1}>
                            <div className="mb-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {HOBBIES.map(({ key, icon, background }) => (
                                    <article className="card grid h-full grid-cols-[76px_1fr] overflow-hidden md:grid-cols-[96px_1fr]" key={key}>
                                        <div className={`flex items-center justify-center [border-right:3px_solid_var(--neutral-800)] ${background}`} aria-hidden="true">
                                            <div className="scale-[0.62] text-neutral-800 md:scale-75">{icon}</div>
                                        </div>
                                        <div className="p-6 md:p-8">
                                            <h3 className="display-4 mb-3">{t(`items.${key}.title`)}</h3>
                                            <p className="mb-0 text-sm leading-relaxed md:text-base">{t(`items.${key}.description`)}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </SlideFromBottom>
                    </div>
                    <div className="buttons-row center">
                        <Link href="/contact" className="btn-primary button-row w-button">
                            <div className="flex items-center justify-center">
                                <MdOutlineEmail className="mr-2" />
                                {t("button")}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hobbies;
