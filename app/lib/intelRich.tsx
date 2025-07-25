export const intelRich = () => {
    return {
        under: (chunks: any) => <span className="underline underline-offset-2">{chunks}</span>,
        textxl: (chunks: any) => <span className="text-xl">{chunks}</span>,
        under1: (chunks: any) => (
            <span className="underline underline-offset-2" style={{ textDecorationColor: "var(--secondary-1)" }}>
                {chunks}
            </span>
        ),
        under2: (chunks: any) => (
            <span className="underline underline-offset-2" style={{ textDecorationColor: "var(--secondary-2)" }}>
                {chunks}
            </span>
        ),
        under3: (chunks: any) => (
            <span className="underline underline-offset-2" style={{ textDecorationColor: "var(--secondary-3)" }}>
                {chunks}
            </span>
        ),
        under4: (chunks: any) => (
            <span className="underline underline-offset-2" style={{ textDecorationColor: "var(--secondary-4)" }}>
                {chunks}
            </span>
        ),
        under5: (chunks: any) => (
            <span className="underline underline-offset-2" style={{ textDecorationColor: "var(--secondary-5)" }}>
                {chunks}
            </span>
        ),
        noWrap: (chunks: any) => <span style={{ whiteSpace: "nowrap" }}>{chunks}</span>,
        b: (chunks: any) => <span className="font-bold">{chunks}</span>,
        b1: (chunks: any) => <span className="font-bold text-secondary-1">{chunks}</span>,
        b2: (chunks: any) => <span className="font-bold text-secondary-2">{chunks}</span>,
        b3: (chunks: any) => <span className="font-bold text-secondary-3">{chunks}</span>,
        b4: (chunks: any) => <span className="font-bold text-secondary-4">{chunks}</span>,
        b5: (chunks: any) => <span className="font-bold text-secondary-5">{chunks}</span>,
        hs1: (chunks: any) => <span className="heading-span-secondary-1">{chunks}</span>,
        hs2: (chunks: any) => <span className="heading-span-secondary-2">{chunks}</span>,
        hs3: (chunks: any) => <span className="heading-span-secondary-3">{chunks}</span>,
        hs4: (chunks: any) => <span className="heading-span-secondary-4">{chunks}</span>,
        hs5: (chunks: any) => <span className="heading-span-secondary-5">{chunks}</span>,
    };
};
