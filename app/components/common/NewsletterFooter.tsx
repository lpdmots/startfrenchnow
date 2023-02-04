"use client";
import Image from "next/image";
import React from "react";
import useSubscribe from "../../hooks/useSubscribe";
import Spinner from "./Spinner";

function NewsletterFooter() {
    const { handleChange, handleSubmit, pending, error, success, email } = useSubscribe();

    return (
        <div className="footer-newsletter">
            <div className="container-default w-container">
                <div data-w-id="302ad83d-63c4-ff55-2757-b5c6518390b4" className="flex-horizontal space-between flex-vertical-tbl">
                    <div className="image-wrapper newsletter-image-wrapper position-relative">
                        <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="Newsletter Icon - Paperfolio Webflow Template" className="image" />
                    </div>
                    <div className="newsletter-wrapper">
                        <div className="display-4 text-center-mbl">
                            Subscribe to <span className="text-no-wrap">my newsletter</span>
                        </div>
                        <div className="footer-form-block w-form">
                            {success ? (
                                <div className="success-message text-left w-form-done">
                                    <div className="flex-horizontal success-message-horizontal">
                                        <div className="line-rounded-icon success-message-check---left"></div>
                                        <div>
                                            Thanks for joining <span>our newsletter.</span>
                                        </div>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="error-message w-form-fail">
                                    <div>Oops! Something went wrong.</div>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit}>
                                    <label className="field-label">Label</label>
                                    <div className="position-relative">
                                        <input type="email" className="input button-inside w-input" value={email} placeholder="Enter your email address" id="Email" onChange={handleChange} />
                                        <button type="submit" className="btn-primary inside-input default w-button min-w-36">
                                            {pending ? <Spinner radius maxHeight="40px" /> : "Subscribe"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NewsletterFooter;
