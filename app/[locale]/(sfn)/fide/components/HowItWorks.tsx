import { ParentToChildrens, ScaleChildren } from "@/app/components/animations/ParentToChildrens";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import clsx from "clsx";
import Link from "next-intl/link";

const steps: Array<{
    id: string;
    number: number;
    title: string;
    desc: string;
    icon: string;
    href: string;
    badgeBg: string;
}> = [
    {
        id: "discover",
        number: 1,
        title: "1. Découvrir",
        desc: "Parcourez la page à votre rythme, ou réservez un entretien gratuit.",
        icon: "📺",
        href: "#", // ou ton ancre vers Calendly/section plan personnalisé
        badgeBg: "bg-secondary-1",
    },
    {
        id: "previews",
        number: 2,
        title: "2. Essayer",
        desc: "Profitez des aperçus gratuits disponibles sur la plateforme.",
        icon: "🎬",
        href: "#previews-section",
        badgeBg: "bg-secondary-2",
    },
    {
        id: "curriculum",
        number: 3,
        title: "3. S’entraîner",
        desc: "Suivez les leçons par niveaux avec objectifs clairs.",
        icon: "📚",
        href: "#videosSection",
        badgeBg: "bg-secondary-4",
    },
    {
        id: "exams",
        number: 4,
        title: "4. Se tester",
        desc: "Passez des examens blancs réalistes et mesurez vos progrès.",
        icon: "🏆",
        href: "#exams",
        badgeBg: "bg-secondary-5",
    },
];

export function HowItWorks() {
    return (
        <section id="how-it-works" className="relative w-full bg-neutral-800 py-24 px-4 lg:px-8">
            <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 ">
                {/* Titre */}
                <div className="text-center">
                    <h2 className="display-2 font-bold text-neutral-100">
                        <span className="heading-span-secondary-1">Comment</span> ça marche ?
                    </h2>
                    <p className="mt-2 text-neutral-300">Suivez les 4 étapes : découvrir → essayer → s’entraîner → se tester</p>
                </div>

                {/* Grille des étapes */}
                <SlideInOneByOneParent delayChildren={0}>
                    <div className={clsx("grid gap-6", "grid-cols-1 md:grid-cols-2 xl:grid-cols-4")}>
                        {steps.map((step, idx) => (
                            <div key={step.id} className={clsx("relative flex w-full justify-center", idx === 0 || idx === 2 ? "md:justify-end" : "md:justify-start")}>
                                <div>
                                    <SlideInOneByOneChild>
                                        <ParentToChildrens>
                                            <Link
                                                href={step.href}
                                                style={{ "--shadow-color": `var(--${step.badgeBg.slice(3)})` } as React.CSSProperties}
                                                className={clsx(
                                                    "card link-card flex flex-col h-full w-full max-w-80 relative overflow-hidden bg-neutral-800 border-2 border-solid border-neutral-100 transition-shadow duration-300 color-neutral-800",
                                                    `hover:!shadow-[5px_5px_0_0_var(--shadow-color)] data-[state=open]:!shadow-[5px_5px_0_0_var(--shadow-color)]`
                                                )}
                                            >
                                                <div aria-label={`${step.number}. ${step.title} – ouvrir la section`} className="p-6">
                                                    <div className="flex h-full flex-col items-center text-center">
                                                        <ScaleChildren>
                                                            <div className={clsx("flex size-20 items-center justify-center rounded-2xl col-span-1 aspect-square", step.badgeBg)}>
                                                                <span className="text-5xl">{step.icon}</span>
                                                            </div>
                                                        </ScaleChildren>

                                                        <div className="mt-3">
                                                            <div className="text-lg font-semibold text-neutral-100">{step.title}</div>
                                                            <p className="mt-1 text-sm text-neutral-300 mb-0">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </ParentToChildrens>
                                    </SlideInOneByOneChild>
                                </div>
                            </div>
                        ))}
                    </div>
                </SlideInOneByOneParent>
            </div>
        </section>
    );
}
