"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { HiOutlineMail, HiOutlineQuestionMarkCircle } from "react-icons/hi";
import BlogLangFixedButton from "../blog/BlogLangFixedButton";
import { BLOG_CONTACT_CTA } from "@/app/lib/constantes";
import { useConsentBannerOffset } from "@/app/hooks/useConsentBannerOffset";

const CONTACT_CTA_TEST_CONFIG = {
    contactUrl: BLOG_CONTACT_CTA.contactUrl,
    minTimeMs: BLOG_CONTACT_CTA.minTimeMs,
    minScrollRatio: BLOG_CONTACT_CTA.minScrollRatio,
    dismissDays: BLOG_CONTACT_CTA.dismissDays,
    teaseDurationMs: BLOG_CONTACT_CTA.teaseDurationMs,
    attentionIntervalMs: BLOG_CONTACT_CTA.shakeIntervalMs,
    attentionTeaseDurationMs: 2200,
    shakeDurationMs: 700,
    videoCheckIntervalMs: 1000,
    sessionStorageKey: BLOG_CONTACT_CTA.sessionStorageKey,
    dismissStorageKey: BLOG_CONTACT_CTA.dismissStorageKey,
    buttonBottomClass: "bottom-4",
    cardBottomClass: "bottom-4",
    buttonShadow: "none",
    cardShadow: "8px 8px 0 0 var(--neutral-800)",
    cardMaxWidth: "min(92vw, 320px)",
    buttonCompactWidth: 110,
    buttonExpandedWidth: 220,
    ignoreSessionLimit: false,
} as const;

type Props = {
    firstCategory: string;
    hasMainVideo?: boolean;
};

const isVideoActive = () => {
    if (typeof document === "undefined") return false;
    const htmlVideoPlaying = Array.from(document.querySelectorAll("video")).some((video) => !video.paused && !video.ended && video.readyState > 2);
    const youTubeActivated = document.querySelector(".yt-lite.lyt-activated, .yt-lite iframe") !== null;
    return htmlVideoPlaying || youTubeActivated;
};

const isDismissedRecently = (timestamp: number) => {
    const dismissMs = CONTACT_CTA_TEST_CONFIG.dismissDays * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp < dismissMs;
};

