import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Fade } from "../animations/Fades";
import { LinkCurrent } from "./LinkCurrent";
import NewsletterFooter from "./NewsletterFooter";

function Footer() {
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
                                    <ul role="list" className="footer-list-wrapper flex w-full gap-6 justify-center items-center pt-2">
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/" className="footer-link">
                                                Home
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/stories" className="footer-link">
                                                Stories
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/blog" className="footer-link">
                                                Blog
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/about" className="footer-link">
                                                About
                                            </LinkCurrent>
                                        </li>
                                        <li className="footer-list-item">
                                            <LinkCurrent href="/contact" className="footer-link">
                                                Contact
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
                                            <div className="text-400 medium footer-title">Contact us</div>
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
                                Copyright © Start French now | Created by{" "}
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
