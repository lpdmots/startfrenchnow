import { Link } from "@/i18n/navigation";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { InstagramBig } from "../../common/logos/Instagram";
import { TiktokBig } from "../../common/logos/Tiktok";
import { UdemyBig } from "../../common/logos/Udemy";
import { YoutubeBig } from "../../common/logos/Youtube";

const proofItems = [
    {
        key: "youtube",
        href: "https://www.youtube.com/@startfrenchnow",
        logo: <YoutubeBig height={20} width={92} />,
    },
    {
        key: "tiktok",
        href: "https://www.tiktok.com/@startfrenchnow",
        logo: <TiktokBig height={28} width={96} />,
    },
    {
        key: "instagram",
        href: "https://www.instagram.com/startfrenchnow",
        logo: <InstagramBig height={24} width={96} />,
    },
    {
        key: "udemy",
        href: "https://www.udemy.com/user/yohann-coussot/",
        logo: <UdemyBig height={22} width={92} />,
    },
] as const;

export function HomeSocialProofBand() {
    const t = useTranslations("HomeSocialProofBand");
    const rich = {
        ...intelRich(),
        em: (chunks: ReactNode) => (
            <span className="font-bold underline underline-offset-2" style={{ textDecorationColor: "var(--secondary-1)" }}>
                {chunks}
            </span>
        ),
    };
    const tRich = t.rich as (key: string, values?: Record<string, (chunks: ReactNode) => ReactNode>) => ReactNode;

    return (
        <section className="py-8 lg:py-10 bg-neutral-800">
            <div className="mx-auto max-w-7xl px-4 lg:px-8">
                <div className="overflow-hidden rounded-2xl px-5 py-8 text-neutral-100 shadow-sm lg:px-8 lg:py-10">
                    <div className="mb-8 text-center">
                        <h2 className="mb-3 text-2xl font-bold leading-tight lg:text-4xl">{t("title")}</h2>
                        <p className="mx-auto mb-0 max-w-3xl text-sm text-neutral-300 lg:text-base">{tRich("subtitle", rich)}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {proofItems.map(({ key, href, logo }) => (
                            <Link
                                key={key}
                                href={href}
                                target="_blank"
                                className="flex min-h-[168px] flex-col justify-between rounded-xl border border-neutral-700 bg-neutral-900/60 p-5 text-neutral-100 no-underline transition duration-200 hover:border-secondary-5 hover:bg-neutral-900"
                            >
                                <div className="flex h-7 items-center">{logo}</div>
                                <div className="mt-6">
                                    <p className="mb-1 text-3xl font-bold leading-none lg:text-4xl">{t(`items.${key}.count` as never)}</p>
                                    <p className="mb-1 text-sm font-semibold uppercase tracking-[0.16em] text-neutral-300">{t(`items.${key}.label` as never)}</p>
                                    <p className="mb-0 text-sm leading-relaxed text-neutral-400">{t(`items.${key}.description` as never)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
