import ShimmerButton from "@/app/components/ui/shimmer-button";
import { PiArrowBendRightDownDuotone } from "react-icons/pi";
import { VideoFide } from "../../components/VideoFide";
import Link from "next-intl/link";

export function HeroPackFide({ hasPack }: { hasPack: boolean }) {
    const BULLETS: Array<{ title: string; desc: string; emoji: string }> = [
        {
            title: "Parcours structuré",
            desc: "Leçons par niveaux avec objectifs clairs et progression mesurable.",
            emoji: "🧭",
        },
        {
            title: "Examens blancs réalistes",
            desc: "Plus de 100 épreuves type avec correction immédiate.",
            emoji: "✅",
        },
        {
            title: "Accès à vie + mises à jour",
            desc: "Mises à jour incluses si le format FIDE évolue.",
            emoji: "♾️",
        },
        {
            title: "Accès aux sujets récents",
            desc: "Prenez un coaching privé et entraînez-vous sur les thèmes d’examen les plus actuels.",
            emoji: "🎓",
        },
    ];

    return (
        <>
            <section className="section hero v1 wf-section !pb-24 !pt-8 flex flex-col justify-between gap-8 px-4 xl:px-8" style={{ minHeight: "70vh" }}>
                <div className="flex flex-col items-center-center">
                    <h1 className="display-1 w-full text-center mb-6">
                        FIDE : préparez, <span className="heading-span-secondary-6">progressez</span>
                    </h1>
                    <div className="w-full text-center">
                        <p className="text-neutral-700 mb-0 w-full text-sm md:text-lg xl:text-xl">
                            Prenez <span className="underline font-bold">5 minutes pour découvrir</span>
                            <span className="block sm:inline"> notre pack FIDE.</span>
                            <span className="relative">
                                <PiArrowBendRightDownDuotone className="text-2xl md:text-4xl absolute left-2 -bottom-6" />
                            </span>
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-9 gap-8 w-full flex-grow">
                    <div className="col-span-1 xl:col-span-5 xl:col-start-3 xl:row-start-1 flex items-center h-full">
                        <div className="flex justify-center w-full">
                            <div className="max-w-3xl">
                                <VideoFide videoKey="fide/video-presentation-fide.mp4" poster="/images/fide-presentation-thumbnail.png" />
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 xl:col-span-9 xl:row-start-2 flex justify-center gap-4">
                        {hasPack ? (
                            <>
                                <Link href="/fide/dashboard" className="btn btn-secondary hidden md:block">
                                    Reprendre les cours
                                </Link>
                                <Link href="/fide#priceSliderFide" className="!no-underline w-full sm:w-auto">
                                    <ShimmerButton className="w-button flex items-center justify-center w-full sm:w-auto">Acheter des cours privés</ShimmerButton>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="#plans" className="btn btn-secondary hidden md:block">
                                    Acheter le Pack
                                </Link>
                                <Link href="#previews-section" className="!no-underline w-full sm:w-auto">
                                    <ShimmerButton className="w-button flex items-center justify-center w-full sm:w-auto">Essayer gratuitement</ShimmerButton>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="hidden col-span-2 col-start-1 xl:flex flex-col gap-4 justify-start">
                        <BulletComponent {...BULLETS[0]} />
                        <BulletComponent {...BULLETS[1]} />
                    </div>

                    <div className="hidden col-span-2 col-start-8 xl:flex flex-col gap-4 xl:justify-end">
                        <BulletComponent {...BULLETS[2]} />
                        <BulletComponent {...BULLETS[3]} />
                    </div>

                    <div className="flex w-full justify-center xl:hidden col-span-1">
                        <div className="max-w-md grid grid-cols-2 gap-4">
                            <div className="col-span-1 flex flex-col gap-4 justify-start">
                                <BulletComponent {...BULLETS[0]} />
                                <BulletComponent {...BULLETS[1]} />
                            </div>

                            <div className="col-span-1 flex flex-col gap-4 justify-start">
                                <BulletComponent {...BULLETS[2]} />
                                <BulletComponent {...BULLETS[3]} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

const BulletComponent = ({ title, desc, emoji }: { title: string; desc: string; emoji: string }) => {
    return (
        <div className="flex items-start gap-4 xl:px-4">
            <span className="text-2xl">{emoji}</span>
            <div>
                <h4 className="mb-0 text-sm sm:text-base font-normal xl:font-semibold">{title}</h4>
                <p className="hidden xl:block text-sm">{desc}</p>
            </div>
        </div>
    );
};
