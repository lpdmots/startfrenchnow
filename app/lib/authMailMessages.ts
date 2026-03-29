export type AuthLocale = "fr" | "en";

type MailMessage = {
    subject: string;
    body: string;
};

export type SystemNotificationMessage = {
    title: string;
    body: string;
    link?: string;
};

const CALENDLY_STUDY_PLAN_URL = "https://calendly.com/yohann-startfrenchnow/15min";

export function resolveAuthLocale(localeLike?: string | null): AuthLocale {
    const value = (localeLike || "").trim().toLowerCase();
    if (value.startsWith("en")) return "en";
    return "fr";
}

export const activationMailMessagesByLocale: Record<AuthLocale, MailMessage> = {
    fr: {
        subject: "Activation de votre compte Start French Now",
        body: "<p>Bonjour USERNAME,</p><br><p>Votre lien d'activation précédent a expiré.</p><p>Pour activer votre compte, veuillez cliquer sur le lien suivant : <span><a href='DOMAIN/api/auth/activate/ACTIVATETOKEN/fr'>activer mon compte</a></span>.</p><br><p>À très bientôt !</p><p>Cordialement,</p>",
    },
    en: {
        subject: "Please activate your account and Start French Now",
        body: "<p>Hello USERNAME,</p><br><p>Your previous activation link has expired.</p><p>Please click <span><a href='DOMAIN/api/auth/activate/ACTIVATETOKEN/en'>here</a></span> to activate your account.</p><br><p>See you soon on Start French Now!</p><p>Best regards,</p>",
    },
};

export const welcomeMailMessagesByLocale: Record<AuthLocale, MailMessage> = {
    fr: {
        subject: "Start French Now : par où commencer ?",
        body: "<p>Bonjour USERNAME,</p><p>Ravi de faire votre connaissance.</p><p>Sur le site, vous trouverez déjà tout pour commencer dès aujourd'hui :</p><ul><li>des cours de français pour progresser étape par étape</li><li>une section FIDE dédiée pour travailler vos objectifs</li><li>des vidéos + exercices pour pratiquer un peu chaque jour</li></ul><p>Si vous voulez aller plus vite, avec un cadre clair :</p><ul><li>des packs e-learning (guidés, simples et efficaces)</li><li>des cours privés FIDE (scénarios réels, corrections, objectifs personnalisés)</li></ul><p>Le plus simple : réservez votre plan d'étude gratuit (15 min) ici :<br/><a href='https://calendly.com/yohann-startfrenchnow/15min'>https://calendly.com/yohann-startfrenchnow/15min</a></p><p>Ou répondez simplement à cet email en me disant votre objectif.</p><p>À bientôt,</p>",
    },
    en: {
        subject: "Start French Now: where should you begin?",
        body: "<p>Hi USERNAME,</p><p>Great to meet you.</p><p>On the website, you'll already find everything you need to get started today:</p><ul><li>French courses to improve step by step</li><li>a dedicated FIDE section to work on your goals</li><li>videos + exercises to practice a little every day</li></ul><p>If you want faster, more structured progress:</p><ul><li>guided e-learning packs (simple and effective)</li><li>private FIDE lessons (real scenarios, corrections, personalized goals)</li></ul><p>Easiest option: book your free study plan (15 min) here:<br/><a href='https://calendly.com/yohann-startfrenchnow/15min'>https://calendly.com/yohann-startfrenchnow/15min</a></p><p>Or simply reply to this email and tell me your goal.</p><p>See you soon,</p>",
    },
};

function getFirstName(nameLike?: string | null, locale: AuthLocale = "fr"): string {
    const name = (nameLike || "").trim();
    if (!name) return locale === "fr" ? "vous" : "there";
    return name.split(/\s+/)[0];
}

export function buildWelcomeSystemNotification(locale: AuthLocale, userName?: string | null): SystemNotificationMessage {
    const firstName = getFirstName(userName, locale);
    if (locale === "en") {
        return {
            title: "Welcome to Start French Now",
            body: `Hi ${firstName}, great to have you with us.

On Start French Now, you can begin today with:
• step-by-step French courses
• a dedicated FIDE section
• videos + exercises to practice every day

To progress faster:
• guided e-learning packs (mock exam)
• private FIDE lessons (real scenarios, corrections, personalized goals)

Easiest option: book your free 15-minute study plan.`,
            link: CALENDLY_STUDY_PLAN_URL,
        };
    }

    return {
        title: "Bienvenue sur Start French Now",
        body: `Bonjour ${firstName}, ravi de vous compter parmi nous.

Sur Start French Now, vous pouvez commencer dès aujourd'hui avec :
• des cours de français progressifs
• une section FIDE dédiée
• des vidéos + exercices pour pratiquer chaque jour

Pour progresser plus vite :
• des packs e-learning (examen blanc)
• des cours privés FIDE (scénarios réels, corrections, objectifs personnalisés)

Le plus simple : réservez votre plan d'étude gratuit (15 min).`,
        link: CALENDLY_STUDY_PLAN_URL,
    };
}
