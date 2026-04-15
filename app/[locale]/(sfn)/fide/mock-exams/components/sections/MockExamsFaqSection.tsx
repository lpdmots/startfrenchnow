import { FideFaq } from "../../../components/FideFaq";
import { SlideFromLeft, SlideFromRight } from "@/app/components/animations/Slides";
import { useTranslations } from "next-intl";
import { mockExamFaqItemKeys } from "../../faqItemKeys";
import { intelRich } from "@/app/lib/intelRich";
import type { ReactNode } from "react";

export function MockExamsFaqSection() {
    const t = useTranslations("Fide.MockExamsPage.Faq");
    const rich = {
        ...intelRich(),
        hs1: (chunks: ReactNode) => <span className="heading-span-secondary-5 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs2: (chunks: ReactNode) => <span className="heading-span-secondary-5 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs3: (chunks: ReactNode) => <span className="heading-span-secondary-5 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs4: (chunks: ReactNode) => <span className="heading-span-secondary-5 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs5: (chunks: ReactNode) => <span className="heading-span-secondary-5 max-[479px]:[white-space:normal]">{chunks}</span>,
        hs6: (chunks: ReactNode) => <span className="heading-span-secondary-5 max-[479px]:[white-space:normal]">{chunks}</span>,
        br: () => <br />,
    };
    const faqText = (itemKey: string, field: "title" | "content") => t(`items.${itemKey}.${field}` as never);

    const mockExamFaqItems = mockExamFaqItemKeys.map((itemKey) => ({
        title: faqText(itemKey, "title"),
        content: <p>{faqText(itemKey, "content")}</p>,
    }));

    return (
        <section id="mock-exams-faq" className="pt-14 pb-6 lg:pt-24 lg:pb-10">
            <div className="mx-auto w-full max-w-7xl px-2 lg:px-8">
                <div className="p-0">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-10">
                        <SlideFromLeft>
                            <div className="lg:sticky lg:top-24 lg:self-start">
                                <p className="mb-4 md:mb-8 inline-flex rounded-full bg-secondary-5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">{t("badge")}</p>
                                <h2 className="display-2 mb-3">
                                    {t.rich("title", rich)}
                                </h2>
                                <p className="mb-0 max-w-md text-base text-neutral-700 md:text-lg">{t("subtitle")}</p>
                            </div>
                        </SlideFromLeft>

                        <SlideFromRight>
                            <div className="rounded-2xl border border-neutral-300 bg-neutral-100 p-2 md:p-3">
                                <FideFaq showHeader={false} variant="thin" maxWidthClassName="max-w-none" className="px-0" items={mockExamFaqItems} />
                            </div>
                        </SlideFromRight>
                    </div>
                </div>
            </div>
        </section>
    );
}
