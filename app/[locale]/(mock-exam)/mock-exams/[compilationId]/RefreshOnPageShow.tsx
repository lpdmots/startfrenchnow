"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RefreshOnPageShow() {
    const router = useRouter();

    useEffect(() => {
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.has("_r")) {
            currentUrl.searchParams.delete("_r");
            const nextUrl = `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
            window.history.replaceState(window.history.state, "", nextUrl);
        }

        const onPageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                router.refresh();
            }
        };

        window.addEventListener("pageshow", onPageShow);
        return () => {
            window.removeEventListener("pageshow", onPageShow);
        };
    }, [router]);

    return null;
}
