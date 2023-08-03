import { GetNewLink } from "@/app/components/common/GetNewLink";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type TypeProps = "no-user" | "already-active" | "expired";

const MESSAGES = {
    "no-user": "We cannot find the user corresponding to this activation key. Please enter your email address to receive a new activation link. If the error persists, contact us.",
    "already-active": "The account corresponding to this key has already been validated. You are free to log in.",
    expired: "Sorry, the activation key has expired. We have sent you a new email to validate your account.",
    "email-already-used": "This email address is already in use. Please enter another e-mail address or change the authentication mode.",
};

const Error = ({ params }: { params: { type: TypeProps } }) => {
    const message = MESSAGES[params.type];
    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <div className="utility-page-wrap not-found">
                <div className="container-default w-container">
                    <div className="position-relative z-index-1">
                        <div className="flex-horizontal">
                            <div id="w-node-d245282e-bd6f-ff12-2569-ce176b30a962-33543d3f" data-w-id="d245282e-bd6f-ff12-2569-ce176b30a962" className="position-absolute _404-not-found">
                                <div className="_404-not-found-number">400</div>
                            </div>
                            <div className="grid-2-columns _1-col-tablet position-relative">
                                <div className="flex-horizontal position-relative">
                                    <div className="image-wrapper w-32 md:w-56 lg:w-80 relative h-32 md:h-56 lg:h-80">
                                        <Image
                                            src="/images/page-not-found-icon-paperfolio-webflow-template.svg"
                                            fill
                                            loading="eager"
                                            alt="Page Not Found - Paperfolio Webflow Template"
                                            style={{ objectFit: "contain" }}
                                        />
                                    </div>
                                </div>
                                <div id="w-node-ffe9a45f-94fb-9c90-1679-9bd8e1c7012d-33543d3f" className="inner-container _600px---tablet center">
                                    <div data-w-id="619efe17469a19c94a600b1500000000000b" className="utility-page-content mg-bottom-0 position-relative w-form">
                                        <div className="display-1 mg-bottom-8px">Oops!</div>
                                        <h1 className="display-2">Something went wrong</h1>
                                        <p className="mg-bottom-32px">{message}</p>
                                        <div className="flex justify-center lg:justify-start w-full">{params.type === "no-user" && <GetNewLink />}</div>
                                        {params.type === "already-active" ? (
                                            <div className="buttons-row center">
                                                <Link href="/auth/signIn" className="btn-primary full-width w-button">
                                                    Go to login page
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="buttons-row center">
                                                <Link href="/" className="btn-primary full-width w-button">
                                                    Go to homepage
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error;
