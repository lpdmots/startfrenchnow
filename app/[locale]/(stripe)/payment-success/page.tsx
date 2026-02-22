import { NotebookPen } from "lucide-react";
import Link from "next-intl/link";
import Image from "next/image";
import { FaHome } from "react-icons/fa";
import { getServerSession } from "next-auth";
import { useTranslations } from "next-intl";
import { authOptions } from "@/app/lib/authOptions";
import { Locale } from "@/i18n";
import { intelRich } from "@/app/lib/intelRich";

export const metadata = {
    robots: { index: false, follow: false },
};

type PaymentSuccessProps = {
    searchParams: {
        amount?: string;
        currency?: string;
        slug?: string;
    };
    params: { locale: Locale };
};

export default async function PaymentSuccess({ params: { locale }, searchParams }: PaymentSuccessProps) {
    const session = await getServerSession(authOptions);

    return <PaymentSuccessNoAsync searchParams={searchParams} session={session} locale={locale} />;
}

const PaymentSuccessNoAsync = ({ searchParams, session, locale }: { searchParams: PaymentSuccessProps["searchParams"]; session: any; locale: Locale }) => {
    const { amount = "", currency = "", slug = "" } = searchParams;
    const t = useTranslations("Checkout.PaymentSuccess");

    const isLoggedIn = !!session?.user?.email;

    const signInHref = (() => {
        // On renvoie l’utilisateur après auth vers la page “slug” (si dispo), sinon home
        const callbackUrl = slug || "/";
        return `/auth/signIn?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    })();

    return (
        <main className="min-h-screen p-2 flex items-center justify-center">
            <div className="max-w-6xl flex flex-col card p-4 lg:p-8 justify-center items-center gap-4">
                <h1 className="text-4xl font-extrabold mb-0 heading-span-secondary-4">{t("thankYou")}</h1>
                <h2 className="text-2xl mb-0">{t("successMessage")}</h2>

                {(amount || currency) && (
                    <div className="text-4xl font-bold text-secondary-2">
                        {amount} {currency}
                    </div>
                )}

                <Image
                    src="/images/teacher-inversed-activated.png"
                    alt={t("successImageAlt")}
                    height={200}
                    width={200}
                    className="contain rounded-xl"
                    style={{ border: "2px solid var(--neutral-800)" }}
                />

                {/* ✅ Si pas connecté : CTA "Se connecter" + message */}
                {!isLoggedIn && (
                    <div className="w-full max-w-xl text-center">
                        <p className="text-sm text-neutral-700 leading-relaxed">{t.rich("guestCopy", intelRich())}</p>
                    </div>
                )}

                <div className="flex gap-2 justify-center flex-wrap">
                    <Link href="/" className="btn btn-secondary flex items-center justify-center">
                        <FaHome className="mr-2 text-xl" /> {t("goHome")}
                    </Link>

                    {/* ✅ connecté : comportement actuel */}
                    {isLoggedIn && slug && (
                        <Link href={slug} className="btn btn-primary flex items-center justify-center">
                            <NotebookPen className="mr-2 text-xl" />
                            {t("bookLesson")}
                        </Link>
                    )}

                    {/* ✅ pas connecté : on remplace le CTA par “Se connecter” */}
                    {!isLoggedIn && (
                        <Link href={signInHref} className="btn btn-primary flex items-center justify-center">
                            <NotebookPen className="mr-2 text-xl" />
                            {t("guestCta")}
                        </Link>
                    )}
                </div>
                {!isLoggedIn && (
                    <Link href="/auth/signUp" className="text-sm text-primary-500 hover:underline">
                        {t("noAccount")}
                    </Link>
                )}
            </div>
        </main>
    );
};
