import "@/app/styles/globals.css";
import Providers from "./providers";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { Toaster } from "@/app/components/ui/toaster";
import { Metadata } from "next";
import { locales, type Locale } from "@/i18n";
import { cookies } from "next/headers";
import Script from "next/script";
import enMessages from "@/app/dictionaries/en.json";
import frMessages from "@/app/dictionaries/fr.json";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
    if (!locales.includes(locale)) notFound();

    const baseUrl = new URL((process.env.NEXT_PUBLIC_BASE_URL || "https://www.startfrenchnow.com").replace(/\/$/, ""));

    return {
        metadataBase: baseUrl,
        title: "Start French Now",
        robots: { index: true, follow: true },
        themeColor: [
            { media: "(prefers-color-scheme: light)", color: "#ffffff" },
            { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
        ],
        icons: { icon: "/favicon.ico" },
    };
}

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: Locale } }) {
    const { locale } = params;

    if (!GTM_ID) {
        throw new Error("Missing NEXT_PUBLIC_GTM_ID in .env.local");
    }

    // Show a 404 error if the user requests an unknown locale
    if (params.locale !== locale) {
        notFound();
    }

    // Applique le thème dès le rendu serveur
    const cookieTheme = cookies().get("sfn-theme")?.value;
    const ssrTheme = cookieTheme === "dark" ? "dark" : "light";

    const messages = locale === "fr" ? frMessages : enMessages;

    return (
        <html lang={locale} dir="ltr" data-theme={ssrTheme} suppressHydrationWarning className="font-sans">
            <head>
                <meta name="color-scheme" content="light dark" />
                {/* 1) Consent Mode v2: default = denied (Advanced mode) */}
                <Script id="consent-default" strategy="beforeInteractive">
                    {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){ dataLayer.push(arguments); }

                  var EEA_REGIONS = [
                    'AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT',
                    'LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE',
                    'IS','LI','NO'
                  ];

                  // ✅ Pays à exclure de GA
                  var GA_EXCLUDED_REGIONS = ['CN', 'SG'];

                  // 1) Consent par défaut = denied dans l’EEE
                  gtag('consent', 'default', {
                    ad_storage: 'denied',
                    ad_user_data: 'denied',
                    ad_personalization: 'denied',
                    analytics_storage: 'denied',
                    wait_for_update: 800,
                    region: EEA_REGIONS
                  });

                  // 1bis) Consent par défaut = analytics denied en Chine + Singapour
                  gtag('consent', 'default', {
                    analytics_storage: 'denied',
                    region: GA_EXCLUDED_REGIONS
                  });

                  // 2) Consent par défaut = granted pour le reste du monde
                  gtag('consent', 'default', {
                    ad_storage: 'granted',
                    ad_user_data: 'granted',
                    ad_personalization: 'granted',
                    analytics_storage: 'granted'
                  });

                  gtag('set', 'ads_data_redaction', true);
                  gtag('set', 'url_passthrough', true);
                `}
                </Script>

                {/* 2) Boot: load tarteaucitron early, then load GTM */}
                <Script id="tac-and-gtm-bootstrap" strategy="beforeInteractive">
                    {`
                  (function () {
                    var gtmId = ${JSON.stringify(GTM_ID)};
                    var clarityId = ${JSON.stringify(CLARITY_ID || "")};

                    var tacScript = document.createElement('script');
                    tacScript.src = '/tarteaucitron/tarteaucitron.min.js';
                    tacScript.async = false;

                    tacScript.onload = function () {
                      tarteaucitron.init({
                        bodyPosition: 'top',
                        hashtag: '#tarteaucitron',
                        cookieName: 'tarteaucitron',

                        orientation: 'bottom',
                        groupServices: true,
                        showDetailsOnClick: true,
                        serviceDefaultState: 'wait',

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

                        // Advanced mode
                        softConsentMode: false,

                        // Consent Mode integrations
                        googleConsentMode: true,
                        bingConsentMode: true,

                        dataLayer: false,
                        serverSide: false,
                        partnersList: true
                      });

                      // Patch local: dedupe Clarity script injection (fallback + accept)
                      if (window.tarteaucitron && typeof tarteaucitron.addScript === "function" && !window.__sfnTacAddScriptPatched) {
                        window.__sfnTacAddScriptPatched = true;

                        (function () {
                          var originalAddScript = tarteaucitron.addScript;

                          tarteaucitron.addScript = function (src, id, callback) {
                            try {
                              var isClarityTag = typeof src === "string" && src.indexOf("https://www.clarity.ms/tag/") === 0;

                              if (isClarityTag) {
                                var existing = document.querySelector('script[src^="https://www.clarity.ms/tag/"]');

                                if (existing) {
                                  if (typeof callback === "function") {
                                    try { callback(); } catch (e) {}
                                  }
                                  return existing;
                                }
                              }
                            } catch (e) {}

                            return originalAddScript.apply(this, arguments);
                          };
                        })();
                      }

                      // --- Clarity via tarteaucitron (service natif) ---
                      if (clarityId) {
                        tarteaucitron.user.clarity = clarityId;
                        (tarteaucitron.job = tarteaucitron.job || []).push('clarity');
                      }

                      // --- Custom services to update Google Consent Mode for GTM tags ---
                      tarteaucitron.services.sfn_ga4 = {
                        key: 'sfn_ga4',
                        type: 'analytic',
                        name: 'Google Analytics (via GTM)',
                        uri: 'https://policies.google.com/privacy',
                        needConsent: true,
                        cookies: ['_ga', '_ga_*'],
                        js: function () {
                          gtag('consent', 'update', { analytics_storage: 'granted' });
                        },
                        fallback: function () {
                          // IMPORTANT:
                          // Do NOT force denied while status is "wait".
                          // Only send denied if user explicitly refused.
                          if (tarteaucitron.state && tarteaucitron.state.sfn_ga4 === false) {
                            gtag('consent', 'update', { analytics_storage: 'denied' });
                          }
                        }
                      };

                      tarteaucitron.services.sfn_ads = {
                        key: 'sfn_ads',
                        type: 'ads',
                        name: 'Google Ads (via GTM)',
                        uri: 'https://policies.google.com/privacy',
                        needConsent: true,
                        cookies: ['_gcl_au', '_gcl_aw', '_gcl_dc', '_gcl_gb', '_gcl_*'],
                        js: function () {
                          gtag('consent', 'update', {
                            ad_storage: 'granted',
                            ad_user_data: 'granted',
                            ad_personalization: 'granted'
                          });
                        },
                        fallback: function () {
                          // IMPORTANT:
                          // Do NOT force denied while status is "wait".
                          // Only send denied if user explicitly refused.
                          if (tarteaucitron.state && tarteaucitron.state.sfn_ads === false) {
                            gtag('consent', 'update', {
                              ad_storage: 'denied',
                              ad_user_data: 'denied',
                              ad_personalization: 'denied'
                            });
                          }
                        }
                      };

                      (tarteaucitron.job = tarteaucitron.job || []).push('sfn_ga4');
                      (tarteaucitron.job = tarteaucitron.job || []).push('sfn_ads');

                      // Load GTM after CMP is ready
                      (function(w,d,s,l,i){
                        w[l]=w[l]||[];
                        w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
                        var f=d.getElementsByTagName(s)[0],
                            j=d.createElement(s),
                            dl=l!='dataLayer'?'&l='+l:'';
                        j.async=true;
                        j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                        f.parentNode.insertBefore(j,f);
                      })(window,document,'script','dataLayer',gtmId);
                    };

                    document.head.appendChild(tacScript);
                  })();
                `}
                </Script>
            </head>
            <body>
                <main id="root">
                    <NextIntlClientProvider locale={locale} messages={messages}>
                        <Providers>{children}</Providers>
                    </NextIntlClientProvider>
                    <Toaster />
                </main>
            </body>
        </html>
    );
}

/* 
                        // GA4
                        tarteaucitron.user.gtagUa = "G-PPY9RQ1KFB";
                        (tarteaucitron.job = tarteaucitron.job || []).push("gtag");

                        // Google Ads
                        tarteaucitron.user.googleadsId = "AW-17915209574";
                        (tarteaucitron.job = tarteaucitron.job || []).push("googleads");
*/

{
    /* <Script id="tac-init" strategy="beforeInteractive">
                    {`
                        tarteaucitron.init({
                            bodyPosition: "top",
                            orientation: "bottom",         
                            DenyAllCta: true,
                            AcceptAllCta: true,
                            highPrivacy: true,
                            showIcon: false,
                            showAlertSmall: false,
                            cookieslist: true,
                            googleConsentMode: true,
                            iconPosition: "BottomLeft",
                            removeCredit: true,
                            moreInfoLink: false,
                        });
                        tarteaucitron.user.googletagmanagerId = "GTM-PGLSLXZD";
                        (tarteaucitron.job = tarteaucitron.job || []).push("googletagmanager");
                    `}
                </Script> */
}

/* <Script src="/tarteaucitron/tarteaucitron.min.js" strategy="beforeInteractive" />
                <Script id="tac-init" strategy="beforeInteractive">
                    {`
    // --- Google Consent Mode (minimal) ---
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }

    // Default: denied until user choice is known
    gtag('consent', 'default', {
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });

    // --- Tarteaucitron init ---
    tarteaucitron.init({
      bodyPosition: "top",
      orientation: "bottom",
      DenyAllCta: true,
      AcceptAllCta: true,
      highPrivacy: true,
      showIcon: false,
      showAlertSmall: false,
      cookieslist: true,
      googleConsentMode: true,
      iconPosition: "BottomLeft",
      removeCredit: true,
      moreInfoLink: false,
    });

    tarteaucitron.user.googletagmanagerId = "GTM-PGLSLXZD";
    (tarteaucitron.job = tarteaucitron.job || []).push("googletagmanager");

    // --- Sync TAC toggle -> Consent update ---
    function getTACFlag(serviceName){
      var m = document.cookie.match(/(?:^|;\\s*)tarteaucitron=([^;]*)/);
      if(!m) return null;
      var v = decodeURIComponent(m[1]);
      var mm = v.match(new RegExp('!' + serviceName + '=(true|false)'));
      return mm ? (mm[1] === 'true') : null;
    }

    function syncConsentFromTAC(){
      var allowed = getTACFlag('googletagmanager'); // your single toggle
      if (allowed === null) return;

      var state = allowed ? 'granted' : 'denied';
      gtag('consent', 'update', {
        ad_storage: state,
        analytics_storage: state,
        ad_user_data: state,
        ad_personalization: state
      });
    }

    // Sync once on load (if choice already stored)
    syncConsentFromTAC();

    // Also sync right after user clicks "Enregistrer" (simple + robust)
    if (tarteaucitron.userInterface && typeof tarteaucitron.userInterface.save === 'function') {
      var _save = tarteaucitron.userInterface.save;
      tarteaucitron.userInterface.save = function(){
        _save.apply(this, arguments);
        setTimeout(syncConsentFromTAC, 50);
      };
    }

    // Fallback: short polling in case save hook differs in your TAC build
    (function(){
      var tries = 0;
      var last = null;
      var t = setInterval(function(){
        tries++;
        var allowed = getTACFlag('googletagmanager');
        if (allowed !== null && allowed !== last) {
          last = allowed;
          syncConsentFromTAC();
        }
        if (tries > 40) clearInterval(t); // ~10s max
      }, 250);
    })();
  `}
                </Script> */
