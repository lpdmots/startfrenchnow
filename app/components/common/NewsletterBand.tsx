"use client";
import Image from "next/image";
import { BsCheckCircle } from "react-icons/bs";
import useSubscribe from "../../hooks/useSubscribe";
import Spinner from "./Spinner";

function NewsletterBand() {
    const { handleChange, handleSubmit, pending, error, success, email } = useSubscribe();

    return (
        <div className="footer-newsletter newsletter-section">
            <div className="container-default w-container">
                <div className="flex-horizontal space-between newsletter-section---main">
                    <div className="image-wrapper newsletter-image-wrapper newsletter-section">
                        <Image src="/images/newsletter-image-paperfolio-webflow-template.svg" height={189} width={190} alt="newsletter icon" className="image " />
                    </div>
                    <div className="newsletter-wrapper newsletter-section">
                        <div className="text-center-mbl color-neutral-100">
                            <p className="display-4 mb-0 color-neutral-100">
                                Subscribe to <span className="text-no-wrap">my newsletter</span>
                            </p>
                            <div className="flex items-center">
                                <p className="mb-0 mr-2">Stay informed and get a free video</p>
                            </div>
                        </div>
                        <div className="newsletter-form-block w-form">
                            {success ? (
                                <div className="success-message color-neutral-100 w-form-done">
                                    <div className="flex-horizontal success-message-horizontal">
                                        <BsCheckCircle className="mr-2" style={{ fontSize: 28 }} />
                                        <div>Thanks for joining our newsletter. Check your emails and start French now!</div>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="error-message w-form-fail !mt-0">
                                    <div>Oops! Something went wrong.</div>
                                </div>
                            ) : (
                                <form className="form-3" onSubmit={handleSubmit}>
                                    <label className="field-label">Label</label>
                                    <div className="position-relative">
                                        <input type="email" className="input small button-inside w-input" value={email} placeholder="Enter your email address" onChange={handleChange} />
                                        <button className="btn-primary inside-input variant small w-button min-w-36">{pending ? <Spinner radius maxHeight="40px" /> : "Subscribe"}</button>
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

export default NewsletterBand;
