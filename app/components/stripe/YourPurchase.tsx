import Image from "next/image";
import urlFor from "@/app/lib/urlFor";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { PricingDetails, ProductInfos } from "@/app/types/sfn/stripe";
import { cn } from "@/app/lib/schadcn-utils";
import { useTranslations } from "next-intl";

interface YourPourchaseProps {
    productInfos: ProductInfos;
    pricingDetails: PricingDetails;
    locale: "fr" | "en";
    setQuantity: React.Dispatch<React.SetStateAction<string>>;
    setCurrency: React.Dispatch<React.SetStateAction<"CHF" | "EUR" | "USD">>;
    quantity: string;
    currency: "CHF" | "EUR" | "USD";
    payment: boolean;
}

export const YourPurchase = ({ productInfos, pricingDetails, locale, setQuantity, setCurrency, quantity, currency, payment }: YourPourchaseProps) => {
    const t = useTranslations("yourPurchase");
    const title = productInfos?.title?.[locale] || productInfos?.title?.[productInfos.defaultLangage];
    const description = productInfos?.description?.[locale] || productInfos?.description?.[productInfos.defaultLangage];
    const { maxQuantity } = productInfos;
    const { currencies } = pricingDetails;
    const splitTitel = title.split(" ");
    const title1 = splitTitel
        .slice(0, splitTitel.length / 2)
        .join(" ")
        .toUpperCase();
    const title2 = splitTitel
        .slice(splitTitel.length / 2)
        .join(" ")
        .toUpperCase();

    return (
        <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl" style={{ border: "solid 1px var(--neutral-400)" }}>
                <div className="flex gap-4 w-full">
                    <Image className="h-[72px] md:h-20 w-auto object-contain rounded-xl" src={urlFor(productInfos.image).url()} alt={t("courseImageAlt")} height={150} width={150} />
                    <div>
                        <p className="mb-0 text-3xl md:text-4xl font-bold">{title1}</p>
                        <p className="mb-0 text-3xl md:text-4xl font-bold">{title2}</p>
                    </div>
                </div>
                <div className="mt-2">{description}</div>
                <div className="grid grid-cols-1 sm:flex w-full justify-between items-center flex-wrap gap-2">
                    <div className="flex gap-2 items-center justify-between">
                        {currencies.length > 1 && (
                            <Select name="currency" onValueChange={(value) => setCurrency(value as "CHF" | "EUR" | "USD")} defaultValue={currency} disabled={payment}>
                                <SelectTrigger
                                    className={cn(
                                        "col-span-3 md:col-span-1 rounded-md p-2 transition-shadow duration-300 color-neutral-800 bg-neutral-100 w-20 order-2 sm:order-1",
                                        payment && "bg-neutral-200 pointer-events-none"
                                    )}
                                    style={{ border: "1px solid var(--neutral-600)" }}
                                >
                                    <SelectValue className="color-neutral-800" placeholder={"CHF"} />
                                </SelectTrigger>
                                <SelectContent className="border rounded-md min-w-20">
                                    <SelectGroup>
                                        {currencies.map((value) => (
                                            <SelectItem key={value} className="hover:bg-neutral-200" value={value}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        )}
                        <p className="mb-0 font-bold order-1 sm:order-2">{t("unitPrice", { currency, price: pricingDetails.unitPrice })}</p>
                    </div>
                    <div className="flex gap-4 lg:gap-8 flex-wrap items-center">
                        {maxQuantity > 1 && (
                            <div className="flex gap-2 items-center justify-between sm:justify-start w-full sm:w-auto">
                                <p className="mb-0 text-neutral-600 font-thin">{t("quantity")}</p>
                                <Select name="quantity" onValueChange={(value) => setQuantity(value)} defaultValue={quantity} disabled={payment}>
                                    <SelectTrigger
                                        className={cn(
                                            "col-span-3 md:col-span-1 rounded-md p-2 transition-shadow duration-300 color-neutral-800 bg-neutral-100 w-20",
                                            payment && "bg-neutral-200 pointer-events-none"
                                        )}
                                        style={{ border: "1px solid var(--neutral-600)" }}
                                    >
                                        <SelectValue className="color-neutral-800" placeholder={"1"} />
                                    </SelectTrigger>
                                    <SelectContent className="border rounded-md min-w-20">
                                        <SelectGroup className="min-h-52">
                                            {Array.from({ length: maxQuantity }, (_, i) => i + 1).map((value) => (
                                                <SelectItem key={value} className="hover:bg-neutral-200" value={value.toString()}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
