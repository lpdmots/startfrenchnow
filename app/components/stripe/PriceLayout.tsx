import { FaCheckCircle, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { Separator } from "../ui/separator";
import { useTranslations } from "next-intl";

interface PriceLayoutProps {
    quantity: string;
    initialAmount: number;
    currency: string;
    amount: number;
    discountType?: "percentage" | "flatDiscount" | "newPrice";
    discountValue?: number;
}

export const PriceLayout = ({ quantity, initialAmount, currency, amount, discountType, discountValue }: PriceLayoutProps) => {
    const reduction = initialAmount - amount;
    const isDiscount = reduction > 0;
    const t = useTranslations("priceLayout");

    const formatAmount = (value: number) => {
        if (!Number.isFinite(value)) return `${value}`;
        const normalized = Math.round(value * 100) / 100;
        const hasCents = Math.abs(normalized % 1) > 0;
        return hasCents ? normalized.toFixed(2) : `${normalized}`;
    };

    const isPercentageDiscount = discountType === "percentage" && typeof discountValue === "number";
    const discountLabel = isPercentageDiscount ? `${t("discount")} (${discountValue}%)` : t("discount");
    const displayReduction = reduction;

    return (
        <div className="flex flex-col w-full items-end text-base gap-4">
            <div className="flex w-full justify-between items-center color-neutral-700 gap-6 !p-0">
                <h3 className="text-lg md:text-2xl text-neutral-700 text-left !font-bold flex items-center">
                    {amount ? <FaCheckCircle className="text-2xp text-secondary-2 mr-2 lg:mr-4" /> : <FaTimesCircle className="text-2xp text-neutral-400 mr-2 lg:mr-4" />}
                    {t("amountToPay")}
                </h3>
                {!amount && <FaSpinner className="animate-spin text-secondary-2 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />}
            </div>
            <div className="flex justify-between w-full gap-4">
                <p className="mb-0">{t("subtotal", { quantity })}</p>
                <p className={isDiscount ? "text-neutral-800 line-through decoration-secondary-4 decoration-3 mb-0" : "mb-0"}>{initialAmount + " " + currency.toUpperCase()}</p>
            </div>
            <div className="flex justify-between w-full gap-4">
                <p className="mb-0 italic text-neutral-600">{discountLabel}</p>
                {isDiscount ? (
                    <p className="mb-0 bg-secondaryShades-5 font-bold rounded-lg" style={{ color: "teal" }}>
                        - {formatAmount(displayReduction) + " " + currency.toUpperCase()}
                    </p>
                ) : (
                    <p className="mb-0">-</p>
                )}
            </div>
            <Separator />
            <div className="flex justify-between w-full gap-4">
                <p className="mb-0 font-bold text-2xl">{t("total")}</p>
                <p className="mb-0 font-bold text-2xl">
                    {formatAmount(amount)} <span className="text-xl">{currency.toUpperCase()}</span>
                </p>
            </div>
        </div>
    );
};