export default function BlogContactFloatingHelp({ firstCategory, hasMainVideo = false }: Props) {
    const isEligible = firstCategory !== "fide";
    const { data: session, status } = useSession();
    const t = useTranslations("BlogContactCta");
    const titleId = useId();
    const shouldLimitSession = !CONTACT_CTA_TEST_CONFIG.ignoreSessionLimit;

    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasTimedIn, setHasTimedIn] = useState(false);
    const [hasScrolledEnough, setHasScrolledEnough] = useState(false);
    const [wasShownInSession, setWasShownInSession] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [videoPlaying, setVideoPlaying] = useState(false);
    const [isTeasing, setIsTeasing] = useState(false);
    const [hasTeased, setHasTeased] = useState(false);
    const [animateShake, setAnimateShake] = useState(false);
    const attentionModeRef = useRef<"shake" | "tease">("shake");
    const consentOffset = useConsentBannerOffset();
    const stickyBottom = consentOffset + 16;

    const cardRef = useRef<HTMLDivElement | null>(null);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    const hasPackFide = useMemo(() => {
        return session?.user?.permissions?.some((permission) => permission.referenceKey === "pack_fide") ?? false;
    }, [session]);

    useEffect(() => {
        if (!isEligible) return;
        try {
            const dismissedAt = localStorage.getItem(CONTACT_CTA_TEST_CONFIG.dismissStorageKey);
            if (dismissedAt) {
                const parsed = Number(dismissedAt);
                if (!Number.isNaN(parsed) && isDismissedRecently(parsed)) {
                    setIsDismissed(true);
                }
            }
            if (shouldLimitSession) {
                const shown = sessionStorage.getItem(CONTACT_CTA_TEST_CONFIG.sessionStorageKey);
                if (shown === "1") {
                    setWasShownInSession(true);
                }
            }
        } catch {
            // Storage may be unavailable; ignore.
        }
    }, [isEligible, shouldLimitSession]);

    useEffect(() => {
        if (!isEligible) return;
        const timer = window.setTimeout(() => setHasTimedIn(true), CONTACT_CTA_TEST_CONFIG.minTimeMs);
        return () => window.clearTimeout(timer);
    }, [isEligible]);

    useEffect(() => {
        if (!isEligible || hasScrolledEnough) return;
        const handleScroll = () => {
            const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
            const ratio = scrollMax > 0 ? window.scrollY / scrollMax : 0;
            if (ratio >= CONTACT_CTA_TEST_CONFIG.minScrollRatio) {
                setHasScrolledEnough(true);
            }
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isEligible, hasScrolledEnough]);

    useEffect(() => {
        if (!isEligible || !hasMainVideo) return;
        const updateStatus = () => setVideoPlaying(isVideoActive());
        updateStatus();
        const interval = window.setInterval(updateStatus, CONTACT_CTA_TEST_CONFIG.videoCheckIntervalMs);
        return () => window.clearInterval(interval);
    }, [isEligible, hasMainVideo]);

    useEffect(() => {
        if (!isEligible || isVisible) return;
        if (!hasTimedIn || !hasScrolledEnough) return;
        if (isDismissed || (shouldLimitSession && wasShownInSession)) return;
        if (status === "loading" || hasPackFide) return;
        if (hasMainVideo && videoPlaying) return;

        setIsVisible(true);
        try {
            if (shouldLimitSession) {
                sessionStorage.setItem(CONTACT_CTA_TEST_CONFIG.sessionStorageKey, "1");
            }
        } catch {
            // Ignore storage errors.
        }
    }, [isEligible, isVisible, hasTimedIn, hasScrolledEnough, isDismissed, wasShownInSession, status, hasPackFide, hasMainVideo, videoPlaying, shouldLimitSession]);

    useEffect(() => {
        if (!isVisible || hasTeased || isExpanded) return;
        setIsTeasing(true);
        const timer = window.setTimeout(() => {
            setIsTeasing(false);
            setHasTeased(true);
        }, CONTACT_CTA_TEST_CONFIG.teaseDurationMs);
        return () => window.clearTimeout(timer);
    }, [isVisible, hasTeased, isExpanded]);

    useEffect(() => {
        if (!isVisible || isExpanded) return;
        const interval = window.setInterval(() => {
            if (isTeasing) return;
            if (attentionModeRef.current === "shake") {
                setAnimateShake(true);
                window.setTimeout(() => setAnimateShake(false), CONTACT_CTA_TEST_CONFIG.shakeDurationMs);
                attentionModeRef.current = "tease";
                return;
            }
            setIsTeasing(true);
            window.setTimeout(() => setIsTeasing(false), CONTACT_CTA_TEST_CONFIG.attentionTeaseDurationMs);
            attentionModeRef.current = "shake";
        }, CONTACT_CTA_TEST_CONFIG.attentionIntervalMs);
        return () => window.clearInterval(interval);
    }, [isVisible, isExpanded, isTeasing]);

    useEffect(() => {
        if (isExpanded) {
            closeButtonRef.current?.focus();
        }
    }, [isExpanded]);

    const handleDismiss = useCallback(() => {
        setIsExpanded(false);
        setIsVisible(false);
        setIsDismissed(true);
        try {
            localStorage.setItem(CONTACT_CTA_TEST_CONFIG.dismissStorageKey, Date.now().toString());
        } catch {
            // Ignore storage errors.
        }
    }, []);

    useEffect(() => {
        if (!isExpanded) return;
        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                handleDismiss();
            }
        };
        const handlePointer = (event: MouseEvent | TouchEvent) => {
            if (!cardRef.current) return;
            if (!cardRef.current.contains(event.target as Node)) {
                handleDismiss();
            }
        };
        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("mousedown", handlePointer);
        document.addEventListener("touchstart", handlePointer);
        return () => {
            document.removeEventListener("keydown", handleKeydown);
            document.removeEventListener("mousedown", handlePointer);
            document.removeEventListener("touchstart", handlePointer);
        };
    }, [isExpanded, handleDismiss]);

    const handleOpen = useCallback(() => {
        setIsTeasing(false);
        setIsExpanded(true);
    }, []);

    return (
        <>
            <BlogLangFixedButton suppressed={isEligible && isVisible} />
            <AnimatePresence>
                {isEligible && isVisible && !isExpanded && (
                    <motion.button
                        key="blog-contact-cta-button"
                        layout
                        initial={{ opacity: 0, y: 24 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            maxWidth: isTeasing ? CONTACT_CTA_TEST_CONFIG.buttonExpandedWidth : CONTACT_CTA_TEST_CONFIG.buttonCompactWidth,
                        }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className={`fixed right-4 z-50 flex h-12 items-center gap-3 overflow-hidden rounded-full border-2 border-solid border-neutral-800 bg-neutral-100 px-4 text-base font-semibold text-neutral-800 ${CONTACT_CTA_TEST_CONFIG.buttonBottomClass}`}
                        style={{ boxShadow: CONTACT_CTA_TEST_CONFIG.buttonShadow, bottom: stickyBottom }}
                        onClick={handleOpen}
                        aria-label={t("buttonAria")}
                        aria-expanded={isExpanded}
                        type="button"
                    >
                        <motion.span animate={animateShake ? { rotate: [0, -8, 8, -6, 6, 0] } : { rotate: 0 }} transition={{ duration: 0.8 }}>
                            <HiOutlineQuestionMarkCircle className="text-2xl" />
                        </motion.span>
                        <span className="whitespace-nowrap">{isTeasing ? t("teaseLabel") : t("buttonLabel")}</span>
                    </motion.button>
                )}
                {isEligible && isVisible && isExpanded && (
                    <motion.div
                        key="blog-contact-cta-card"
                        ref={cardRef}
                        initial={{ opacity: 0, y: 24, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 24, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 360, damping: 28 }}
                        className={`fixed right-4 z-50 ${CONTACT_CTA_TEST_CONFIG.cardBottomClass}`}
                        style={{ bottom: stickyBottom }}
                        role="dialog"
                        aria-modal={false}
                        aria-labelledby={titleId}
                    >
                        <div className="card p-4 sm:p-5" style={{ width: CONTACT_CTA_TEST_CONFIG.cardMaxWidth, boxShadow: CONTACT_CTA_TEST_CONFIG.cardShadow }}>
                            <div className="flex items-start justify-between gap-3">
                                <h3 id={titleId} className="text-base font-semibold">
                                    {t("title")}
                                </h3>
                                <button
                                    ref={closeButtonRef}
                                    onClick={handleDismiss}
                                    className="roundButton small"
                                    style={{ width: "2rem", height: "2rem", backgroundColor: "var(--neutral-200)", color: "var(--neutral-800)" }}
                                    aria-label={t("closeAria")}
                                    type="button"
                                >
                                    ×
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-neutral-700">{t("description")}</p>
                            <div className="mt-4 flex flex-col gap-2">
                                <Link href={CONTACT_CTA_TEST_CONFIG.contactUrl} className="btn-primary small full-width w-inline-block text-center" aria-label={t("primaryCtaAria")}>
                                    <span className="inline-flex items-center gap-2 whitespace-nowrap">
                                        <HiOutlineMail className="text-lg" />
                                        {t("primaryCta")}
                                    </span>
                                </Link>
                            </div>
                            <p className="mt-3 text-xs text-neutral-600">{t("reassurance")}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
