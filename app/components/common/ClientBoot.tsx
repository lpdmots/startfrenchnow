"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        __sfnConsentBootstrapped?: boolean;
        __sfnTacInitialized?: boolean;
        __sfnTacAddScriptPatched?: boolean;
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        tarteaucitron?: any;
    }
}

type Props = {
    gtmId: string;
    clarityId?: string | null;
};

export default function ClientBoot({ gtmId, clarityId }: Props) {
    useEffect(() => {
        if (typeof window === "undefined") return;
        if (window.__sfnConsentBootstrapped) return;
        window.__sfnConsentBootstrapped = true;

        try {
            const themeFromStorage = localStorage.getItem("sfn-theme");
            const themeFromCookie = document.cookie
                .split("; ")
                .find((row) => row.indexOf("sfn-theme=") === 0)
                ?.split("=")[1];
            const theme = themeFromStorage || themeFromCookie;
            document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
        } catch {}

        window.dataLayer = window.dataLayer || [];
        const gtag = (...args: unknown[]) => {
            window.dataLayer!.push(args);
        };
        window.gtag = gtag;

        const EEA_REGIONS = [
            "AT",
            "BE",
            "BG",
            "HR",
            "CY",
            "CZ",
            "DK",
            "EE",
            "FI",
            "FR",
            "DE",
            "GR",
            "HU",
            "IE",
            "IT",
            "LV",
            "LT",
            "LU",
            "MT",
            "NL",
            "PL",
            "PT",
            "RO",
            "SK",
            "SI",
            "ES",
            "SE",
            "IS",
            "LI",
            "NO",
        ];
        const GA_EXCLUDED_REGIONS = ["CN", "SG"];

        gtag("consent", "default", {
            ad_storage: "denied",
            ad_user_data: "denied",
            ad_personalization: "denied",
            analytics_storage: "denied",
            wait_for_update: 800,
            region: EEA_REGIONS,
        });

        gtag("consent", "default", {
            analytics_storage: "denied",
            region: GA_EXCLUDED_REGIONS,
        });

        gtag("consent", "default", {
            ad_storage: "granted",
            ad_user_data: "granted",
            ad_personalization: "granted",
            analytics_storage: "granted",
        });

        gtag("set", "ads_data_redaction", true);
        gtag("set", "url_passthrough", true);

        const initTarteaucitronAndGtm = () => {
            const tac = window.tarteaucitron;
            if (!tac || typeof tac.init !== "function" || window.__sfnTacInitialized) return;
            window.__sfnTacInitialized = true;

            tac.init({
                bodyPosition: "top",
                hashtag: "#tarteaucitron",
                cookieName: "tarteaucitron",
                orientation: "bottom",
                groupServices: true,
                showDetailsOnClick: true,
                serviceDefaultState: "wait",
                showAlertSmall: false,
                cookieslist: false,
                closePopup: false,
                DenyAllCta: true,
                AcceptAllCta: true,
                highPrivacy: true,
                handleBrowserDNTRequest: false,
                removeCredit: true,
                moreInfoLink: false,
                showIcon: false,
                useExternalCss: false,
                useExternalJs: false,
                mandatory: true,
                mandatoryCta: false,
                softConsentMode: false,
                googleConsentMode: true,
                bingConsentMode: true,
                dataLayer: false,
                serverSide: false,
                partnersList: true,
            });

            if (typeof tac.addScript === "function" && !window.__sfnTacAddScriptPatched) {
                window.__sfnTacAddScriptPatched = true;
                const originalAddScript = tac.addScript;
                tac.addScript = function (src: string, id: string, callback: (() => void) | undefined) {
                    try {
                        const isClarityTag = typeof src === "string" && src.indexOf("https://www.clarity.ms/tag/") === 0;
                        if (isClarityTag) {
                            const existing = document.querySelector('script[src^="https://www.clarity.ms/tag/"]');
                            if (existing) {
                                if (typeof callback === "function") {
                                    try {
                                        callback();
                                    } catch {}
                                }
                                return existing;
                            }
                        }
                    } catch {}
                    return originalAddScript.apply(this, [src, id, callback]);
                };
            }

            if (clarityId) {
                tac.user = tac.user || {};
                tac.user.clarity = clarityId;
                tac.job = tac.job || [];
                tac.job.push("clarity");
            }

            tac.services.sfn_ga4 = {
                key: "sfn_ga4",
                type: "analytic",
                name: "Google Analytics (via GTM)",
                uri: "https://policies.google.com/privacy",
                needConsent: true,
                cookies: ["_ga", "_ga_*"],
                js: function () {
                    gtag("consent", "update", { analytics_storage: "granted" });
                },
                fallback: function () {
                    if (tac.state && tac.state.sfn_ga4 === false) {
                        gtag("consent", "update", { analytics_storage: "denied" });
                    }
                },
            };

            tac.services.sfn_ads = {
                key: "sfn_ads",
                type: "ads",
                name: "Google Ads (via GTM)",
                uri: "https://policies.google.com/privacy",
                needConsent: true,
                cookies: ["_gcl_au", "_gcl_aw", "_gcl_dc", "_gcl_gb", "_gcl_*"],
                js: function () {
                    gtag("consent", "update", {
                        ad_storage: "granted",
                        ad_user_data: "granted",
                        ad_personalization: "granted",
                    });
                },
                fallback: function () {
                    if (tac.state && tac.state.sfn_ads === false) {
                        gtag("consent", "update", {
                            ad_storage: "denied",
                            ad_user_data: "denied",
                            ad_personalization: "denied",
                        });
                    }
                },
            };

            tac.job = tac.job || [];
            tac.job.push("sfn_ga4");
            tac.job.push("sfn_ads");

            (function (w: any, d: Document, l: string, i: string) {
                w[l] = w[l] || [];
                w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
                const f = d.getElementsByTagName("script")[0];
                const j = d.createElement("script");
                const dl = l !== "dataLayer" ? "&l=" + l : "";
                j.async = true;
                j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
                if (f?.parentNode) {
                    f.parentNode.insertBefore(j, f);
                    return;
                }
                d.head.appendChild(j);
            })(window, document, "dataLayer", gtmId);
        };

        if (window.tarteaucitron) {
            initTarteaucitronAndGtm();
            return;
        }

        const existingTacScript = document.querySelector('script[data-sfn-tac="1"]');
        if (existingTacScript) return;

        const tacScript = document.createElement("script");
        tacScript.src = "/tarteaucitron/tarteaucitron.min.js";
        tacScript.async = false;
        tacScript.setAttribute("data-sfn-tac", "1");
        tacScript.onload = initTarteaucitronAndGtm;
        document.head.appendChild(tacScript);
    }, [gtmId, clarityId]);

    return null;
}
