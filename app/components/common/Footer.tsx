import { Locale } from "@/i18n";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";
import { Fade } from "../animations/Fades";
import { LinkCurrent } from "./LinkCurrent";
import { LinkCurrentBlog } from "./LinkCurrentBlog";
import NewsletterFooter from "./newsletter/NewsletterFooter";

function Footer() {
    const t = useTranslations("Navigation");
    const locale = useLocale();

    return (
        <div className="footer-v1 wf-section">
            <NewsletterFooter />
            <footer className="footer-wrapper">
                <div className="container-default w-container">
                    <div className="footer-top border-bottom">
                        <Fade>
                            <div className=" grid grid-row-2 md:grid-cols-2 w-full">
                                <div className="flex flex-col items-center">
                                    <div className="text-400 medium footer-title">Pages</div>
                                    <ul role="list" className="flex !pl-0 justify-center gap-4 md:gap-8 flex-wrap list-none">
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/" className="footer-link">
                                                {t("home")}
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/stories" className="footer-link">
                                                {t("stories")}
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrentBlog href="/blog" className="footer-link" locale={locale as Locale}>
                                                {t("blog")}
                                            </LinkCurrentBlog>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/about" className="footer-link">
                                                {t("about")}
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/contact" className="footer-link">
                                                {t("contact")}
                                            </LinkCurrent>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="flex flex-col items-center md:items-start">
                                        <div className="flex items-center mb-6">
                                            <div className="social-icon-square icon-left">
                                                <Image src="/images/email-icon-paperfolio-webflow-template.svg" width={29} height={19} loading="eager" alt="email icon" />
                                            </div>
                                            <div className="text-400 medium footer-title">{t("contact_us")}</div>
                                        </div>
                                        <ul role="list" className="footer-list-wrapper flex flex-col items-center md:items-start">
                                            <li className="footer-list-item">
                                                <a href="mailto:yohann@startfrenchnow.com" className="link-wrapper color-neutral-300 w-inline-block">
                                                    <div className="link-text">yohann@startfrenchnow.com</div>
                                                </a>
                                            </li>
                                            <li className="footer-list-item">
                                                <a href="mailto:nicolas@startfrenchnow.com" className="link-wrapper color-neutral-300 w-inline-block">
                                                    <div className="link-text">nicolas@startfrenchnow.com</div>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </Fade>
                    </div>
                    <div className="footer-bottom border-top-0px">
                        <div className="inner-container _500px---mbl center">
                            <p data-w-id="302ad83d-63c4-ff55-2757-b5c651839121" className="color-neutral-300 text-medium mg-bottom-0">
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
