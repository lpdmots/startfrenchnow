import { requireSession } from "@/app/components/auth/requireSession";
import { COURSES_PACKAGES_KEYS } from "@/app/lib/constantes";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { Locale, normalizeLocale } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { groq } from "next-sanity";
import ProfileSectionClient from "./ProfileSectionClient";

export const metadata = {
    robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

type AccountUser = {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    email?: string | null;
};

type ProductPricing = {
    currency?: "EUR" | "USD" | "CHF";
    originalPrice?: number;
};

type PendingPurchaseItem = {
    _key?: string;
    quantity?: number;
    referenceKey?: string;
    productTitleFr?: string;
    productTitleEn?: string;
    pricingDetails?: ProductPricing[];
};

type PendingPurchase = {
    _id: string;
    status?: "paid" | "assigned" | "refunded" | "canceled";
    purchasedAt?: string;
    items?: PendingPurchaseItem[];
};

type AccountQueryResult = {
    user: AccountUser | null;
    purchases: PendingPurchase[];
};

const ACCOUNT_QUERY = groq`
{
  "user": *[_type == "user" && _id == $userId][0]{
    firstName,
    lastName,
    name,
    email
  },
  "purchases": *[
    _type == "pendingPurchase"
    && (
      (defined(assignedTo) && assignedTo._ref == $userId)
      || (!defined(assignedTo) && lower(email) == $email)
    )
  ] | order(purchasedAt desc){
    _id,
    status,
    purchasedAt,
    items[]{
      _key,
      quantity,
      referenceKey,
      "productTitleFr": productRef->title.fr,
      "productTitleEn": productRef->title.en,
      "pricingDetails": productRef->pricingDetails[]{
        currency,
        originalPrice
      }
    }
  }
}
`;

const COURSES_KEYS = new Set<string>(COURSES_PACKAGES_KEYS as readonly string[]);

function formatReferenceKey(referenceKey?: string): string {
    if (!referenceKey) return "";
    return referenceKey
        .replace(/_/g, " ")
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDashboardData(referenceKey?: string | null, labels?: { courses: string; fide: string }) {
    const isCourseDashboard = !!referenceKey && COURSES_KEYS.has(referenceKey);
    const path = isCourseDashboard ? "/courses/dashboard" : "/fide/dashboard";
    const label = isCourseDashboard ? labels?.courses || "" : labels?.fide || "";
    return { path, label };
}

function pickPricing(locale: Locale, pricingDetails?: ProductPricing[]) {
    if (!Array.isArray(pricingDetails) || pricingDetails.length === 0) return null;
    const preferredCurrencies = locale === "fr" ? ["EUR", "CHF", "USD"] : ["USD", "EUR", "CHF"];
    return preferredCurrencies.map((currency) => pricingDetails.find((price) => price.currency === currency)).find(Boolean) || pricingDetails[0];
}

function formatPrice(locale: Locale, amount: number, currency: "EUR" | "USD" | "CHF") {
    return new Intl.NumberFormat(locale === "fr" ? "fr-CH" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
}

function formatDate(locale: Locale, isoDate?: string) {
    if (!isoDate) return "";
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString(locale === "fr" ? "fr-CH" : "en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    });
}

export default async function AccountPage(props: { params: Promise<{ locale: string }> }) {
    const params = await props.params;
    const locale = normalizeLocale(params.locale);
    const t = await getTranslations({ locale, namespace: "Account" });

    const session = await requireSession({ callbackUrl: "/account" });
    const userId = session?.user?._id;
    const sessionEmail = (session?.user?.email || "").trim().toLowerCase();

    const result = await client.fetch<AccountQueryResult>(ACCOUNT_QUERY, { userId, email: sessionEmail });

    const user = {
        firstName: result?.user?.firstName || "",
        lastName: result?.user?.lastName || "",
        username: result?.user?.name || session?.user?.name || "",
        email: result?.user?.email || session?.user?.email || "",
    };
    const resetPasswordHref = user.email ? `/auth/reset-password/get-password-link?email=${encodeURIComponent(user.email)}&lockEmail=1` : "/auth/reset-password/get-password-link";
    const dashboardLabels = {
        courses: t("dashboard.courses"),
        fide: t("dashboard.fide"),
    };
    const statusLabels: Record<string, string> = {
        paid: t("status.paid"),
        assigned: t("status.assigned"),
        refunded: t("status.refunded"),
        canceled: t("status.canceled"),
    };

    const purchases = (result?.purchases || []).flatMap((purchase) => {
        const items = Array.isArray(purchase.items) ? purchase.items : [];
        return items.map((item, index) => {
            const quantity = Math.max(1, Number(item.quantity || 1));
            const pricing = pickPricing(locale, item.pricingDetails);
            const amount =
                pricing && typeof pricing.originalPrice === "number" && Number.isFinite(pricing.originalPrice)
                    ? formatPrice(locale, pricing.originalPrice * quantity, pricing.currency || "EUR")
                    : t("amountUnavailable");
            const label =
                locale === "fr"
                    ? item.productTitleFr || item.productTitleEn || formatReferenceKey(item.referenceKey)
                    : item.productTitleEn || item.productTitleFr || formatReferenceKey(item.referenceKey);
            const dashboard = getDashboardData(item.referenceKey, dashboardLabels);
            const statusKey = purchase.status || "assigned";
            const statusLabel = statusLabels[statusKey] || statusKey;

            return {
                id: `${purchase._id}-${item._key || index}`,
                label: label || "-",
                quantity,
                amount,
                date: formatDate(locale, purchase.purchasedAt) || "-",
                dashboardPath: dashboard.path,
                dashboardLabel: dashboard.label || "-",
                statusLabel,
            };
        });
    });

    return (
        <main className="min-h-[70vh] py-8 px-4 md:px-6 mb-12">
            <div className="mx-auto w-full max-w-[1000px]">
                <div className="mb-6">
                    <h1 className="display-2 mb-1">{t("title")}</h1>
                    <p className="mb-0 text-neutral-600">{t("subtitle")}</p>
                </div>

                <div className="space-y-4">
                    <ProfileSectionClient
                        user={{
                            firstName: user.firstName,
                            lastName: user.lastName,
                            username: user.username || "",
                            email: user.email || "",
                        }}
                        messages={{
                            title: t("profileTitle"),
                            firstName: t("firstName"),
                            lastName: t("lastName"),
                            username: t("username"),
                            email: t("email"),
                            edit: t("editProfile"),
                            cancel: t("cancelEditProfile"),
                            save: t("saveProfile"),
                            saving: t("savingProfile"),
                            success: t("saveProfileSuccess"),
                            usernameRequired: t("usernameRequired"),
                            genericError: t("saveProfileError"),
                        }}
                    />

                    <section className="rounded-2xl border border-solid border-neutral-500 bg-neutral-100 p-5 md:p-6 shadow-1">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-2">{t("securityTitle")}</h2>

                        <Link href={resetPasswordHref} className="btn-primary small w-button inline-block">
                            {t("resetPasswordCta")}
                        </Link>
                    </section>

                    <section className="rounded-2xl border border-solid border-neutral-500 bg-neutral-100 p-5 md:p-6 shadow-1">
                        <h2 className="text-2xl font-semibold text-neutral-800 mb-2">{t("purchasesTitle")}</h2>
                        <p className="text-neutral-600 mb-4">{t("purchasesDescription")}</p>

                        {!purchases.length ? (
                            <p className="mb-0 text-neutral-600">{t("noPurchases")}</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] border-collapse">
                                    <thead>
                                        <tr className="border-b border-neutral-400 text-left text-sm text-neutral-600">
                                            <th className="py-2 pr-3 font-medium">{t("table.product")}</th>
                                            <th className="py-2 pr-3 font-medium">{t("table.quantity")}</th>
                                            <th className="py-2 pr-3 font-medium">{t("table.price")}</th>
                                            <th className="py-2 pr-3 font-medium">{t("table.date")}</th>
                                            <th className="py-2 pr-3 font-medium">{t("table.dashboard")}</th>
                                            <th className="py-2 pr-3 font-medium">{t("table.status")}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {purchases.map((purchase) => (
                                            <tr key={purchase.id} className="border-b border-neutral-300 align-middle">
                                                <td className="py-3 pr-3 text-neutral-800">{purchase.label}</td>
                                                <td className="py-3 pr-3 text-neutral-700">{purchase.quantity}</td>
                                                <td className="py-3 pr-3 text-neutral-700">{purchase.amount}</td>
                                                <td className="py-3 pr-3 text-neutral-700">{purchase.date}</td>
                                                <td className="py-3 pr-3">
                                                    <Link href={purchase.dashboardPath as "/courses/dashboard" | "/fide/dashboard"} className="nav-link header-nav-link p-0 m-0">
                                                        {purchase.dashboardLabel}
                                                    </Link>
                                                </td>
                                                <td className="py-3 pr-3">
                                                    <span className="inline-flex rounded-full border border-neutral-500 px-2 py-1 text-xs font-medium text-neutral-700">{purchase.statusLabel}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
