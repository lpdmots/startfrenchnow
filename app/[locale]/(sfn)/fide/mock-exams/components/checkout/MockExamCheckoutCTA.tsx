"use client";

import { Link } from "@/i18n/navigation";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import ShimmerButton from "@/app/components/ui/shimmer-button";
import { useMockExamEligibility } from "./MockExamEligibilityProvider";

type MockExamCheckoutLabels = {
    cta: string;
    ctaUseCredit: string;
    ctaDisabled: string;
    disabledHasCredit: string;
    disabledNoTemplates: string;
};

type MockExamCheckoutCTAProps = {
    labels: MockExamCheckoutLabels;
    callbackUrl?: string;
    dashboardUrl?: string;
    showArrow?: boolean;
    containerClassName?: string;
    ctaClassName?: string;
    useCreditClassName?: string;
    disabledClassName?: string;
    disabledMessageClassName?: string;
    useShimmer?: boolean;
    reserveMessageSpace?: boolean;
};

export function MockExamCheckoutCTA({
    labels,
    callbackUrl = "/fide/mock-exams",
    dashboardUrl = "/fide/dashboard#mock-exams",
    showArrow = true,
    containerClassName = "flex flex-col gap-2",
    ctaClassName = "btn btn-primary inline-flex w-full items-center justify-center gap-2 sm:w-auto",
    useCreditClassName = "btn btn-secondary inline-flex w-full items-center justify-center gap-2 no-underline sm:w-auto",
    disabledClassName = "btn btn-secondary inline-flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-75 sm:w-auto",
    disabledMessageClassName = "mb-0 text-center text-xs text-neutral-600",
    useShimmer = false,
    reserveMessageSpace = false,
}: MockExamCheckoutCTAProps) {
    const router = useRouter();
    const { checkoutDisabled, checkoutDisabledReason, loading } = useMockExamEligibility();
    const checkoutUrl = `/checkout/mock_exam?${new URLSearchParams({
        quantity: "1",
        callbackUrl,
    }).toString()}`;

    const disabledMessage =
        checkoutDisabledReason === "hasCredit" ? labels.disabledHasCredit : checkoutDisabledReason === "noTemplates" ? labels.disabledNoTemplates : null;
    const isCreditAvailable = checkoutDisabledReason === "hasCredit";

    return (
        <div className={containerClassName}>
            {!checkoutDisabled ? (
                useShimmer ? (
                    <ShimmerButton
                        type="button"
                        onClick={() => router.push(checkoutUrl)}
                        className={clsx(ctaClassName, loading && "pointer-events-none opacity-85")}
                        variant="primary"
                    >
                        {labels.cta}
                        {showArrow ? <ArrowRight className="h-4 w-4" /> : null}
                    </ShimmerButton>
                ) : (
                    <Link href={checkoutUrl} className={clsx(ctaClassName, loading && "pointer-events-none opacity-85")}>
                        {labels.cta}
                        {showArrow ? <ArrowRight className="h-4 w-4" /> : null}
                    </Link>
                )
            ) : isCreditAvailable ? (
                <Link href={dashboardUrl} className={useCreditClassName}>
                    {labels.ctaUseCredit}
                    {showArrow ? <ArrowRight className="h-4 w-4" /> : null}
                </Link>
            ) : (
                <button type="button" disabled className={disabledClassName}>
                    {labels.ctaDisabled}
                </button>
            )}
            {disabledMessage || reserveMessageSpace ? (
                <p className={clsx(disabledMessageClassName, !disabledMessage && "invisible")} aria-hidden={!disabledMessage}>
                    {disabledMessage ?? "placeholder"}
                </p>
            ) : null}
        </div>
    );
}
