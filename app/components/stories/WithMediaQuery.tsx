"use client";
import useMediaQuery from "@/app/hooks/useMediaQuery";

export const IsDesktop = ({ children }: { children: JSX.Element }) => {
    const isDesktop = useMediaQuery("(min-width: 992px)");
    if (!isDesktop) return null;
    return <>{children}</>;
};

export const IsMobile = ({ children }: { children: JSX.Element }) => {
    const isMobile = useMediaQuery("(max-width: 991px)");
    if (!isMobile) return null;
    return <>{children}</>;
};
