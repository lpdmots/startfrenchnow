import { SlideFromBottom } from "@/app/components/animations/Slides";
import Image from "next/image";
import Link from "next-intl/link";
import React from "react";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

const Activated = () => {
    const t = useTranslations("Auth.Activated");

    return (
        <div className="flex flex-col min-h-screen justify-center items-center">
            <div className="utility-page-wrap not-found">
                <div className="container-default w-container">
                    <div className="position-relative z-index-1">
                        <div className="flex-horizontal">
                            <div id="w-node-d245282e-bd6f-ff12-2569-ce176b30a962-33543d3f" data-w-id="d245282e-bd6f-ff12-2569-ce176b30a962" className="position-absolute _404-not-found">
                                <div className="_404-not-found-number">200</div>
                            </div>
                            <div className="grid-2-columns _1-col-tablet position-relative">
                                <div className="flex justify-center w-full">
                                    <div className="image-wrapper hero-image" style={{ height: 270, width: 234, backgroundColor: "var(--primary)" }}>
                                        <SlideFromBottom>
                                            <Image src="/images/teacher-inversed-activated.png" height={270} width={234} alt="The teacher" className="image, object-cover" priority />
                                        </SlideFromBottom>
                                    </div>
                                </div>
                                <div id="w-node-ffe9a45f-94fb-9c90-1679-9bd8e1c7012d-33543d3f" className="inner-container _600px---tablet center">
                                    <div data-w-id="619efe17469a19c94a600b1500000000000b" className="utility-page-content mg-bottom-0 position-relative w-form">
                                        <div className="display-1 mg-bottom-8px">{t("congratulations")}</div>
                                        <h1 className="display-2">{t("title")}</h1>
                                        <p className="mg-bottom-32px">{t.rich("description", intelRich())}</p>
                                        <div className="buttons-row center">
                                            <Link href="/auth/signIn" className="btn-primary full-width w-button">
                                                {t("btnLogin")}
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

export default Activated;
