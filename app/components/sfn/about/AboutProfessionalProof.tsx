import { intelRich } from "@/app/lib/intelRich";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { HiOutlineArrowUpRight } from "react-icons/hi2";
import { SlideFromBottom } from "../../animations/Slides";

const SOCIAL_LINKS = [
    { label: "Udemy", href: "https://www.udemy.com/user/yohann-coussot/" },
    { label: "YouTube", href: "https://www.youtube.com/@startfrenchnow" },
    { label: "Instagram", href: "https://www.instagram.com/startfrenchnow/" },
    { label: "TikTok", href: "https://www.tiktok.com/@startfrenchnow" },
] as const;

const STAT_KEYS = ["teaching", "fide", "results", "udemy"] as const;

function AboutProfessionalProof() {
    const t = useTranslations("About.professional");

    return (
        <section className="section bg-neutral-800 py-20 md:py-24 wf-section" data-about-proof>
            <div className="container-default w-container">
                <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
                    <SlideFromBottom>
                        <div className="mx-auto w-full max-w-[460px] lg:mx-0">
                            <div className="image-wrapper overflow-hidden rounded-[30px] [border:3px_solid_var(--neutral-100)]">
                                <Image src="/images/yoh-coussot.png" alt={t("imageAlt")} width={600} height={600} className="h-auto w-full object-cover" />
                            </div>
                            <p className="mb-0 mt-5 text-center text-sm font-semibold text-neutral-300 lg:text-left">{t("role")}</p>
                        </div>
                    </SlideFromBottom>

                    <SlideFromBottom delay={0.15}>
                        <div className="max-w-[720px]">
                            <h2 className="display-2 mb-6 text-neutral-100">{t.rich("title", intelRich())}</h2>
                            <p className="mb-8 max-w-[68ch] text-base leading-relaxed text-neutral-300 md:text-lg">{t("description")}</p>

                            <dl className="mb-8 border-y border-neutral-600">
                                {STAT_KEYS.map((key) => (
                                    <div key={key} className="grid grid-cols-1 items-center gap-2 border-b border-neutral-600 py-4 last:border-b-0 sm:grid-cols-[160px_1fr] sm:gap-4 md:py-5" data-about-stat={key}>
                                        <dt className="order-2 mb-0 text-sm leading-snug text-neutral-300 md:text-base">{t(`stats.${key}.label`)}</dt>
                                        <dd className="order-1 mb-0 whitespace-nowrap text-3xl font-bold leading-none text-neutral-100 md:text-4xl">{t(`stats.${key}.value`)}</dd>
                                    </div>
                                ))}
                            </dl>

                            <div className="mb-8">
                                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-neutral-300">{t("socialTitle")}</p>
                                <div className="flex flex-wrap gap-x-5 gap-y-3">
                                    {SOCIAL_LINKS.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-neutral-100 underline decoration-neutral-600 underline-offset-4 transition-colors hover:text-secondary-1 hover:decoration-secondary-1"
                                        >
                                            {social.label}
                                            <HiOutlineArrowUpRight aria-hidden="true" className="h-4 w-4" />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <Link href="/fide" className="btn-secondary variant w-button">
                                {t("cta")}
                            </Link>
                        </div>
                    </SlideFromBottom>
                </div>
            </div>
        </section>
    );
}

export default AboutProfessionalProof;
