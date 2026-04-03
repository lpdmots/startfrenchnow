import { Locale } from "@/i18n";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { Fade } from "../animations/Fades";
import { LinkCurrent, LinkTranslation } from "./LinkCurrent";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import NewsletterFooter from "./newsletter/NewsletterFooter";
import Link from "next-intl/link";
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
                    <div className="pt-[120px] pb-[120px] pt-[100px] pb-[80px] [border-bottom:1px_solid_var(--neutral-700)] max-[991px]:pt-[94px] max-[991px]:pb-[94px] max-[767px]:pt-[72px] max-[767px]:pb-[72px] max-[767px]:pt-[80px] max-[767px]:pb-[70px] max-[479px]:pt-[80px] max-[479px]:pb-[80px] pt-[100px] pb-[80px] [border-bottom:1px_solid_var(--neutral-700)] max-[767px]:pt-[80px] max-[767px]:pb-[70px]">
                        <Fade>
                            <div className=" grid grid-row-2 md:grid-cols-2 w-full">
                                <div className="flex flex-col items-center">
                                    <div className="text-[24px] leading-[1.083em] font-normal font-medium mb-[20px] mt-[20px] text-[var(--neutral-100)] font-bold max-[991px]:text-[22px] max-[767px]:text-[20px] medium mb-[20px] mt-[20px] text-[var(--neutral-100)] !mt-0">Pages</div>
                                    <ul role="list" className="flex !pl-0 justify-center gap-4 md:gap-8 flex-wrap list-none">
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/videos" className="footer-link">
                                                {t("videos")}
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrentBlog href="/blog" className="footer-link" locale={locale as Locale}>
                                                {t("learn.button")}
                                            </LinkCurrentBlog>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/exercises" className="footer-link">
                                                {t("exercises")}
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/about" className="footer-link">
                                                {t("about")}
                                            </LinkCurrent>
                                        </li>
                                    </ul>
                                    <div className="text-[24px] leading-[1.083em] font-normal font-medium mb-[20px] mt-[20px] text-[var(--neutral-100)] font-bold max-[991px]:text-[22px] max-[767px]:text-[20px] medium mb-[20px] mt-[20px] text-[var(--neutral-100)] !mt-0">{t("courses.button")}</div>
                                    <ul role="list" className="flex !pl-0 justify-center gap-4 md:gap-8 flex-wrap list-none">
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/fide" className="footer-link">
                                                FIDE
                                            </LinkCurrent>
                                        </li>
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
                                    <div className="text-[24px] leading-[1.083em] font-normal font-medium mb-[20px] mt-[20px] text-[var(--neutral-100)] font-bold max-[991px]:text-[22px] max-[767px]:text-[20px] medium mb-[20px] mt-[20px] text-[var(--neutral-100)] !mt-0">{t("reseaux_sociaux")}</div>
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

                                <div className="flex flex-col items-center">
                                    <div className="flex flex-col items-center md:items-start">
                                        <div className="flex items-center mb-6">
                                            <div className="flex w-[40px] h-[40px] max-h-[40px] max-w-[40px] min-h-[40px] min-w-[40px] justify-center items-center rounded-[50%] bg-[var(--neutral-100)] [transition:background-color_300ms_ease\,_color_300ms_ease] text-[var(--neutral-800)] no-underline hover:bg-[var(--secondary-2)] hover:text-[var(--neutral-100)] mr-[14px] [transition-property:none] hover:bg-[var(--neutral-100)] max-[479px]:w-[40px] max-[479px]:h-[40px] max-[479px]:min-h-[40px] max-[479px]:min-w-[40px] max-[479px]:rounded-[50%] max-[479px]:text-[14px] icon-left">
                                                <Image src="/images/email-icon-paperfolio-webflow-template.svg" width={29} height={19} loading="eager" alt="email icon" />
                                            </div>
                                            <div className="text-[24px] leading-[1.083em] font-normal font-medium mb-[20px] mt-[20px] text-[var(--neutral-100)] font-bold max-[991px]:text-[22px] max-[767px]:text-[20px] medium mb-[20px] mt-[20px] text-[var(--neutral-100)]">{t("contact_us")}</div>
                                        </div>
                                        <ul role="list" className="mb-0 pl-0 list-none flex flex-col items-center md:items-start">
                                            <li className="footer-list-item">
                                                <a href="mailto:yohann@startfrenchnow.com" className="inline-block leading-[20px] font-normal flex items-center text-neutral-300 no-underline transition-colors duration-200 hover:text-[var(--secondary-2)] w-inline-block">
                                                    <div className="link-text">yohann@startfrenchnow.com</div>
                                                </a>
                                            </li>
                                            <li className="footer-list-item">
                                                <a href="mailto:nicolas@startfrenchnow.com" className="inline-block leading-[20px] font-normal flex items-center text-neutral-300 no-underline transition-colors duration-200 hover:text-[var(--secondary-2)] w-inline-block">
                                                    <div className="link-text">nicolas@startfrenchnow.com</div>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="flex justify-center gap-4 md:gap-8 mb-4 mt-8">
                                        <LinkCurrent href="/mentions-legales" className="footer-link">
                                            {t("legal_mentions")}
                                        </LinkCurrent>
                                        <TarteauCitronLink />
                                    </div>
                                </div>
                            </div>
                        </Fade>
                    </div>
                    <div className="pt-10 pb-10 border-t-0 text-center">
                        <div className="inner-container _500px---mbl center">
                            <p data-w-id="302ad83d-63c4-ff55-2757-b5c651839121" className="color-neutral-300 font-medium mg-bottom-0">
                                Copyright © Start French Now | Created by{" "}
                                <LinkCurrent href="/about" className="link">
                                    Nicolas & Yohann Coussot
                                </LinkCurrent>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Footer;
