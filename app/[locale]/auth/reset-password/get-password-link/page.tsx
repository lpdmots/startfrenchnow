import { SlideFromBottom } from "@/app/components/animations/Slides";
import { GetNewLink } from "@/app/components/auth/GetNewLink";
import Image from "next/image";
import Link from "next-intl/link";
import React from "react";
import { useTranslations } from "next-intl";

const GetPasswordLink = () => {
    const t = useTranslations("Auth.GetPasswordLink");
    const tLink = useTranslations("Auth.GetNewLink");
    const tEmail = useTranslations("Auth.Email");

    const messages = {
        placeholder: tLink("placeholder"),
        btnGetLink: tLink("btnGetLink"),
        errorEmptyEmail: tLink("errorEmptyEmail"),
        successMessage: tLink("successMessage"),
        errorMessage: tLink("errorMessage"),
        ResetPasswordMail: {
            subject: tEmail("ResetPasswordMail.subject"),
            body: tEmail.raw("ResetPasswordMail.body"),
        },
    };

    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <div className="utility-page-wrap not-found">
                <div className="container-default w-container">
                    <div className="position-relative z-index-1">
                        <div className="flex-horizontal">
                            <div id="w-node-d245282e-bd6f-ff12-2569-ce176b30a962-33543d3f" data-w-id="d245282e-bd6f-ff12-2569-ce176b30a962" className="position-absolute _404-not-found">
                                <div className="_404-not-found-number">****</div>
                            </div>
                            <div className="grid-2-columns _1-col-tablet position-relative">
                                <div className="flex justify-center w-full">
                                    <SlideFromBottom>
                                        <div className="flex justify-center">
                                            <div className="image-wrapper rigth-shadow-circle" style={{ height: 200, width: 200 }}>
                                                <Image
                                                    src="/images/password-protected-paperfolio-webflow-template.svg"
                                                    height={200}
                                                    width={200}
                                                    alt="The teacher"
                                                    className="image object-contain"
                                                    priority
                                                />
                                            </div>
                                        </div>
                                    </SlideFromBottom>
                                </div>
                                <div id="w-node-ffe9a45f-94fb-9c90-1679-9bd8e1c7012d-33543d3f" className="inner-container _600px---tablet center">
                                    <div data-w-id="619efe17469a19c94a600b1500000000000b" className="utility-page-content mg-bottom-0 position-relative w-form">
                                        <h1 className="display-1 mg-bottom-8px">{t("title")}</h1>
                                        <p className="display-3">{t("subtitle")}</p>
                                        <p className="mg-bottom-32px">{t("instruction")}</p>
                                        <div className="flex justify-center lg:justify-start w-full">
                                            <GetNewLink linkFor="resetPassword" messages={messages} />
                                        </div>
                                        <div className="buttons-row center">
                                            <Link href="/auth/signIn" className="btn-primary full-width w-button">
                                                {t("returnToLogin")}
                                            </Link>
                                        </div>
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

export default GetPasswordLink;
