"use client";

import Link from "next-intl/link";
import { motion } from "framer-motion";
import { LuBarChart3, LuClock, LuFileCheck2, LuCheckCircle2, LuActivity } from "react-icons/lu";
import { LucideSparkles } from "lucide-react";
import Image from "next/image";
import { HiCheckCircle } from "react-icons/hi";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { LinkArrowToFideExams } from "@/app/components/common/LinkToFideExams";

export default function ExamsSection({
    stats = { totalExams: 100, avgDurationMin: 12, completionRate: 0.82 },
    hasPack,
}: {
    stats?: { totalExams: number; avgDurationMin: number; completionRate: number };
    hasPack?: boolean;
}) {
    const { totalExams, avgDurationMin, completionRate } = stats;

    return (
        <section id="exams" className="w-full bg-white py-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                {/* Header */}
                <header className="mb-12">
                    <h2 className="display-2">
                        <span className="heading-span-secondary-5">Testez-vous</span> avec <u>{totalExams}+ examens</u> blancs
                    </h2>
                    <p>Passez des examens proches du jour J, obtenez votre score instantanément et suivez votre progression jusqu’à l’examen.</p>
                </header>

                {/* Benefits */}
                <div className="mb-4 lg:mb-12 grid grid-cols-1 lg:grid-cols-7 gap-12">
                    <div className="col-span-1 lg:col-span-3 grid grid-cols-2 gap-2 xl:gap-4">
                        <BenefitCard
                            icon={<LuActivity className="text-xl" />}
                            title="Progression suivie"
                            desc="Vos notes et tentatives sont enregistrées dans un tableau de bord, avec des statistiques par niveau."
                            color="bg-secondary-4"
                        />
                        <BenefitCard
                            icon={<LucideSparkles className="text-xl" />}
                            title="Feedback immédiat (IA)"
                            desc="Après chaque question, la correction s’affiche directement pour vous aider à comprendre vos erreurs."
                            color="bg-secondary-2"
                        />
                        <BenefitCard
                            icon={<LuFileCheck2 className="text-xl" />}
                            title="Format réaliste"
                            desc="Exercices conformes au format officiel pour vous mettre en condition le jour J."
                            color="bg-secondary-1"
                        />
                        <BenefitCard
                            icon={<LuBarChart3 className="text-xl" />}
                            title="Variété de sujets"
                            desc="Un large éventail de thématiques pour éviter la répétition et couvrir l’essentiel."
                            color="bg-secondary-5"
                        />
                    </div>
                    <div className="col-span-1 lg:col-span-4 flex justify-center items-center">
                        <Image src="/images/examsMobile.png" alt="Infographie sur les examens" layout="responsive" width={800} height={500} className="w-full h-auto object-contain max-w-2xl" />
                    </div>
                </div>

                {/* Mini Infographie */}
                <motion.ol
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8 lg:mb-12 grid grid-cols-1 gap-2 md:gap-6 md:grid-cols-3"
                >
                    <StepCard step={1} title="Choisissez un examen" desc="Prenez le niveau et la compétence que vous souhaitez réviser." />
                    <StepCard step={2} title="Passez-le en ligne" desc="Cliquez pour répondre (A1–A2) ou entraînez-vous à l’oral (B1)." />
                    <StepCard step={3} title="Obtenez votre score" desc="Accédez aussitôt à la correction et à vos progrès." />
                </motion.ol>

                {/* CTAs */}
                <div className="flex gap-4 justify-center items-center w-full flex-wrap">
                    <LinkArrowToFideExams className="text-xl font-bold text-neutral-700" category="culture">
                        <span className="flex items-center">
                            <HiCheckCircle className="text-6xl mr-2 text-secondary-5" /> <span>Voir tous les examens disponibles</span>
                        </span>
                    </LinkArrowToFideExams>
                    {hasPack ? (
                        <Link href="/fide#priceSliderFide" className="w-full sm:w-auto !no-underline">
                            <ShimmerButton className="w-button flex items-center justify-center w-full sm:w-auto">Acheter des cours privés</ShimmerButton>
                        </Link>
                    ) : (
                        <Link href="#plans" className="w-full sm:w-auto !no-underline">
                            <ShimmerButton className="w-button flex items-center justify-center w-full sm:w-auto">Obtenir le Pack FIDE</ShimmerButton>
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}

/* --------------------- Sub-components --------------------- */

function StatBadge({ icon, label, desc }: { icon: React.ReactNode; label: string; desc: string }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-neutral-700 shadow-sm">{icon}</div>
            <div>
                <div className="text-base font-semibold text-neutral-900">{label}</div>
                <div className="text-neutral-600">{desc}</div>
            </div>
        </div>
    );
}

function BenefitCard({ icon, title, desc, color }: { icon: React.ReactNode; title: string; desc: string; color: string }) {
    return (
        <div className="col-span-2 md:col-span-1 lg:col-span-2 rounded-xl border border-solid border-neutral-800 p-2 xl:p-4 shadow-sm flex flex-nowrap gap-2 xl:gap-4 items-center">
            <div className={`m-2 h-12 w-12 rounded-xl shrink-0 ${color}`}>
                <div className="flex w-full h-full justify-center items-center">{icon}</div>
            </div>
            <div>
                <p className="font-semibold mb-0">{title}</p>
                <p className="m-0 text-sm text-neutral-600">{desc}</p>
            </div>
        </div>
    );
}

function StepCard({ step, title, desc }: { step: number; title: string; desc: string }) {
    return (
        <li className="relative rounded-2xl p-2 lg:p-5 mb-0">
            <div className="mt-0 lg:mt-2">
                <div className="font-semibold text-neutral-900">{title}</div>
                <p className="m-0 mt-1 text-sm text-neutral-600">{desc}</p>
            </div>
        </li>
    );
}
