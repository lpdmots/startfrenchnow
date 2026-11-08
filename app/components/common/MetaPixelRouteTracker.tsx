"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackMetaPageView } from "@/app/lib/metaPixel.client";

export default function MetaPixelRouteTracker() {
    const pathname = usePathname();
    const isFirstRender = useRef(true);

    useEffect(() => {
        // Le PageView du chargement initial est déjà envoyé par le service tarteaucitron.
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        trackMetaPageView();
    }, [pathname]);

    return null;
}
