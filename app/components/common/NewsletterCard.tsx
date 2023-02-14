"use client";
import Image from "next/image";
import React from "react";
import { BsCheckCircle } from "react-icons/bs";
import useSubscribe from "../../hooks/useSubscribe";
import Spinner from "./Spinner";

function NewsletterCard() {
    const { handleChange, handleSubmit, pending, error, success, email } = useSubscribe();

    return (
        <div data-w-id="32f4274f-5340-1bd4-838f-6737839a901b" className="newsletter-card">
            <div className="mg-bottom-24px">
                <Image src="/images/get-in-touch-image-paperfolio-webflow-template.svg" height={92} width={92} loading="eager" alt="get in touch image" />
            </div>
            <div className="text-center mg-bottom-24px">
                <div className="inner-container _400px---tablet center">
                    <div className="inner-container _350px---mbl center">
                        <h2 className="display-4 mg-bottom-8px">Subscribe to our newsletter</h2>
                        <div className="flex items-center">
                            <span className="mb-0">Stay informed and get a free video</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="nesletter-sidebar-form-block w-form">
                {success ? (
                    <div className="success-message w-form-done">
                        <div className="flex-horizontal success-message-vertical">
                            <BsCheckCircle style={{ fontSize: 28 }} />
                            <div className="ml-2">Thanks for joining our newsletter. Check your emails and start French now!</div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="error-message w-form-fail">
                        <div>Oops! Something went wrong.</div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <label className="field-label-3">Email Address</label>
                        <input type="email" className="input small mg-bottom-16px w-input" value={email} onChange={handleChange} placeholder="Enter email address" id="email" />
                        <button type="submit" className="btn-primary full-width w-button  min-w-36">
                            {pending ? <Spinner radius maxHeight="40px" /> : "Subscribe"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default NewsletterCard;
