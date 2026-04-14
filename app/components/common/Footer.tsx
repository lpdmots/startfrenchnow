import { Locale } from "@/i18n";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { Fade } from "../animations/Fades";
import { LinkCurrent, LinkTranslation } from "./LinkCurrent";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import NewsletterFooter from "./newsletter/NewsletterFooter";
import { Link } from "@/i18n/navigation";
import { FacebookFooter } from "./logos/FacebookFooter";
import { YoutubeFooter } from "./logos/Youtube";
import { InstagramFooter } from "./logos/Instagram";
import { TiktokFooter } from "./logos/Tiktok";
import { TarteauCitronLink } from "./TarteauCitronLink";

function Footer() {
    const t = useTranslations("Navigation");
    const locale = useLocale();

    return (
        <div className="footer-v1 wf-section">
            <NewsletterFooter />
            <footer className="bg-neutral-800">
                <div className="container-default w-container">
                    <div className="pt-20 pb-16 md:pt-24 md:pb-20 [border-bottom:1px_solid_var(--neutral-700)]">
                        <Fade>
                            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 md:gap-12 w-full text-left">
                                <div className="flex flex-col items-start gap-6 md:gap-8">
                                    <div>
                                        <div className="text-xs md:text-sm uppercase tracking-[0.24em] font-semibold text-neutral-300 mb-3 md:mb-4 !mt-0">FIDE</div>
                                        <ul role="list" className="flex !pl-0 gap-2 md:gap-3 flex-row flex-wrap md:flex-col md:flex-nowrap list-none text-sm md:text-base">
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/fide" className="footer-link">
                                                    {t("footer.fideTest")}
                                                </LinkCurrent>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/fide/pack-fide" className="footer-link">
                                                    {t("footer.fidePack")}
                                                </LinkCurrent>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/fide/mock-exams" className="footer-link">
                                                    {t("footer.fideMockExams")}
                                                </LinkCurrent>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/fide/private-courses" className="footer-link">
                                                    {t("footer.fidePrivateCourses")}
                                                </LinkCurrent>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-6 md:gap-8">
                                    <div>
                                        <div className="text-xs md:text-sm uppercase tracking-[0.24em] font-semibold text-neutral-300 mb-3 md:mb-4 !mt-0">{t("courses.button")}</div>
                                        <ul role="list" className="flex !pl-0 gap-2 md:gap-3 flex-row flex-wrap md:flex-col md:flex-nowrap list-none text-sm md:text-base">
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/courses/beginners" className="footer-link">
                                                    {t("courses.beginners")}
                                                </LinkCurrent>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/courses/intermediates" className="footer-link">
                                                    {t("courses.intermediates")}
                                                </LinkCurrent>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrentBlog href="/courses/dialogues" className="footer-link" locale={locale as Locale}>
                                                    {t("courses.dialoguesFooter")}
                                                </LinkCurrentBlog>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/courses/past-tenses" className="footer-link">
                                                    {t("courses.pastTensesFooter")}
                                                </LinkCurrent>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-6 md:gap-8">
                                    <div>
                                        <div className="text-xs md:text-sm uppercase tracking-[0.24em] font-semibold text-neutral-300 mb-3 md:mb-4 !mt-0">Ressources</div>
                                        <ul role="list" className="flex !pl-0 gap-2 md:gap-3 flex-row flex-wrap md:flex-col md:flex-nowrap list-none text-sm md:text-base">
                                            <li className="footer-list-item">
                                                <LinkCurrentBlog href="/blog" className="footer-link" locale={locale as Locale}>
                                                    {t("blog")}
                                                </LinkCurrentBlog>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/fide/videos" className="footer-link">
                                                    {t("resources.fideVideos")}
                                                </LinkCurrent>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/fide/exams" className="footer-link">
                                                    {t("resources.fideScenarios")}
                                                </LinkCurrent>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/exercises" className="footer-link">
                                                    {t("exercises")}
                                                </LinkCurrent>
                                            </li>
                                            <li className="footer-list-item">
                                                <LinkCurrent href="/test-your-level" className="footer-link">
                                                    {t("resources.testYourLevel")}
                                                </LinkCurrent>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex flex-col items-start gap-4 md:gap-8">
                                    <div className="flex flex-col items-start">
                                        <div className="flex items-center mb-4">
                                            <div className="flex w-[40px] h-[40px] max-h-[40px] max-w-[40px] min-h-[40px] min-w-[40px] justify-center items-center rounded-[50%] bg-[var(--neutral-100)] [transition:background-color_300ms_ease\,_color_300ms_ease] text-[var(--neutral-800)] no-underline hover:bg-[var(--secondary-2)] hover:text-[var(--neutral-100)] mr-[14px] [transition-property:none] hover:bg-[var(--neutral-100)] max-[479px]:w-[40px] max-[479px]:h-[40px] max-[479px]:min-h-[40px] max-[479px]:min-w-[40px] max-[479px]:rounded-[50%] max-[479px]:text-[14px] icon-left">
                                                <div className="relative w-[29px] h-[19px]">
                                                    <Image src="/images/email-icon-paperfolio-webflow-template.svg" fill loading="eager" alt="email icon" className="object-contain" sizes="29px" />
                                                </div>
                                            </div>
                                            <div className="text-xs md:text-sm uppercase tracking-[0.24em] font-semibold text-neutral-300 mb-2">{t("contact_us")}</div>
                                        </div>
                                        <ul role="list" className="mb-0 pl-0 list-none flex flex-col items-start text-sm md:text-base">
                                            <li className="footer-list-item">
                                                <a
                                                    href="mailto:yohann@startfrenchnow.com"
                                                    className="inline-block leading-[20px] font-normal flex items-center text-neutral-300 no-underline transition-colors duration-200 hover:text-[var(--secondary-2)] w-inline-block"
                                                >
                                                    <div className="link-text">yohann@startfrenchnow.com</div>
                                                </a>
                                            </li>
                                            <li className="footer-list-item">
                                                <a
                                                    href="mailto:nicolas@startfrenchnow.com"
                                                    className="inline-block leading-[20px] font-normal flex items-center text-neutral-300 no-underline transition-colors duration-200 hover:text-[var(--secondary-2)] w-inline-block"
                                                >
                                                    <div className="link-text">nicolas@startfrenchnow.com</div>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div>
                                        <div className="text-xs md:text-sm uppercase tracking-[0.24em] font-semibold text-neutral-300 mb-3 md:mb-4 !mt-0">{t("reseaux_sociaux")}</div>
                                        <div className="flex gap-2 md:gap-4">
                                            <LinkTranslation href="https://www.facebook.com/groups/1274260010235504/">
                                                <FacebookFooter height={30} width={30} />
                                            </LinkTranslation>
                                            <LinkTranslation href="https://www.youtube.com/@startfrenchnow">
                                                <YoutubeFooter height={30} width={30} />
                                            </LinkTranslation>
                                            <LinkTranslation href="https://www.instagram.com/startfrenchnow/">
                                                <InstagramFooter height={30} width={30} />
                                            </LinkTranslation>
                                            <LinkTranslation href="https://www.tiktok.com/@startfrenchnow">
                                                <TiktokFooter height={30} width={30} />
                                            </LinkTranslation>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Fade>
                    </div>
                    <div className="pt-10 pb-10 border-t-0 flex flex-col md:flex-row justify-between text-sm md:text-base items-center flex-wrap gap-2">
                        <div className="text-center">
                            <p data-w-id="302ad83d-63c4-ff55-2757-b5c651839121" className="color-neutral-300 font-medium mg-bottom-0">
                                Copyright © Start French Now | Created by{" "}
                                <LinkCurrent href="/about" className="link">
                                    Nicolas & Yohann Coussot
                                </LinkCurrent>
                            </p>
                        </div>
                        <div>
                            <div className="flex items-center gap-4 md:gap-8">
                                <LinkCurrent href="/about" className="footer-link">
                                    {t("about")}
                                </LinkCurrent>
                                <LinkCurrent href="/mentions-legales" className="footer-link">
                                    {t("legal_mentions")}
                                </LinkCurrent>
                                <TarteauCitronLink />
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Footer;
