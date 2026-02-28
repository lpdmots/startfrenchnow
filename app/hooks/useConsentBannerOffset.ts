"use client";

import { useEffect, useRef, useState } from "react";

const BANNER_SELECTORS = [
    "#tarteaucitronAlertBig",
    ".tarteaucitronAlertBig",
    "#tarteaucitronAlertSmall",
    ".tarteaucitronAlertSmall",
    "#tarteaucitronRoot",
    ".tarteaucitronRoot",
].join(", ");

const isBannerVisible = (element: HTMLElement) => {
    const styles = window.getComputedStyle(element);
    if (styles.display === "none" || styles.visibility === "hidden" || styles.opacity === "0") return false;
    const rect = element.getBoundingClientRect();
    return rect.height > 0 && rect.width > 0;
};

export function useConsentBannerOffset() {
    const [offset, setOffset] = useState(0);
    const observedRef = useRef<HTMLElement | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    useEffect(() => {
        const update = () => {
            const banners = Array.from(document.querySelectorAll<HTMLElement>(BANNER_SELECTORS));
            const visibleBanner = banners.find((element) => isBannerVisible(element));
            const banner = visibleBanner ?? banners[0] ?? null;
            if (banner !== observedRef.current) {
                resizeObserverRef.current?.disconnect();
                observedRef.current = banner;
                if (banner && typeof ResizeObserver !== "undefined") {
                    const ro = new ResizeObserver(() => update());
                    ro.observe(banner);
                    resizeObserverRef.current = ro;
                }
            }

            if (!banner) {
                setOffset(0);
                return;
            }

            setOffset(isBannerVisible(banner) ? banner.getBoundingClientRect().height : 0);
        };

        update();

        const mutationObserver = new MutationObserver(update);
        mutationObserver.observe(document.body, { childList: true, subtree: true, attributes: true });

        const handleResize = () => update();
        window.addEventListener("resize", handleResize);
        window.addEventListener("scroll", handleResize, { passive: true });

        return () => {
            mutationObserver.disconnect();
            resizeObserverRef.current?.disconnect();
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("scroll", handleResize);
        };
    }, []);

    return offset;
}
