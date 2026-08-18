"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";
import { CATEGORIESTEXTCOLORS } from "@/app/lib/constantes";
import { cn } from "@/app/lib/schadcn-utils";
import { isCalendlyLink, trackCalendlyOpen } from "@/app/lib/calendlyTracking";
import { withCalendlyAttribution } from "@/app/lib/acquisition.client";

interface Props {
    children: React.ReactNode;
    url: string;
    target?: string;
    rel?: string;
    category?: string;
    className?: string;
}

function LinkArrow({ children, url, target = "_blank", rel, category, className = "" }: Props) {
    const hoverColor = "hover:!" + CATEGORIESTEXTCOLORS[(category || "tips") as keyof typeof CATEGORIESTEXTCOLORS];
    const normalizedUrl = (() => {
        if (url.startsWith("#") || url.startsWith("http") || url.startsWith("mailto:") || url.startsWith("tel:")) {
            return url;
        }
        if (url.startsWith("/")) {
            const stripped = url.replace(/^\/(fr|en)(?=\/|$)/, "");
            return stripped === "" ? "/" : stripped;
        }
        return url;
    })();
    const resolvedRel = rel ?? (target === "_blank" ? "noopener noreferrer" : undefined);

    return (
        <span>
            <Link
                href={normalizedUrl}
                className={cn(
                    "group inline-flex items-center font-normal leading-5 text-[var(--neutral-700)] no-underline transition-colors duration-150 ease-out hover:text-[var(--secondary-2)]",
                    hoverColor,
                    className,
                )}
                target={target}
                rel={resolvedRel}
                onClick={(event) => {
                    if (isCalendlyLink(normalizedUrl)) {
                        const attributedUrl = withCalendlyAttribution(normalizedUrl, "link_arrow");
                        event.currentTarget.href = attributedUrl;
                        trackCalendlyOpen({
                            source: "link_arrow",
                            mode: "external_link",
                            url: attributedUrl,
                        });
                    }
                    event.stopPropagation();
                }}
            >
                <span className="flex items-center justify-between gap-1">
                    <span className="link-text underline">{children}</span>
                    <ArrowRight
                        aria-hidden="true"
                        className="size-5 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transform-none"
                        strokeWidth={2}
                    />
                    <span aria-hidden="true" className="w-2" />
                </span>
            </Link>
        </span>
    );
}

export default LinkArrow;
