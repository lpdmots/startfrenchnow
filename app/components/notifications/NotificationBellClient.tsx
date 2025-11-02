"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimation, useReducedMotion } from "framer-motion";
import { MdNotifications, MdNotificationsActive } from "react-icons/md";
import clsx from "clsx";

type Props = {
    count: number;
    shakeMs?: number;
    className?: string;
};

export default function NotificationBellClient({ count, shakeMs = 650, className }: Props) {
    const controls = useAnimation();
    const prefersReducedMotion = useReducedMotion();

    // ✅ Empêche le flash du badge : on cache jusqu'à la fin de l'anim
    const [isShaking, setIsShaking] = useState(() => count > 0);

    useEffect(() => {
        if (count <= 0) {
            setIsShaking(false);
            return;
        }

        setIsShaking(true);

        if (prefersReducedMotion) {
            controls
                .start({
                    scale: [1, 1.08, 1],
                    transition: { duration: 0.4, ease: "easeInOut" },
                })
                .finally(() => setIsShaking(false));
            return;
        }

        // reset pour éviter une rotation résiduelle
        controls.set({ rotate: 0 });

        controls
            .start({
                rotate: [0, -14, 14, -10, 10, -6, 6, 0],
                transition: {
                    duration: shakeMs / 1000,
                    ease: "easeInOut",
                    times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
                },
            })
            .finally(() => setIsShaking(false));
    }, [count, controls, prefersReducedMotion, shakeMs]);

    const Icon = isShaking ? MdNotificationsActive : MdNotifications;

    return (
        <span className={clsx("relative inline-flex items-center justify-center", className)}>
            {/* Icône animée */}
            <motion.span aria-hidden animate={controls}>
                <Icon className="text-2xl sm:text-3xl text-neutral-800" />
            </motion.span>

            {/* Badge : s’affiche uniquement après la vibration */}
            <AnimatePresence initial={false}>
                {count > 0 && !isShaking && (
                    <motion.span
                        key="notif-badge"
                        initial={{ opacity: 0, scale: 0.6, y: -2 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6, y: -2 }}
                        transition={{ type: "spring", stiffness: 420, damping: 22, mass: 0.7 }}
                        className="absolute -top-1 -right-2 text-sm font-bold text-neutral-600 min-w-[18px]"
                    >
                        {count > 99 ? "99+" : count}
                    </motion.span>
                )}
            </AnimatePresence>
        </span>
    );
}
