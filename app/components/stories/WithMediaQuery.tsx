"use client";
import useMediaQuery from "@/app/hooks/useMediaQuery";

export const IsDesktop = ({ children }: { children: JSX.Element }) => {
    const isDesktop = useMediaQuery("(min-width: 992px)");
    if (!isDesktop) return null;
    return <>{children}</>;
};

export const IsTablet = ({ children }: { children: JSX.Element }) => {
    const isTablet = useMediaQuery("(max-width: 991px)");
    if (!isTablet) return null;
    return <>{children}</>;
};

export const IsMedium = ({ children }: { children: JSX.Element }) => {
    const isMedium = useMediaQuery("(max-width: 768px)");
    if (!isMedium) return null;
    return <>{children}</>;
};

export const IsMobile = ({ children }: { children: JSX.Element }) => {
    const isMobile = useMediaQuery("(max-width: 480px)");
    if (!isMobile) return null;
    return <>{children}</>;
};
