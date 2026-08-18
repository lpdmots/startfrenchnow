import { ArrowUpRight, BadgeCheck, Building2, Landmark } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type FidePermitPathSectionProps = {
    locale: "en" | "fr";
};

const cards = [
    { key: "permitB", Icon: Building2, iconClass: "text-secondary-6", levelClass: "text-secondary-6" },
    { key: "permitC", Icon: BadgeCheck, iconClass: "text-secondary-5", levelClass: "text-secondary-5" },
    { key: "naturalization", Icon: Landmark, iconClass: "text-secondary-2", levelClass: "text-secondary-2" },
] as const;

export function FidePermitPathSection({ locale }: FidePermitPathSectionProps) {
    const t = useTranslations("Fide.FidePermitPath");
    const semUrl =
        locale === "fr"
            ? "https://www.sem.admin.ch/sem/fr/home/integration-einbuergerung/mein-beitrag/zugewandert/sprache.html"
            : "https://www.sem.admin.ch/sem/en/home/integration-einbuergerung/mein-beitrag/zugewandert/sprache.html";

    return (
        <section data-fide-permit-path className="border-b border-neutral-300 bg-neutral-200 !py-14 lg:!py-20" aria-labelledby="fide-permit-path-title">
            <div className="m-auto max-w-7xl px-4 lg:px-8">
                <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
                    <div className="max-w-xl lg:sticky lg:top-28">
                        <h2 id="fide-permit-path-title" className="display-2 mb-4 text-balance text-neutral-900">
                            {t.rich("title", {
                                highlight: (chunks: ReactNode) => <span className="heading-span-secondary-3">{chunks}</span>,
                            })}
                        </h2>
                        <p className="mb-7 max-w-[62ch] text-lg text-neutral-700">{t("intro")}</p>
                        <div className="border-t border-neutral-400 pt-5">
                            <p className="mb-3 text-sm leading-6 text-neutral-700">{t("caveat")}</p>
                            <a
                                href={semUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex min-h-11 items-center gap-1 font-semibold text-secondary-6 underline decoration-1 underline-offset-4 transition-[color,transform] duration-150 ease-out active:scale-[0.96] motion-reduce:transform-none"
                            >
                                {t("officialSource")}
                                <ArrowUpRight className="size-4" aria-hidden="true" strokeWidth={2} />
                            </a>
                        </div>
                        <a
                            href="#fide-hub"
                            className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-neutral-900 no-underline underline-offset-4 transition-[color,transform] duration-150 ease-out hover:text-secondary-6 hover:underline active:scale-[0.96] motion-reduce:transform-none"
                        >
                            {t("cta")}
                            <ArrowUpRight className="size-4" aria-hidden="true" strokeWidth={2} />
                        </a>
                    </div>

                    <div className="relative border-y border-neutral-400">
                        <div className="absolute bottom-8 left-[19px] top-8 w-px bg-neutral-400 md:left-[23px]" aria-hidden="true" />
                        {cards.map(({ key, Icon, iconClass, levelClass }) => (
                            <div
                                key={key}
                                data-fide-permit-route
                                className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-x-4 border-b border-neutral-400 py-7 last:border-b-0 md:grid-cols-[48px_minmax(0,1fr)_minmax(190px,0.72fr)] md:gap-x-5 md:py-8"
                            >
                                <span className="relative z-10 flex h-10 w-10 items-center justify-center bg-neutral-200 md:h-12 md:w-12">
                                    <Icon className={`size-6 ${iconClass}`} aria-hidden="true" strokeWidth={2} />
                                </span>
                                <div className="pr-2">
                                    <h3 className="mb-2 text-xl font-bold text-neutral-900 md:text-2xl">{t(`cards.${key}.title`)}</h3>
                                    <p className="mb-0 max-w-[52ch] text-sm leading-6 text-neutral-700 md:text-base">{t(`cards.${key}.text`)}</p>
                                </div>
                                <div className="col-start-2 mt-4 md:col-start-3 md:mt-0 md:text-right">
                                    <p data-fide-permit-level className={`mb-2 text-2xl font-black leading-tight tracking-[-0.03em] md:text-3xl ${levelClass}`}>
                                        {t(`cards.${key}.level`)}
                                    </p>
                                    <p className="mb-0 text-sm font-semibold leading-5 text-neutral-800">{t(`cards.${key}.preparation`)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
