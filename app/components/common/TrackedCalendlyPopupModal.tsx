"use client";

import { useEffect, useMemo, useRef, type ComponentProps } from "react";
import { PopupModal } from "react-calendly";
import { trackCalendlyOpen } from "@/app/lib/calendlyTracking";
import { getAcquisitionSource } from "@/app/lib/acquisition.client";

type PopupModalProps = ComponentProps<typeof PopupModal>;

type TrackedCalendlyPopupModalProps = PopupModalProps & {
    source: string;
};

export default function TrackedCalendlyPopupModal({ source, open, url, utm, ...rest }: TrackedCalendlyPopupModalProps) {
    const wasOpenRef = useRef(false);
    const acquisitionSource = open ? getAcquisitionSource() : "unknown";

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

    const resolvedUtm = useMemo(
        () => ({
            utmSource: acquisitionSource,
            utmMedium: "website",
            utmCampaign: "startfrenchnow",
            utmContent: source,
            ...utm,
        }),
        [acquisitionSource, source, utm],
    );

    return <PopupModal open={open} url={url} utm={resolvedUtm} {...rest} />;
}
