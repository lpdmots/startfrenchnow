import { SlideFromBottom, SlideInOneByOneChild, SlideInOneByOneParent } from "@/app/components/animations/Slides";
import { Link } from "@/i18n/navigation";
import { ArrowRight, BookOpen, FileCheck2 } from "lucide-react";
import Image from "next/image";

export function PrivateCoursesNextStepsSection({ locale }: { locale: string }) {
    const isFr = locale === "fr";

    const content = isFr
        ? {
              badge: "Aller plus loin",
              titlePrefix: "Complétez votre",
              titleHighlight: "préparation",
              titleSuffix: "FIDE",
              subtitle: "Combinez cours privés, examens blancs et Pack FIDE e-learning pour une progression plus structurée.",
              pack: {
                  title: "Pack FIDE e-learning",
                  description: "Scénarios actuels, vidéos et ressources pour progresser entre vos cours.",
                  cta: "Voir le pack",
              },
              mockExams: {
                  title: "Examens blancs FIDE",
                  description: "Entraînez-vous en conditions proches du test et suivez votre progression.",
                  cta: "Voir les examens blancs",
              },
          }
        : {
              badge: "Go further",
              titlePrefix: "Complete your",
              titleHighlight: "FIDE preparation",
              titleSuffix: "",
              subtitle: "Combine private coaching, mock exams, and the FIDE e-learning pack for a more structured progression.",
              pack: {
                  title: "FIDE e-learning pack",
                  description: "Current scenarios, videos, and resources to improve between private lessons.",
                  cta: "See the pack",
              },
              mockExams: {
                  title: "FIDE mock exams",
                  description: "Train in realistic conditions and track your progress before exam day.",
                  cta: "See mock exams",
              },
          };

    return (
        <section id="private-courses-next-steps" className="pt-4 pb-14 lg:pt-8 lg:pb-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <div className="p-0">
                    <SlideFromBottom delay={0.05} duration={0.35}>
                        <div className="mx-auto mb-8 max-w-3xl text-center">
                            <p className="mb-3 inline-flex rounded-full bg-secondary-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">{content.badge}</p>
                            <h2 className="display-3 mb-2">
                                {content.titlePrefix} <span className="heading-span-secondary-2">{content.titleHighlight}</span> {content.titleSuffix}
                            </h2>
                            <p className="mb-0 text-base text-neutral-700 md:text-lg">{content.subtitle}</p>
                        </div>
                    </SlideFromBottom>

                    <SlideInOneByOneParent delay={0.05} delayChildren={0.1} duration={0.35}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                            <SlideInOneByOneChild duration={0.35}>
                                <Link
                                    href="/fide/pack-fide"
                                    className="group block h-full !no-underline rounded-2xl border border-neutral-300 bg-neutral-100 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-6 hover:shadow-md"
                                >
                                    <div className="mb-4 flex justify-center overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 p-2">
                                        <Image
                                            src="/images/pack-fide-hero.png"
                                            alt="Aperçu du Pack FIDE"
                                            width={1200}
                                            height={675}
                                            sizes="(min-width: 768px) 420px, 100vw"
                                            className="h-auto w-full max-h-96 max-w-[420px] object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                                        />
                                    </div>
                                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondaryShades-4">
                                        <BookOpen className="h-5 w-5 text-secondary-6" />
                                    </div>
                                    <p className="mb-1 text-lg font-bold text-neutral-800">{content.pack.title}</p>
                                    <p className="mb-4 text-sm text-neutral-700">{content.pack.description}</p>
                                    <p className="mb-0 mt-auto inline-flex items-center gap-2 text-sm font-semibold text-secondary-6">
                                        {content.pack.cta}
                                        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </p>
                                </Link>
                            </SlideInOneByOneChild>

                            <SlideInOneByOneChild duration={0.35}>
                                <Link
                                    href="/fide/mock-exams"
                                    className="group block h-full !no-underline rounded-2xl border border-neutral-300 bg-neutral-100 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-secondary-5 hover:shadow-md"
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
                        </div>
                    </SlideInOneByOneParent>
                </div>
            </div>
        </section>
    );
}
