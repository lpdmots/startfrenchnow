import { SlideFromBottom, SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import { Link } from "@/i18n/navigation";
import { ArrowRight, FileCheck2, UserRound } from "lucide-react";
import Image from "next/image";

export function PackFideNextStepsSection({ locale }: { locale: string }) {
    const isFr = locale === "fr";

    const content = isFr
        ? {
              badge: "Compléter votre préparation",
              titlePrefix: "Ajoutez une couche de",
              titleHighlight: "confiance",
              titleSuffix: "avant l'examen",
              subtitle: "Combinez le pack e-learning avec des examens blancs et, si nécessaire, des cours privés ciblés.",
              mockExams: {
                  title: "Examens blancs FIDE",
                  description: "Mesurez votre niveau en conditions proches du test et recevez un plan d'action.",
                  cta: "Voir les examens blancs",
              },
              privateCourses: {
                  title: "Cours privés FIDE",
                  description: "Renforcez vos points faibles avec un coaching 1:1 centré sur vos besoins.",
                  cta: "Voir les cours privés",
              },
          }
        : {
              badge: "Complete your preparation",
              titlePrefix: "Add an extra layer of",
              titleHighlight: "confidence",
              titleSuffix: "before exam day",
              subtitle: "Combine the e-learning pack with mock exams and, when needed, targeted private coaching.",
              mockExams: {
                  title: "FIDE mock exams",
                  description: "Measure your level in realistic conditions and get a clear action plan.",
                  cta: "See mock exams",
              },
              privateCourses: {
                  title: "Private FIDE coaching",
                  description: "Strengthen weak points with 1:1 sessions tailored to your specific needs.",
                  cta: "See private coaching",
              },
          };

    return (
        <section id="pack-fide-next-steps" className="pt-4 pb-14 lg:pt-8 lg:pb-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <SlideFromBottom delay={0.05} duration={0.35}>
                    <div className="mx-auto mb-8 max-w-3xl text-center">
                        <p className="mb-3 inline-flex rounded-full bg-secondary-6 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">{content.badge}</p>
                        <h2 className="display-3 mb-2">
                            {content.titlePrefix} <span className="heading-span-secondary-6">{content.titleHighlight}</span> {content.titleSuffix}
                        </h2>
                        <p className="mb-0 text-base text-neutral-700 md:text-lg">{content.subtitle}</p>
                    </div>
                </SlideFromBottom>

                <SlideInOneByOneParent delay={0.05} delayChildren={0.1} duration={0.35}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                        <SlideInOneByOneChild duration={0.35}>
                            <Link
                                href="/fide/mock-exams"
                                className="group block h-full rounded-2xl border border-neutral-300 bg-neutral-100 p-5 !no-underline shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-5 hover:shadow-md"
                            >
                                <div className="mb-4 flex justify-center overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 p-2">
                                    <Image
                                        src="/images/mock-exam-hero2.png"
                                        alt="Aperçu des examens blancs FIDE"
                                        width={1200}
                                        height={675}
                                        sizes="(min-width: 768px) 420px, 100vw"
                                        className="h-auto w-full max-h-96 max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-5">
                                    <FileCheck2 className="h-5 w-5 text-secondary-5" />
                                </div>
                                <p className="mb-1 text-lg font-bold text-neutral-800">{content.mockExams.title}</p>
                                <p className="mb-4 text-sm text-neutral-700">{content.mockExams.description}</p>
                                <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-5">
                                    {content.mockExams.cta}
                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </p>
                            </Link>
                        </SlideInOneByOneChild>

                        <SlideInOneByOneChild duration={0.35}>
                            <Link
                                href="/fide/private-courses"
                                className="group block h-full rounded-2xl border border-neutral-300 bg-neutral-100 p-5 !no-underline shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-2 hover:shadow-md"
                            >
                                <div className="mb-4 flex justify-center overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 p-2">
                                    <Image
                                        src="/images/etudiante-cours.png"
                                        alt="Aperçu des cours privés FIDE"
                                        width={1200}
                                        height={675}
                                        sizes="(min-width: 768px) 420px, 100vw"
                                        className="h-auto w-full max-h-96 max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                                    />
                                </div>
                                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-2">
                                    <UserRound className="h-5 w-5 text-secondary-2" />
                                </div>
                                <p className="mb-1 text-lg font-bold text-neutral-800">{content.privateCourses.title}</p>
                                <p className="mb-4 text-sm text-neutral-700">{content.privateCourses.description}</p>
                                <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-2">
                                    {content.privateCourses.cta}
                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                </p>
                            </Link>
                        </SlideInOneByOneChild>
                    </div>
                </SlideInOneByOneParent>
            </div>
        </section>
    );
}
