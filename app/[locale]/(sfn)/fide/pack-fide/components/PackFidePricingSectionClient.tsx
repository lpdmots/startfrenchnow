"use client";

import { useSession } from "next-auth/react";
import { PackFidePricingSection } from "./PackFidePricingSection";
import type { PricingDetails } from "@/app/types/sfn/stripe";

export function PackFidePricingSectionClient({
    locale,
    pricingAutonomie,
    pricingAccompagne,
}: {
    locale: string;
    pricingAutonomie?: PricingDetails | null;
    pricingAccompagne?: PricingDetails | null;
}) {
    const { data: session } = useSession();
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");

    return <PackFidePricingSection locale={locale} hasPack={hasPack} pricingAutonomie={pricingAutonomie} pricingAccompagne={pricingAccompagne} />;
}
