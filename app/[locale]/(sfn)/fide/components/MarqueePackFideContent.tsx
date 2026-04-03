import React from "react";
import Link from "next-intl/link";
import { LuGraduationCap, LuInfinity, LuRefreshCw, LuSmartphone } from "react-icons/lu";
import { LucideBadgeCheck } from "lucide-react";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useTranslations } from "next-intl";

function MarqueePackFideContent() {
    const t = useTranslations("Fide.MarqueePackFideContent");

    return (
        <div className="marquee-pack-fide-content w-full flex justify-around items-center bg-neutral-800 text-neutral-100 gap-12 lg:gap-24 px-6 lg:px-12">
            <div className="marquee-pack-fide-item flex flex-col items-center justify-center">
                <LuInfinity strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">{t("lifetime")}</p>
            </div>
            <div className="marquee-pack-fide-item flex flex-col items-center justify-center">
                <LuRefreshCw strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">{t("updates")}</p>
            </div>
            <div className="marquee-pack-fide-item flex flex-col items-center justify-center">
                <LuGraduationCap strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">{t("fullTraining")}</p>
            </div>
            <div className="marquee-pack-fide-item flex flex-col items-center justify-center">
                <LuSmartphone strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">{t("flexible")}</p>
            </div>
        </div>
    );
}

export default MarqueePackFideContent;
