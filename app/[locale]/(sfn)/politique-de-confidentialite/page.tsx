import React from "react";
import { Locale } from "@/i18n";

type PrivacySection = {
    title: string;
    paragraphs?: Array<React.ReactNode>;
    items?: Array<React.ReactNode>;
};

type PrivacyContent = {
    title: string;
    subtitle: string;
    updatedAt: string;
    intro: React.ReactNode;
    sections: PrivacySection[];
};

const CONTACT_EMAIL = "yohann@startfrenchnow.ch";

const Mail = () => (
    <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
        {CONTACT_EMAIL}
    </a>
);

const ExtLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a className="underline" href={href} target="_blank" rel="noopener noreferrer">
        {children}
    </a>
);

const CONTENT: Record<Locale, PrivacyContent> = {
    fr: {
        title: "Politique de confidentialité",
        subtitle: "Quelles données nous collectons, pourquoi, et comment les contrôler.",
        updatedAt: "Dernière mise à jour : 11 novembre 2026",
        intro: (
            <>
                Cette politique explique comment Start French Now (startfrenchnow.ch) collecte et utilise vos données personnelles. Nous collectons uniquement
                ce qui est nécessaire pour vous proposer nos cours, examens blancs et services. Pour toute question : <Mail />.
            </>
        ),
        sections: [
            {
                title: "1. Responsable du traitement",
                items: [
                    "Yohann COUSSOT, entrepreneur individuel (SIREN 837 766 526).",
                    "6 rue des Morands, 71210 Saint-Eusèbe, France.",
                    <>
                        Contact : <Mail />.
                    </>,
                ],
            },
            {
                title: "2. Données que nous collectons",
                items: [
                    "Compte : adresse e-mail, nom et prénom, et mot de passe (stocké uniquement sous forme chiffrée) si vous créez un compte avec e-mail.",
                    "Connexion avec Google : votre adresse e-mail et votre nom (voir la section 3).",
                    "Apprentissage : progression dans les cours, réponses et résultats aux exercices, jeux et examens blancs, leçons et crédits achetés, notifications.",
                    "Examens blancs oraux : les enregistrements audio de vos réponses et leur transcription écrite.",
                    "Paiements : produit acheté, montant, date et adresse e-mail. Les données de carte bancaire sont saisies directement chez Stripe : nous ne les voyons jamais.",
                    "Newsletter et guide gratuit : votre adresse e-mail, si vous vous inscrivez.",
                    "Rendez-vous et cours privés : nom, e-mail et créneau choisi lors d'une réservation via Calendly.",
                    "Formulaire de contact : nom, e-mail et contenu de votre message.",
                    "Données techniques : pages consultées, type d'appareil et de navigateur, adresse IP, et cookies (voir la section 6).",
                ],
            },
            {
                title: "3. Connexion avec Google",
                paragraphs: [
                    "Si vous choisissez « Continuer avec Google », Google nous transmet uniquement votre adresse e-mail et votre nom (autorisations « openid », « email » et « profile »). Google ne nous transmet jamais votre mot de passe, et nous n'avons accès à aucune autre donnée de votre compte Google (e-mails, fichiers, contacts, etc.).",
                    "Ces informations servent uniquement à créer votre compte, à vous identifier lors de vos connexions et à vous envoyer des e-mails liés à votre compte. Nous ne les vendons pas, ne les utilisons pas pour entraîner des modèles d'intelligence artificielle et ne les transmettons pas à des tiers à des fins publicitaires, à l'exception de la mesure des achats décrite à la section 6, uniquement si vous l'avez acceptée.",
                    <>
                        L'utilisation et le transfert des informations reçues des API Google respectent les{" "}
                        <ExtLink href="https://developers.google.com/terms/api-services-user-data-policy">
                            Règles relatives aux données utilisateur des services d'API Google
                        </ExtLink>
                        , y compris les exigences d'utilisation limitée.
                    </>,
                    <>
                        Vous pouvez retirer l'accès de Start French Now à votre compte Google à tout moment depuis{" "}
                        <ExtLink href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</ExtLink>, et demander la suppression de votre
                        compte à <Mail />.
                    </>,
                ],
            },
            {
                title: "4. Pourquoi nous utilisons vos données",
                items: [
                    "Fournir les services que vous demandez (compte, cours, exercices, examens blancs, cours privés, paiements) : exécution du contrat.",
                    "Corriger automatiquement vos réponses aux examens blancs : exécution du contrat.",
                    "Vous envoyer la newsletter et le guide gratuit : votre consentement, que vous pouvez retirer via le lien de désinscription présent dans chaque e-mail.",
                    "Mesurer l'audience et l'efficacité de nos publicités : votre consentement aux cookies.",
                    "Assurer la sécurité du site et prévenir la fraude : notre intérêt légitime.",
                    "Conserver les justificatifs de paiement : obligation légale (comptabilité).",
                ],
            },
            {
                title: "5. Prestataires qui traitent vos données",
                paragraphs: ["Nous ne vendons jamais vos données. Nous faisons appel aux prestataires suivants, uniquement pour les besoins indiqués :"],
                items: [
                    "Vercel : hébergement du site.",
                    "Sanity : base de données (comptes, progression, achats).",
                    "Amazon Web Services (région Paris) : stockage des enregistrements audio des examens blancs.",
                    "OpenAI : transcription des enregistrements audio et correction automatique des réponses aux examens blancs. Ces contenus ne contiennent ni votre nom ni votre e-mail.",
                    "Stripe : paiement en ligne.",
                    "MailerLite : envoi de la newsletter et des e-mails d'information.",
                    "Hostinger : envoi des e-mails liés à votre compte (activation, mot de passe, confirmation d'achat).",
                    "Calendly : prise de rendez-vous pour les cours privés.",
                    "Google : connexion avec Google, Google Analytics et Google Ads (ces deux derniers uniquement avec votre consentement).",
                    "Meta (Facebook, Instagram) : mesure de l'efficacité des publicités, uniquement avec votre consentement.",
                    "Microsoft Clarity : analyse anonyme de la navigation, uniquement avec votre consentement.",
                    "YouTube : lecture des vidéos intégrées au site.",
                ],
            },
            {
                title: "6. Cookies et mesure d'audience",
                paragraphs: [
                    "Lors de votre première visite, un bandeau vous permet d'accepter ou de refuser les cookies non indispensables (Google Analytics, Google Ads, pixel Meta, Microsoft Clarity). Ils ne sont déposés que si vous les acceptez. Vous pouvez changer d'avis à tout moment via le lien « Gérer les cookies » en bas de chaque page.",
                    "Si vous avez accepté le pixel Meta et que vous effectuez un achat, nous transmettons à Meta l'événement d'achat accompagné d'une version chiffrée de façon irréversible (hachée) de votre adresse e-mail, afin de mesurer l'efficacité de nos publicités. Sans votre consentement, rien n'est transmis.",
                    "Vercel Analytics mesure la fréquentation du site de manière agrégée, sans cookie.",
                ],
            },
            {
                title: "7. Durée de conservation",
                items: [
                    "Compte et progression : tant que votre compte existe. Vous pouvez demander sa suppression à tout moment.",
                    "Enregistrements audio des examens blancs : tant que votre compte existe.",
                    "Justificatifs de paiement : 10 ans (obligation comptable).",
                    "Newsletter : jusqu'à votre désinscription.",
                    "Messages envoyés via le formulaire de contact : 3 ans maximum.",
                    "Choix concernant les cookies : 12 mois.",
                ],
            },
            {
                title: "8. Transferts hors de l'Union européenne",
                paragraphs: [
                    "Certains prestataires (notamment Vercel, OpenAI, Stripe, Calendly, Google, Meta et Microsoft) peuvent traiter des données aux États-Unis. Ces transferts sont encadrés par le Data Privacy Framework UE–États-Unis ou par les clauses contractuelles types de la Commission européenne.",
                ],
            },
            {
                title: "9. Vos droits",
                paragraphs: [
                    <>
                        Conformément au RGPD et à la loi suisse sur la protection des données (nLPD), vous pouvez à tout moment accéder à vos données, les
                        corriger, les supprimer, en demander une copie, vous opposer à leur utilisation ou retirer votre consentement. Écrivez-nous à <Mail /> :
                        nous répondons dans un délai d'un mois.
                    </>,
                    <>
                        Vous pouvez aussi adresser une réclamation à la <ExtLink href="https://www.cnil.fr/fr/plaintes">CNIL</ExtLink> (France) ou au{" "}
                        <ExtLink href="https://www.edoeb.admin.ch">Préposé fédéral à la protection des données (PFPDT)</ExtLink> (Suisse).
                    </>,
                ],
            },
            {
                title: "10. Sécurité",
                paragraphs: [
                    "Le site est accessible uniquement en HTTPS, les mots de passe sont stockés sous forme chiffrée et l'accès aux données est limité aux personnes qui en ont besoin pour gérer le service.",
                ],
            },
            {
                title: "11. Modifications",
                paragraphs: ["Nous pouvons mettre à jour cette politique. La date de dernière mise à jour est indiquée en haut de cette page."],
            },
        ],
    },
    en: {
        title: "Privacy policy",
        subtitle: "What data we collect, why, and how you can control it.",
        updatedAt: "Last updated: November 11, 2026",
        intro: (
            <>
                This policy explains how Start French Now (startfrenchnow.ch) collects and uses your personal data. We only collect what is needed to
                provide our courses, mock exams and services. Any question: <Mail />.
            </>
        ),
        sections: [
            {
                title: "1. Data controller",
                items: [
                    "Yohann COUSSOT, sole proprietor (SIREN 837 766 526).",
                    "6 rue des Morands, 71210 Saint-Eusèbe, France.",
                    <>
                        Contact: <Mail />.
                    </>,
                ],
            },
            {
                title: "2. Data we collect",
                items: [
                    "Account: email address, first and last name, and password (stored only in encrypted form) if you sign up with email.",
                    "Sign in with Google: your email address and name (see section 3).",
                    "Learning: course progress, answers and results in exercises, games and mock exams, lessons and credits purchased, notifications.",
                    "Oral mock exams: audio recordings of your answers and their written transcription.",
                    "Payments: product purchased, amount, date and email address. Card details are entered directly with Stripe: we never see them.",
                    "Newsletter and free guide: your email address, if you subscribe.",
                    "Appointments and private lessons: name, email and chosen time slot when you book through Calendly.",
                    "Contact form: name, email and the content of your message.",
                    "Technical data: pages visited, device and browser type, IP address, and cookies (see section 6).",
                ],
            },
            {
                title: "3. Sign in with Google",
                paragraphs: [
                    "If you choose “Continue with Google”, Google only shares your email address and name with us (“openid”, “email” and “profile” permissions). Google never shares your password, and we have no access to any other data in your Google account (emails, files, contacts, etc.).",
                    "This information is used only to create your account, identify you when you sign in and send you emails about your account. We do not sell it, do not use it to train artificial intelligence models, and do not share it with third parties for advertising purposes, except for the purchase measurement described in section 6, and only if you have accepted it.",
                    <>
                        Start French Now&apos;s use and transfer of information received from Google APIs adheres to the{" "}
                        <ExtLink href="https://developers.google.com/terms/api-services-user-data-policy">Google API Services User Data Policy</ExtLink>,
                        including the Limited Use requirements.
                    </>,
                    <>
                        You can remove Start French Now&apos;s access to your Google account at any time from{" "}
                        <ExtLink href="https://myaccount.google.com/permissions">myaccount.google.com/permissions</ExtLink>, and request deletion of your account
                        at <Mail />.
                    </>,
                ],
            },
            {
                title: "4. Why we use your data",
                items: [
                    "To provide the services you request (account, courses, exercises, mock exams, private lessons, payments): performance of a contract.",
                    "To automatically grade your mock exam answers: performance of a contract.",
                    "To send you the newsletter and free guide: your consent, which you can withdraw using the unsubscribe link in every email.",
                    "To measure audience and the effectiveness of our ads: your consent to cookies.",
                    "To keep the site secure and prevent fraud: our legitimate interest.",
                    "To keep payment records: legal obligation (accounting).",
                ],
            },
            {
                title: "5. Service providers that process your data",
                paragraphs: ["We never sell your data. We use the following providers, only for the purposes indicated:"],
                items: [
                    "Vercel: website hosting.",
                    "Sanity: database (accounts, progress, purchases).",
                    "Amazon Web Services (Paris region): storage of mock exam audio recordings.",
                    "OpenAI: transcription of audio recordings and automatic grading of mock exam answers. This content contains neither your name nor your email.",
                    "Stripe: online payments.",
                    "MailerLite: newsletter and information emails.",
                    "Hostinger: account-related emails (activation, password, purchase confirmation).",
                    "Calendly: booking private lessons.",
                    "Google: Sign in with Google, Google Analytics and Google Ads (the last two only with your consent).",
                    "Meta (Facebook, Instagram): measuring ad effectiveness, only with your consent.",
                    "Microsoft Clarity: anonymous browsing analytics, only with your consent.",
                    "YouTube: playback of videos embedded on the site.",
                ],
            },
            {
                title: "6. Cookies and analytics",
                paragraphs: [
                    "On your first visit, a banner lets you accept or refuse non-essential cookies (Google Analytics, Google Ads, Meta pixel, Microsoft Clarity). They are only set if you accept them. You can change your mind at any time using the “Manage cookies” link at the bottom of every page.",
                    "If you have accepted the Meta pixel and make a purchase, we send Meta the purchase event together with an irreversibly encrypted (hashed) version of your email address, to measure the effectiveness of our ads. Without your consent, nothing is sent.",
                    "Vercel Analytics measures site traffic in aggregate, without cookies.",
                ],
            },
            {
                title: "7. Retention",
                items: [
                    "Account and progress: as long as your account exists. You can request its deletion at any time.",
                    "Mock exam audio recordings: as long as your account exists.",
                    "Payment records: 10 years (accounting obligation).",
                    "Newsletter: until you unsubscribe.",
                    "Contact form messages: 3 years maximum.",
                    "Cookie choices: 12 months.",
                ],
            },
            {
                title: "8. Transfers outside the European Union",
                paragraphs: [
                    "Some providers (including Vercel, OpenAI, Stripe, Calendly, Google, Meta and Microsoft) may process data in the United States. These transfers are covered by the EU–US Data Privacy Framework or by the European Commission's standard contractual clauses.",
                ],
            },
            {
                title: "9. Your rights",
                paragraphs: [
                    <>
                        Under the GDPR and the Swiss Federal Act on Data Protection (FADP), you can at any time access, correct or delete your data, request a
                        copy, object to its use or withdraw your consent. Email us at <Mail />: we reply within one month.
                    </>,
                    <>
                        You can also lodge a complaint with the <ExtLink href="https://www.cnil.fr/en/complaints">CNIL</ExtLink> (France) or the{" "}
                        <ExtLink href="https://www.edoeb.admin.ch">Federal Data Protection and Information Commissioner (FDPIC)</ExtLink> (Switzerland).
                    </>,
                ],
            },
            {
                title: "10. Security",
                paragraphs: [
                    "The site is only available over HTTPS, passwords are stored in encrypted form, and access to data is limited to the people who need it to run the service.",
                ],
            },
            {
                title: "11. Changes",
                paragraphs: ["We may update this policy. The date of the last update is shown at the top of this page."],
            },
        ],
    },
};

