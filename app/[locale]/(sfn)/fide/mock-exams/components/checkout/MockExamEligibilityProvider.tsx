"use client";

import { getMockExamCheckoutEligibility } from "@/app/serverActions/mockExamActions";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type MockExamCheckoutDisabledReason = "hasCredit" | "noTemplates" | null;

type MockExamEligibilityState = {
    checkoutDisabled: boolean;
    checkoutDisabledReason: MockExamCheckoutDisabledReason;
    loading: boolean;
};

const MockExamEligibilityContext = createContext<MockExamEligibilityState>({
    checkoutDisabled: false,
    checkoutDisabledReason: null,
    loading: true,
});

export function MockExamEligibilityProvider({
    children,
    initialCheckoutDisabled = false,
    initialCheckoutDisabledReason = null,
}: {
    children: React.ReactNode;
    initialCheckoutDisabled?: boolean;
    initialCheckoutDisabledReason?: MockExamCheckoutDisabledReason;
}) {
    const { data: session, status } = useSession();
    const userId = (session as any)?.user?._id as string | undefined;
    const [state, setState] = useState<MockExamEligibilityState>({
        checkoutDisabled: initialCheckoutDisabled,
        checkoutDisabledReason: initialCheckoutDisabledReason,
        loading: true,
    });

    useEffect(() => {
        let active = true;

        if (status === "loading") {
            setState((prev) => ({ ...prev, loading: true }));
            return () => {
                active = false;
            };
        }

        if (!userId) {
            setState({
                checkoutDisabled: false,
                checkoutDisabledReason: null,
                loading: false,
            });
            return () => {
                active = false;
            };
        }

        setState((prev) => ({ ...prev, loading: true }));
        getMockExamCheckoutEligibility(userId)
            .then((eligibility) => {
                if (!active) return;
                setState({
                    checkoutDisabled: !eligibility.canCheckout,
                    checkoutDisabledReason: eligibility.reason,
                    loading: false,
                });
            })
            .catch(() => {
                if (!active) return;
                setState((prev) => ({ ...prev, loading: false }));
            });

        return () => {
            active = false;
        };
    }, [status, userId]);

    const value = useMemo(() => state, [state]);

    return <MockExamEligibilityContext.Provider value={value}>{children}</MockExamEligibilityContext.Provider>;
}

export function useMockExamEligibility() {
    return useContext(MockExamEligibilityContext);
}

