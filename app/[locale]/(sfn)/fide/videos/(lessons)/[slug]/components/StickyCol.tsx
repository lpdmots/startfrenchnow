"use client";
import { useEffect, useRef, useState } from "react";

export function StickyCol({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const parentRef = useRef<HTMLElement | null>(null);
    const [height, setHeight] = useState<string>("auto");

    useEffect(() => {
        // Trouver le conteneur parent (ta grille)
        parentRef.current = ref.current?.closest<HTMLElement>(".grid") ?? null;

        let ticking = false;
        const update = () => {
            if (!ref.current || !parentRef.current) return;
            const elRect = ref.current.getBoundingClientRect();
            const parentRect = parentRef.current.getBoundingClientRect();

            // Espace dispo dans le viewport sous l’élément
            const spaceViewport = window.innerHeight - elRect.top;

            // Espace dispo jusqu’au bas du parent (important pour ne pas pousser la section suivante)
            const spaceParent = parentRect.bottom - elRect.top;

            const available = Math.max(0, Math.min(spaceViewport, spaceParent));
            setHeight(`${available}px`);
            ticking = false;
        };

        const onScrollOrResize = () => {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        };

        update(); // init
        window.addEventListener("scroll", onScrollOrResize, { passive: true });
        window.addEventListener("resize", onScrollOrResize);
        return () => {
            window.removeEventListener("scroll", onScrollOrResize);
            window.removeEventListener("resize", onScrollOrResize);
        };
    }, []);

    return (
        <div ref={ref} className="sticky top-0 overflow-y-auto" style={{ height }}>
            {children}
        </div>
    );
}
