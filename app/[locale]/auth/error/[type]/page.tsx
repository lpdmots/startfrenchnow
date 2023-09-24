import { GetNewLink } from "@/app/components/auth/GetNewLink";
import Image from "next/image";
import Link from "next-intl/link";
import React from "react";
import { useTranslations } from "next-intl";

type TypeProps = "no-user" | "already-active" | "expired";

const Error = ({ params }: { params: { type: TypeProps } }) => {
    const t = useTranslations("Auth.Error");
    const tLink = useTranslations("Auth.GetNewLink");
    const tEmail = useTranslations("Auth.Email");

    const messages = {
        placeholder: tLink("placeholder"),
        btnGetLink: tLink("btnGetLink"),
        errorEmptyEmail: tLink("errorEmptyEmail"),
        successMessage: tLink("successMessage"),
        errorMessage: tLink("errorMessage"),
        activationEmail: {
            subject: tEmail("activationEmail.subject"),
            body: tEmail.raw("activationEmail.body"),
        },
    };

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
                                        <div className="display-1 mg-bottom-8px">{t("oops")}</div>
                                        <h1 className="display-2">{t("title")}</h1>
                                        <p className="mg-bottom-32px">{t(`messages.${params.type}`)}</p>
                                        <div className="flex justify-center lg:justify-start w-full">{params.type === "no-user" && <GetNewLink messages={messages} />}</div>
                                        {params.type === "already-active" ? (
                                            <div className="buttons-row center">
                                                <Link href="/auth/signIn" className="btn-primary full-width w-button">
                                                    {t("btnLogin")}
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="buttons-row center">
                                                <Link href="/" className="btn-primary full-width w-button">
                                                    {t("btnHome")}
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
