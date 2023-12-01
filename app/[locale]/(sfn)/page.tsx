import React from "react";
import Marquee from "@/app/components/animations/Marquee";
import BlogHome from "@/app/components/sfn/home/BlogHome";
import CommentsCarousel from "@/app/components/sfn/home/CommentsCarousel";
import CoreValuesMethod from "@/app/components/sfn/home/CoreValuesMethod";
import LessonCards from "@/app/components/sfn/home/LessonCards";
import UdemyBusiness from "@/app/components/sfn/home/UdemyBusiness";
import WhoIAm from "@/app/components/sfn/home/WhoIAm";
import MarqueeContent from "@/app/components/sfn/home/MarqueeContent";
import { StoriesHome } from "@/app/components/sfn/home/StoriesHome";
import { HeroSfn } from "@/app/components/sfn/home/HeroSfn";
import { Locale } from "@/i18n";

function Home({ params }: { params: { locale: Locale } }) {
    return (
        <div className="page-wrapper">
            <HeroSfn />
            <Marquee content={<MarqueeContent />} />

            <section className="padding-courses pb-0">
                <div className="container-default w-container ">
                    <div className="max-w-500 md:max-w-none m-auto">
                        <LessonCards />
                    </div>
                </div>
            </section>

            <section className="section pd-200px wf-section">
                <UdemyBusiness />
            </section>

            <section className="section pt-0 wf-section">
                <CoreValuesMethod />
            </section>

            <section className="section py-0 wf-section">
                <WhoIAm />
            </section>
            <CommentsCarousel />
            <StoriesHome />
            <BlogHome />
        </div>
    );
}

export default Home;
