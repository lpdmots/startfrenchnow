import React from "react";
import { Locale } from "@/i18n";
import Image from "next/image";

type LegalSection = {
    title: string;
    items: Array<React.ReactNode>;
};

const CONTENT: Record<Locale, { title: string; subtitle: string; sections: LegalSection[]; imageTitle: string; imageHint: string }> = {
    fr: {
        title: "Mentions légales",
        subtitle: "Informations légales et contacts.",
        sections: [
            {
                title: "Identité légale",
                items: [
                    "Vente en tant que personne physique (Entrepreneur individuel).",
                    "Nom légal : Yohann COUSSOT.",
                    "Forme juridique : Entrepreneur individuel (France).",
                ],
            },
            {
                title: "Adresse",
                items: ["6 rue des Morands, 71210 Saint-Eusèbe, France."],
            },
            {
                title: "Contact",
                items: [
                    <>
                        Email :{" "}
                        <a className="underline" href="mailto:yohann@startfrenchnow.com">
                            yohann@startfrenchnow.com
                        </a>
                        .
                    </>,
                    <>
                        Téléphone :{" "}
                        <a className="underline" href="tel:+33789765396">
                            +33 7 89 76 53 96
                        </a>
                        .
                    </>,
                ],
            },
            {
                title: "Immatriculation",
                items: ["SIREN : 837 766 526.", "SIRET (siège) : 837 766 526 00029."],
            },
            {
                title: "TVA",
                items: ["TVA non applicable, art. 293 B du CGI."],
            },
            {
                title: "Hébergement",
                items: ["Hébergeur : Vercel."],
            },
            {
                title: "Responsable de publication",
                items: ["Yohann COUSSOT."],
            },
            {
                title: "Propriété intellectuelle",
                items: ["L’ensemble des contenus (textes, visuels, marques) est protégé. Toute reproduction sans autorisation est interdite."],
            },
            {
                title: "Données personnelles",
                items: [
                    <>
                        Pour toute demande relative à vos données personnelles, contactez{" "}
                        <a className="underline" href="mailto:yohann@startfrenchnow.com">
                            yohann@startfrenchnow.com
                        </a>
                        .
                    </>,
                ],
            },
        ],
        imageTitle: "Image décorative",
        imageHint: "Espace réservé pour une image décorative à ajouter.",
    },
    en: {
        title: "Legal notice",
        subtitle: "Legal information and contacts.",
        sections: [
            {
                title: "Legal identity",
                items: ["Sales as an individual (sole proprietor).", "Legal name: Yohann COUSSOT.", "Legal form: Sole proprietor (France)."],
            },
            {
                title: "Address",
                items: ["6 rue des Morands, 71210 Saint-Eusèbe, France."],
            },
            {
                title: "Contact",
                items: [
                    <>
                        Email:{" "}
                        <a className="underline" href="mailto:yohann@startfrenchnow.com">
                            yohann@startfrenchnow.com
                        </a>
                        .
                    </>,
                    <>
                        Phone:{" "}
                        <a className="underline" href="tel:+33789765396">
                            +33 7 89 76 53 96
                        </a>
                        .
                    </>,
                ],
            },
            {
                title: "Registration",
                items: ["SIREN: 837 766 526.", "SIRET (registered office): 837 766 526 00029."],
            },
            {
                title: "VAT",
                items: ["VAT not applicable (article 293 B of the French Tax Code)."],
            },
            {
                title: "Hosting",
                items: ["Host: Vercel."],
            },
            {
                title: "Publishing director",
                items: ["Yohann COUSSOT."],
            },
            {
                title: "Intellectual property",
                items: ["All content (texts, visuals, trademarks) is protected. Any reproduction without authorization is prohibited."],
            },
            {
                title: "Personal data",
                items: [
                    <>
                        For any request regarding your personal data, contact{" "}
                        <a className="underline" href="mailto:yohann@startfrenchnow.com">
                            yohann@startfrenchnow.com
                        </a>
                        .
                    </>,
                ],
            },
        ],
        imageTitle: "Decorative image",
        imageHint: "Placeholder area for a decorative image.",
    },
};

function MentionsLegales({ params }: { params: { locale: string } }) {
    const locale = params.locale as Locale;
    const content = CONTENT[locale] ?? CONTENT.fr;

    return (
        <div className="page-wrapper">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center">
                            <div className="mb-[60px] max-[767px]:mb-[50px]">
                                <div className="text-center---tablet">
                                    <div className="w-layout-grid grid-2-columns title-and-paragraph v2">
                                        <div className="flex-horizontal start flex-wrap center---tablet">
                                            <h1 className="display-1 color-neutral-800 mg-bottom-0 ml-4">{content.title}</h1>
                                        </div>
                                        <div className="inner-container max-w-[560px] self-end">
                                            <p className="text-center md:text-right mg-bottom-0 text-xl underline">{content.subtitle}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-layout-grid grid-cols-1 lg:grid-cols-3 blog-left-sidebar">
                                <div className="col-span-1 lg:col-span-2">
                                    {content.sections.map((section) => (
                                        <div key={section.title} className="mg-bottom-32px">
                                            <h2 className="text-xl font-semibold text-neutral-800">{section.title}</h2>
                                            <ul className="mt-3 space-y-2 text-neutral-700">
                                                {section.items.map((item, index) => (
                                                    <li key={`${section.title}-${index}`}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>

                               <div className="w-full max-w-[400px] mx-auto">
                                    <Image
                                        src="/images/yoh-coussot.png"
                                        alt={content.imageTitle}
                                        width={400}
                                        height={400}
                                        className="w-full h-auto rounded-full shadow-2 border-4 border-solid border-neutral-800"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MentionsLegales;
