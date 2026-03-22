import { ExternalLink, FileText, PlayCircle } from "lucide-react";

type ResourceItem = {
    title: string;
    href: string;
    subtitle?: string;
};

export default function MockExamCorrectionResources({
    speakingVideoResources,
    readWritePdfResources,
}: {
    speakingVideoResources: ResourceItem[];
    readWritePdfResources: ResourceItem[];
}) {
    return (
        <section className="max-w-6xl w-full py-0">
            <div className="card border-2 border-solid border-neutral-700 bg-neutral-100 p-6 md:p-8">
                <div className="flex flex-col gap-2 mb-6">
                    <p className="mb-0 text-sm font-semibold uppercase tracking-wide text-neutral-500">Ressources de correction</p>
                    <h2 className="mb-0 text-2xl md:text-3xl font-semibold text-neutral-800">Revoir l’examen à votre rythme</h2>
                    <p className="mb-0 text-neutral-700">
                        Retrouvez les vidéos de correction pour l’oral et les PDF pour les parties lire/écrire, disponibles à tout moment.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-2xl border border-neutral-300 bg-neutral-200 p-4 md:p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <PlayCircle className="h-5 w-5 text-neutral-700" aria-hidden="true" />
                            <h3 className="mb-0 text-lg font-semibold text-neutral-800">Vidéos de correction (Parler)</h3>
                        </div>

                        {speakingVideoResources.length === 0 ? (
                            <p className="mb-0 text-sm text-neutral-600">Les vidéos seront ajoutées très bientôt.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {speakingVideoResources.map((item) => (
                                    <a
                                        key={`video-${item.href}`}
                                        href={item.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl border border-neutral-300 bg-neutral-100 p-3 no-underline text-neutral-800 transition-colors hover:bg-neutral-200"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="mb-0 text-sm font-semibold">{item.title}</p>
                                            <ExternalLink className="h-4 w-4 text-neutral-600 shrink-0" aria-hidden="true" />
                                        </div>
                                        {item.subtitle && <p className="mb-0 mt-1 text-xs text-neutral-600">{item.subtitle}</p>}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-neutral-300 bg-neutral-200 p-4 md:p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-5 w-5 text-neutral-700" aria-hidden="true" />
                            <h3 className="mb-0 text-lg font-semibold text-neutral-800">PDF support (Lire / Écrire)</h3>
                        </div>

                        {readWritePdfResources.length === 0 ? (
                            <p className="mb-0 text-sm text-neutral-600">Les supports PDF seront disponibles dès leur publication.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {readWritePdfResources.map((item) => (
                                    <a
                                        key={`pdf-${item.href}`}
                                        href={item.href}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="rounded-xl border border-neutral-300 bg-neutral-100 p-3 no-underline text-neutral-800 transition-colors hover:bg-neutral-200"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="mb-0 text-sm font-semibold">{item.title}</p>
                                            <ExternalLink className="h-4 w-4 text-neutral-600 shrink-0" aria-hidden="true" />
                                        </div>
                                        {item.subtitle && <p className="mb-0 mt-1 text-xs text-neutral-600">{item.subtitle}</p>}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

