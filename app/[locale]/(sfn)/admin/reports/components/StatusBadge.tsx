import { AlertTriangle, PlugZap } from "lucide-react";
import type { GoogleAdsCost } from "@/app/lib/reporting/googleAds";

export type DataState = "not_configured" | "unavailable";

const STATE_LABELS: Record<DataState, string> = {
    not_configured: "Non configuré",
    unavailable: "Indisponible",
};

/** État d'une donnée absente : jamais un 0, toujours une icône + un libellé. */
export function StatusBadge({ state, label }: { state: DataState; label?: string }) {
    const Icon = state === "unavailable" ? AlertTriangle : PlugZap;
    return (
        <span
            className={
                state === "unavailable"
                    ? "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 [[data-theme=dark]_&]:bg-amber-900/50 [[data-theme=dark]_&]:text-amber-100"
                    : "inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-neutral-300 px-2 py-0.5 text-xs font-medium text-neutral-700"
            }
        >
            <Icon aria-hidden className="h-3 w-3" />
            {label || STATE_LABELS[state]}
        </span>
    );
}

export function adsCostState(cost: GoogleAdsCost): DataState | undefined {
    return cost.status === "available" ? undefined : cost.status;
}
