import { FideFaq } from "@/app/[locale]/(sfn)/fide/components/FideFaq";
import { SlideFromLeft, SlideFromRight } from "@/app/components/animations/Slides";
import LinkArrow from "@/app/components/common/LinkArrow";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { homeFaqItemKeys } from "./homeFaqItemKeys";

export function HomeFaqSection() {
    const t = useTranslations("HomeFaq");
    const tRich = t.rich as (key: string, values?: Record<string, (chunks: ReactNode) => ReactNode>) => ReactNode;
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-6 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-6 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-6 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-6 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-6 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-6 max-[479px]:[white-space:normal]">{chunks}</span>,
        br: () => <br />,
        linkMock: (chunks: ReactNode) => (
            <LinkArrow url="/fide/mock-exams" target="_self" className="inline-flex text-sm font-semibold">
                {chunks}
            </LinkArrow>
        ),
        linkPack: (chunks: ReactNode) => (
            <LinkArrow url="/fide/pack-fide" target="_self" className="inline-flex text-sm font-semibold">
                {chunks}
            </LinkArrow>
        ),
        linkPrivate: (chunks: ReactNode) => (
            <LinkArrow url="/fide/private-courses" target="_self" className="inline-flex text-sm font-semibold">
                {chunks}
            </LinkArrow>
        ),
        linkContact: (chunks: ReactNode) => (
            <LinkArrow url="#ContactForFIDECourses" target="_self" className="inline-flex text-sm font-semibold">
                {chunks}
            </LinkArrow>
        ),
        linkScenarios: (chunks: ReactNode) => (
            <LinkArrow url="/fide/exams" target="_self" className="inline-flex text-sm font-semibold">
                {chunks}
            </LinkArrow>
        ),
    };

    const faqText = (itemKey: string, field: "title" | "content") => t(`items.${itemKey}.${field}` as never);
    const homeFaqItems = homeFaqItemKeys.map((itemKey) => ({
        title: faqText(itemKey, "title"),
        content: <p>{tRich(`items.${itemKey}.content`, rich)}</p>,
    }));

    return (
        <section id="home-faq" className="pt-8 pb-20 lg:pt-16 lg:pb-24">
            <div className="mx-auto w-full max-w-7xl px-2 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
                    <SlideFromLeft>
                        <div className="lg:sticky lg:top-24 lg:self-start">
                            <p className="mb-4 md:mb-8 inline-flex rounded-full bg-secondary-6 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">{t("badge")}</p>
                            <h2 className="display-2 mb-3">{tRich("title", rich)}</h2>
                            <p className="mb-0 max-w-md text-base text-neutral-700 md:text-lg">{t("subtitle")}</p>
                        </div>
                    </SlideFromLeft>

                    <SlideFromRight>
                        <div className="rounded-2xl border border-neutral-300 bg-neutral-100 p-2 md:p-3">
                            <FideFaq showHeader={false} variant="thin" maxWidthClassName="max-w-none" className="px-0" items={homeFaqItems} />
                        </div>
                    </SlideFromRight>
                </div>
            </div>
        </section>
    );
}
