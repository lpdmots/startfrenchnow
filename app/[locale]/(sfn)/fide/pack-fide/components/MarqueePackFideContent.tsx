import React from "react";
import Link from "next-intl/link";
import { LuGraduationCap, LuInfinity, LuRefreshCw, LuSmartphone } from "react-icons/lu";
import { LucideBadgeCheck } from "lucide-react";
import { HiOutlineShieldCheck } from "react-icons/hi";

function MarqueePackFideContent() {
    return (
        <div className="w-full flex justify-around items-center bg-neutral-800 text-neutral-100 gap-12 lg:gap-24 px-6 lg:px-12">
            <div className="flex flex-col items-center justify-center">
                <LuInfinity strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">Accès à vie</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <LuRefreshCw strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">Mises à jour</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <HiOutlineShieldCheck strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">Satisfait/remboursé</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <LuGraduationCap strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">Formation complète</p>
            </div>
            <div className="flex flex-col items-center justify-center">
                <LuSmartphone strokeWidth={1} height={100} width={100} className="h-14 w-auto object-contain" />
                <p className="mb-0">Flexible & autonome</p>
            </div>
        </div>
    );
}

export default MarqueePackFideContent;
