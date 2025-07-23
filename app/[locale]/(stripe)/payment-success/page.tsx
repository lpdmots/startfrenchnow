import { NotebookPen } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next-intl/link";
import Image from "next/image";
import { FaHome } from "react-icons/fa";

export default function PaymentSuccess({ searchParams: { amount, currency, slug } }: { searchParams: { amount: string; currency: string; slug: string } }) {
    const t = useTranslations("Checkout.PaymentSuccess");
    return (
        <main className="min-h-screen p-2 flex items-center justify-center">
            <div className="max-w-6xl flex flex-col card p-4 lg:p-8 justify-center items-center gap-4">
                <h1 className="text-4xl font-extrabold mb-0 heading-span-secondary-4">{t("thankYou")}</h1>
                <h2 className="text-2xl mb-0">{t("successMessage")}</h2>
                <div className="text-4xl font-bold text-secondary-2">
                    {amount} {currency}
                </div>
                <Image
                    src="/images/teacher-inversed-activated.png"
                    alt={t("successImageAlt")}
                    height={200}
                    width={200}
                    className="contain rounded-xl"
                    style={{ border: "2px solid var(--neutral-800)" }}
                />
                <div className="flex gap-2 justify-center flex-wrap">
                    <Link href="/" className="btn btn-secondary flex items-center justify-center">
                        <FaHome className="mr-2 text-xl" /> {t("goHome")}
                    </Link>
                    {slug && (
                        <Link href={`/private-lessons/${slug}`} className="btn btn-primary flex items-center justify-center">
                            <NotebookPen className="mr-2 text-xl" />
                            {t("bookLesson")}
                        </Link>
                    )}
                </div>
            </div>
        </main>
    );
}
