// app/[locale]/fide/pack-fide/components/PricingSection.tsx
"use client";

import { PiArrowBendRightDownDuotone } from "react-icons/pi";
import { FreeCard, PriceCard } from "./PackFideCard";

const CARDS = [
    {
        image: "/images/pack-fide-icon.png",
        title: "Pack FIDE",
        subtitle: "Autonome",
        description: (
            <>
                <p className="bs mb-0" style={{ minHeight: 64 }}>
                    Une préparation complète et structurée, du niveau A1 à B1, à votre rythme.
                </p>
            </>
        ),
        price: 453,
        features: ["Parcours vidéo structuré A1 → B1", "100+ examens blancs", "Suivi des progrès et statistiques"],
        extras: ["Accès à vie + mises à jour incluses", "Satisfait ou remboursé"],
        color: "secondary-4",
        labelCTA: "ACHETER LE PACK",
        slugString: "pack-fide",
    },
    {
        image: "/images/pack-fide-accompagne.png",
        title: "Pack FIDE",
        subtitle: "Accompagné",
        description: (
            <>
                <p className="bs mb-0" style={{ minHeight: 64 }}>
                    Toute la préparation + 5 heures de <b>coaching</b> individuel <b>à prix réduit*</b>.
                </p>
            </>
        ),
        price: 750,
        features: ["Tous les avantages du Pack FIDE", "5 heures de cours privés en visio", "Accès aux sujets récents d’examen", "Conseils personnalisés"],
        extras: ["Garantie du Pack FIDE", "Confiance totale"],
        color: "secondary-1",
        labelCTA: "CHOISIR LA SÉCURITÉ",
        slugString: "pack-fide-accompagne",
    },
];

export function PricingPlans({ hasPack }: { hasPack?: boolean }) {
    return (
        <section id="plans" className="pt-24 pb-12">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                {/* Intro courte */}
                <div className="mb-10 text-center">
                    <h2 className="display-2">
                        <span className="heading-span-secondary-1">Choisissez</span> votre Pack FIDE
                    </h2>
                    <p className="text-lg">Une porte d’entrée gratuite, puis deux options selon votre besoin : autonomie ou accompagnement.</p>
                </div>
                <div className="w-full text-center mb-10">
                    <p className="text-neutral-700 mb-0 flex justify-end w-full pr-16 sm:pr-56 font-bold text-lg">
                        Votre meilleur choix
                        <span className="relative">
                            <PiArrowBendRightDownDuotone className="text-2xl md:text-4xl absolute left-2 -bottom-6" />
                        </span>
                    </p>
                </div>
                {/* Layout 3 colonnes (Free allégé + 2 vraies cards) */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                    <div className="hidden xl:flex w-full h-full items-center">
                        <FreeCard />
                    </div>
                    <div className="col-span-1 flex justify-center md:justify-end row-start-2 md:row-start-auto">
                        <PriceCard card={CARDS[0]} hasPack={hasPack} />
                    </div>
                    <div className="col-span-1 flex justify-center md:justify-start row-start-1 md:row-start-auto">
                        <PriceCard card={CARDS[1]} hasPack={hasPack} />
                    </div>
                </div>
                {/* Mentions sous la zone plans */}
                <div className="mt-12 text-center text-sm opacity-80">
                    <div>Accès à vie • Préparation indépendante, non affiliée au SEM/FIDE.</div>

                    <div className="mt-1">
                        Satisfait ou remboursé <span className="opacity-70">(voir conditions)</span>.
                    </div>
                </div>
            </div>
        </section>
    );
}
