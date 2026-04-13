import type { FlatFidePackSommaire } from "../videos/page";
import FideVideoList from "../videos/components/FideVideoList";
import LinkArrow from "@/app/components/common/LinkArrow";

type Props = {
    guides: FlatFidePackSommaire;
};

export function FidePageDetailedGuidesSection({ guides }: Props) {
    return (
        <section className="py-16 lg:py-24 bg-neutral-200">
            <div className="max-w-7xl m-auto px-4 lg:px-8">
                <h2 className="display-2 mb-4">
                    <span className="heading-span-secondary-6">Aller plus loin</span> avec les guides détaillés
                </h2>
                <p className="mb-8">Ressources ciblées pour approfondir les tâches orales A2/B1 et gagner en précision.</p>

                {guides.length === 0 ? (
                    <p className="mb-0 text-neutral-700">Aucun guide supplémentaire publié pour le moment.</p>
                ) : (
                    <>
                        <FideVideoList filteredPackSommaire={guides} locale="fr" hasPack hidePackageBadge />
                    </>
                )}
            </div>
        </section>
    );
}
