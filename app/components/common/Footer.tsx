import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Fade } from "../animations/Fades";
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
                                            <Link href="/" className="footer-link">
                                                Home
                                            </Link>
                                        </li>
                                        <li className="footer-list-item">
                                            <Link href="/blog" className="footer-link">
                                                Blog
                                            </Link>
                                        </li>
                                        <li className="footer-list-item">
                                            <Link href="/about" className="footer-link">
                                                About
                                            </Link>
                                        </li>
                                        <li className="footer-list-item">
                                            <Link href="/contact" className="footer-link">
                                                Contact
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex flex-col items-center">
                                    <div className="text-400 medium footer-title">Contact me</div>
                                    <ul role="list" className="footer-list-wrapper">
                                        <li className="footer-list-item">
                                            <a href="mailto:hello@john.com" className="link-wrapper color-neutral-300 w-inline-block">
                                                <div className="social-icon-square icon-left">
                                                    <Image src="/images/email-icon-paperfolio-webflow-template.svg" width={29} height={19} loading="eager" alt="email icon" />
                                                </div>
                                                <div className="link-text">yohann@startfrenchnow.com</div>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Fade>
                    </div>
                    <div className="footer-bottom border-top-0px">
                        <div className="inner-container _500px---mbl center">
                            <p data-w-id="302ad83d-63c4-ff55-2757-b5c651839121" className="color-neutral-300 text-medium mg-bottom-0">
                                Copyright © Start French now | Created by{" "}
                                <Link href="/about" className="link">
                                    Yohann Coussot
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Footer;
