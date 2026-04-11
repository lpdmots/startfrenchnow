import { VideoFide } from "../../components/VideoFide";
import { FideCourseRatings } from "@/app/components/sfn/courses/FideCourseRatings";

export function WhatIsPackFideSection() {
    return (
        <section className="bg-neutral-800 color-neutral-100 text-neutral-200 py-12 lg:py-24 px-4 lg:px-8">
            <div className="max-w-7xl m-auto">
                <h2 className="display-2 mb-8 lg:mb-12 text-left text-neutral-200">
                    Qu'est-ce que le <span className="heading-span-secondary-6">pack FIDE</span> ?
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 xl:gap-12 lg:items-center">
                    <div className="lg:col-span-5 flex flex-col gap-4 lg:gap-6 order-2 lg:order-1 lg:h-full lg:justify-center">
                        <div className="flex gap-2 lg:gap-4">
                            <div className="bullet bg-secondary-4 mt-[1px] md:mt-2"></div>
                            <p className="text-lg lg:text-2xl mb-0">
                                Atteignez vos objectifs FIDE avec la <b className="underline decoration-secondary-4">plateforme e-learning</b> la plus complète sur l'examen.
                            </p>
                        </div>
                        <div className="flex gap-2 lg:gap-4">
                            <div className="bullet bg-secondary-5 mt-[1px] md:mt-2"></div>
                            <p className="text-lg lg:text-2xl mb-0">
                                Pratiquez directement sur <b className="underline decoration-secondary-5">les scénarios actuels</b> de l'examen, toujours à jour.
                            </p>
                        </div>
                        <div className="flex gap-2 lg:gap-4">
                            <div className="bullet bg-secondary-2 mt-[1px] md:mt-2"></div>
                            <p className="text-lg lg:text-2xl mb-0">
                                Bénéficiez de l'accompagnement continu d'un véritable <b className="underline decoration-secondary-2">expert FIDE</b>.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <VideoFide
                            videoKey="fide/videopresentation-soustitres-encode.mp4"
                            subtitle="Découvrez notre préparation FIDE"
                            poster="/images/fide-presentation-thumbnail.png"
                            isAnimated={false}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-around items-center w-full mt-8 lg:mt-10">
                    <p className="mb-0 display-3 shrink-0 text-center font-bold w-full sm:w-auto text-neutral-200">
                        Une méthode <span className="heading-span-secondary-6">validée</span>
                    </p>
                    <div className="flex justify-center items-center">
                        <FideCourseRatings />
                    </div>
                </div>
            </div>
        </section>
    );
}
