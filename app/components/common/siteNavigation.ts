export type SiteNavAccent = "fide" | "course" | "neutral";

export type SiteNavLink = {
    key: string;
    label: string;
    href: string;
    sectionTitle?: string;
    accent?: SiteNavAccent;
    matchPrefix?: boolean;
    activeExact?: string[];
    activePrefixes?: string[];
};

export type SiteNavItem = SiteNavLink & {
    items?: SiteNavLink[];
    emphasize?: boolean;
};

export type SiteFooterSection = {
    key: string;
    title: string;
    links: SiteNavLink[];
};

type Translate = (key: string) => string;

export const isSiteNavActive = (pathname: string, link: Pick<SiteNavLink, "href" | "activeExact" | "activePrefixes">) => {
    if (!pathname) {
        return false;
    }

    const exactMatches = link.activeExact && link.activeExact.length > 0 ? link.activeExact : [link.href];
    if (exactMatches.includes(pathname)) {
        return true;
    }

    return (link.activePrefixes ?? []).some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

export const getPrimaryNavigation = (t: Translate): SiteNavItem[] => [
    {
        key: "fide-test",
        label: t("main.fideTest"),
        href: "/fide",
        accent: "fide",
        matchPrefix: false,
        activeExact: ["/fide"],
        activePrefixes: ["/fide/videos", "/fide/exams", "/test-your-level"],
        items: [
            {
                key: "fide-overview",
                label: t("fideMenu.overview"),
                href: "/fide",
                accent: "fide",
                matchPrefix: false,
                activeExact: ["/fide"],
            },
            {
                key: "fide-videos",
                label: t("fideMenu.videos"),
                href: "/fide/videos",
                accent: "fide",
                activePrefixes: ["/fide/videos"],
            },
            {
                key: "fide-scenarios",
                label: t("fideMenu.scenarios"),
                href: "/fide/exams",
                accent: "fide",
                activePrefixes: ["/fide/exams"],
            },
            {
                key: "test-your-level",
                label: t("fideMenu.testYourLevel"),
                href: "/test-your-level",
                activePrefixes: ["/test-your-level"],
            },
        ],
    },
    {
        key: "fide-pack",
        label: t("main.fidePack"),
        href: "/fide/pack-fide",
        accent: "fide",
        activePrefixes: ["/fide/pack-fide"],
    },
    {
        key: "practice-exams",
        label: t("main.practiceExams"),
        href: "/fide/mock-exams",
        accent: "fide",
        activePrefixes: ["/fide/mock-exams"],
    },
    {
        key: "coaching",
        label: t("main.coachingOneToOne"),
        href: "/fide/private-courses",
        accent: "fide",
        activePrefixes: ["/fide/private-courses"],
    },
    {
        key: "courses-resources",
        label: t("main.coursesResources"),
        href: "/courses/beginners",
        accent: "course",
        activePrefixes: ["/courses", "/videos", "/blog", "/exercises", "/stories"],
        items: [
            {
                key: "beginner-french",
                sectionTitle: t("coursesResourcesMenu.sections.courses"),
                label: t("coursesResourcesMenu.beginnerFrench"),
                href: "/courses/beginners",
                accent: "course",
                activePrefixes: ["/courses/beginners"],
            },
            {
                key: "intermediate-french",
                label: t("coursesResourcesMenu.intermediateFrench"),
                href: "/courses/intermediates",
                accent: "course",
                activePrefixes: ["/courses/intermediates"],
            },
            {
                key: "daily-life-dialogues",
                label: t("coursesResourcesMenu.dailyLifeDialogues"),
                href: "/courses/dialogues",
                accent: "course",
                activePrefixes: ["/courses/dialogues"],
            },
            {
                key: "past-tenses",
                label: t("coursesResourcesMenu.masterPastTenses"),
                href: "/courses/past-tenses",
                accent: "course",
                activePrefixes: ["/courses/past-tenses"],
            },
            {
                key: "all-videos",
                sectionTitle: t("coursesResourcesMenu.sections.resources"),
                label: t("coursesResourcesMenu.allVideos"),
                href: "/videos",
                activePrefixes: ["/videos"],
            },
            {
                key: "blog",
                label: t("coursesResourcesMenu.blog"),
                href: "/blog",
                activePrefixes: ["/blog"],
            },
            {
                key: "exercises",
                label: t("coursesResourcesMenu.exercises"),
                href: "/exercises",
                activePrefixes: ["/exercises"],
            },
            {
                key: "interactive-stories",
                label: t("coursesResourcesMenu.interactiveStories"),
                href: "/stories",
                activePrefixes: ["/stories"],
            },
        ],
    },
];

export const getFooterNavigation = (t: Translate): SiteFooterSection[] => [
    {
        key: "fide",
        title: t("footer.sections.fide"),
        links: [
            {
                key: "footer-fide-test",
                label: t("main.fideTest"),
                href: "/fide",
                matchPrefix: false,
                activeExact: ["/fide"],
            },
            {
                key: "footer-fide-pack",
                label: t("main.fidePack"),
                href: "/fide/pack-fide",
                activePrefixes: ["/fide/pack-fide"],
            },
            {
                key: "footer-practice-exams",
                label: t("main.practiceExams"),
                href: "/fide/mock-exams",
                activePrefixes: ["/fide/mock-exams"],
            },
            {
                key: "footer-coaching",
                label: t("main.coachingOneToOne"),
                href: "/fide/private-courses",
                activePrefixes: ["/fide/private-courses"],
            },
            {
                key: "footer-fide-videos",
                label: t("fideMenu.videos"),
                href: "/fide/videos",
                activePrefixes: ["/fide/videos"],
            },
            {
                key: "footer-fide-scenarios",
                label: t("fideMenu.scenarios"),
                href: "/fide/exams",
                activePrefixes: ["/fide/exams"],
            },
        ],
    },
    {
        key: "courses",
        title: t("footer.sections.courses"),
        links: [
            {
                key: "footer-beginner-french",
                label: t("coursesResourcesMenu.beginnerFrench"),
                href: "/courses/beginners",
                activePrefixes: ["/courses/beginners"],
            },
            {
                key: "footer-intermediate-french",
                label: t("coursesResourcesMenu.intermediateFrench"),
                href: "/courses/intermediates",
                activePrefixes: ["/courses/intermediates"],
            },
            {
                key: "footer-daily-life-dialogues",
                label: t("coursesResourcesMenu.dailyLifeDialogues"),
                href: "/courses/dialogues",
                activePrefixes: ["/courses/dialogues"],
            },
            {
                key: "footer-past-tenses",
                label: t("coursesResourcesMenu.masterPastTenses"),
                href: "/courses/past-tenses",
                activePrefixes: ["/courses/past-tenses"],
            },
        ],
    },
    {
        key: "resources",
        title: t("footer.sections.resources"),
        links: [
            {
                key: "footer-blog",
                label: t("coursesResourcesMenu.blog"),
                href: "/blog",
                activePrefixes: ["/blog"],
            },
            {
                key: "footer-exercises",
                label: t("coursesResourcesMenu.exercises"),
                href: "/exercises",
                activePrefixes: ["/exercises"],
            },
            {
                key: "footer-stories",
                label: t("coursesResourcesMenu.interactiveStories"),
                href: "/stories",
                activePrefixes: ["/stories"],
            },
            {
                key: "footer-test-your-level",
                label: t("fideMenu.testYourLevel"),
                href: "/test-your-level",
                activePrefixes: ["/test-your-level"],
            },
            {
                key: "footer-all-videos",
                label: t("coursesResourcesMenu.allVideos"),
                href: "/videos",
                activePrefixes: ["/videos"],
            },
        ],
    },
    {
        key: "company",
        title: t("footer.sections.company"),
        links: [
            {
                key: "footer-about",
                label: t("about"),
                href: "/about",
                activePrefixes: ["/about"],
            },
            {
                key: "footer-contact",
                label: t("contact"),
                href: "/contact",
                activePrefixes: ["/contact"],
            },
            {
                key: "footer-legal",
                label: t("legal_mentions"),
                href: "/mentions-legales",
                activePrefixes: ["/mentions-legales"],
            },
        ],
    },
];
