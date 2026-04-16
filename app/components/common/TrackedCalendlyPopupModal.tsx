"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { PopupModal } from "react-calendly";
import { trackCalendlyOpen } from "@/app/lib/calendlyTracking";

type PopupModalProps = ComponentProps<typeof PopupModal>;

type TrackedCalendlyPopupModalProps = PopupModalProps & {
    source: string;
};

export default function TrackedCalendlyPopupModal({ source, open, url, ...rest }: TrackedCalendlyPopupModalProps) {
    const wasOpenRef = useRef(false);

    useEffect(() => {
        if (open && !wasOpenRef.current) {
            trackCalendlyOpen({
                source,
                mode: "popup",
                url,
            });
        }
        wasOpenRef.current = !!open;
    }, [open, source, url]);

    return <PopupModal open={open} url={url} {...rest} />;
}