async function PolitiqueDeConfidentialite(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = params.locale as Locale;
    const content = CONTENT[locale] ?? CONTENT.fr;

    return (
        <div className="page-wrapper">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="mx-auto max-w-[820px]">
                        <div className="mb-[50px]">
                            <h1 className="display-1 color-neutral-800 mg-bottom-0">{content.title}</h1>
                            <p className="mt-4 mg-bottom-0 text-xl">{content.subtitle}</p>
                            <p className="mt-2 mg-bottom-0 text-sm text-neutral-600">{content.updatedAt}</p>
                        </div>

                        <p className="mg-bottom-32px text-neutral-700">{content.intro}</p>

                        {content.sections.map((section) => (
                            <div key={section.title} className="mg-bottom-32px">
                                <h2 className="text-xl font-semibold text-neutral-800">{section.title}</h2>
                                {section.paragraphs?.map((paragraph, index) => (
                                    <p key={`${section.title}-p-${index}`} className="mt-3 mg-bottom-0 text-neutral-700">
                                        {paragraph}
                                    </p>
                                ))}
                                {section.items && (
                                    <ul className="mt-3 list-disc space-y-2 pl-6 text-neutral-700">
                                        {section.items.map((item, index) => (
                                            <li key={`${section.title}-i-${index}`}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PolitiqueDeConfidentialite;
