import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import { CarouselReviews } from "@/app/components/common/CarouselReviews.tsx/CarouselReviews";
import { sharedFideReviews } from "../../../components/ReviewsFide";

export function MockExamsReviewsSection() {
    return (
        <section id="mock-exams-reviews" className="pt-0 pb-14 lg:pb-24">
            <div className="mx-auto w-full max-w-7xl px-4 lg:px-8">
                <SlideFromBottom>
                    <div className="flex w-full justify-center">
                        <div className="max-w-5xl text-center">
                            <p className="mb-3 inline-flex rounded-full bg-secondary-3 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-100">Retours clients</p>
                            <h2 className="display-2 mb-2">
                                <span className="heading-span-secondary-3">Retours d'expérience</span> clients FIDE
                            </h2>
                            <p className="mb-0 text-base text-neutral-700 md:text-lg">Découvrez des témoignages d&apos;apprenants ayant utilisé les contenus FIDE pour progresser.</p>
                        </div>
                    </div>
                </SlideFromBottom>
                <Fade delay={0.6}>
                    <div className="relative mt-8 min-h-[470px]">
                        <CarouselReviews comments={[...sharedFideReviews].sort((a, b) => (b.date ?? 0) - (a.date ?? 0))} />
                        <div className="h-20 lg:hidden"></div>
                    </div>
                </Fade>
            </div>
        </section>
    );
}
