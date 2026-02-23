export const isActivePath = (pathname: string, href: string, matchPrefix = true) => {
    if (!pathname || !href || href === "#") {
        return false;
    }

    if (pathname === href) {
        return true;
    }

    if (!matchPrefix) {
        return false;
    }

    if (href === "/") {
        return false;
    }

    return pathname.startsWith(`${href}/`);
};
