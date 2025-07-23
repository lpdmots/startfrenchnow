import { FaCheckCircle, FaCreditCard, FaEdit, FaSpinner, FaTimesCircle } from "react-icons/fa";
import { Separator } from "../ui/separator";
import { AreReadyState } from "./Checkout";
import { useTranslations } from "next-intl";

interface PriceLayoutProps {
    quantity: string;
    initialAmount: number;
    currency: string;
    amount: number;
    payment: boolean;
    setPayment: React.Dispatch<React.SetStateAction<boolean>>;
    areReady: AreReadyState;
}

export const PriceLayout = ({ quantity, initialAmount, currency, amount, payment, setPayment, areReady }: PriceLayoutProps) => {
    const reduction = initialAmount - amount;
    const isDiscount = reduction > 0;
    const isContactInfosReady = areReady.contactInformations;
    const t = useTranslations("priceLayout");

    return (
        <div className="flex flex-col w-full items-end text-base gap-4">
            <div className="flex w-full justify-between items-center color-neutral-700 gap-6 !p-0">
                <h3 className="text-lg md:text-2xl text-neutral-700 text-left !font-bold flex items-center">
                    {amount ? <FaCheckCircle className="text-2xp text-secondary-2 mr-2 lg:mr-4" /> : <FaTimesCircle className="text-2xp text-neutral-400 mr-2 lg:mr-4" />}
                    {t("amountToPay")}
                </h3>
                {!amount && <FaSpinner className="animate-spin text-blue-500 h-6 w-6 lg:h-8 lg:w-8" style={{ animationDuration: "2s" }} />}
            </div>
            <div className="flex justify-between w-full gap-4">
                <p className="mb-0">{t("subtotal", { quantity })}</p>
                <p className={isDiscount ? "text-neutral-800 line-through decoration-secondary-4 decoration-3 mb-0" : "mb-0"}>{initialAmount + " " + currency.toUpperCase()}</p>
            </div>
            <div className="flex justify-between w-full gap-4">
                <p className="mb-0 italic text-neutral-600">{t("discount")}</p>
                {isDiscount ? (
                    <p className="mb-0 bg-secondaryShades-5 font-bold rounded-lg" style={{ color: "teal" }}>
                        - {reduction + " " + currency.toUpperCase()}
                    </p>
                ) : (
                    <p className="mb-0">-</p>
                )}
            </div>
            <Separator />
            <div className="flex justify-between w-full gap-4">
                <p className="mb-0 font-bold text-2xl">{t("total")}</p>
                <p className="mb-0 font-bold text-2xl">
                    {amount} <span className="text-xl">{currency.toUpperCase()}</span>
                </p>
            </div>

            {payment ? (
                <div className="flex justify-center w-full">
                    <button onClick={() => setPayment(false)} className="btn btn-secondary small w-full flex items-center justify-center">
                        <FaEdit className="mr-2" /> {t("editChoices")}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col justify-center w-full">
                    <button disabled={!isContactInfosReady} onClick={() => setPayment(true)} className="btn btn-primary small w-full flex items-center justify-center">
                        <FaCreditCard className="mr-2" />
                        {t("proceedToPayment")}
                    </button>
                    {/* <p className="mb-0 text-neutral-600 text-sm mt-2">
                        {t("termsConditions")}{" "}
                        <a href="/" className="!text-neutral-600">
                            {t("termsLink")}
                        </a>
                    </p> */}
                </div>
            )}
        </div>
    );
};
