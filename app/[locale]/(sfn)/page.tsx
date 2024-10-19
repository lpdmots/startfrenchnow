import React from "react";
import BlogHome from "@/app/components/sfn/home/BlogHome";
import HomeReviews from "@/app/components/sfn/home/HomeReviews";
import CoreValuesMethod from "@/app/components/sfn/home/CoreValuesMethod";
import LessonCards from "@/app/components/sfn/home/LessonCards";
import UdemyBusiness from "@/app/components/sfn/home/UdemyBusiness";
import WhoIAm from "@/app/components/sfn/home/WhoIAm";
import MarqueeContent from "@/app/components/sfn/home/MarqueeContent";
import { HeroSfn } from "@/app/components/sfn/home/HeroSfn";
import { Locale } from "@/i18n";
import Marquee from "@/app/components/ui/marquee";

function Home({ params }: { params: { locale: Locale } }) {
    return (
        <div className="page-wrapper flex flex-col gap-8 md:gap-12">
            <HeroSfn />
            <HomeReviews />
            <LessonCards />

            <UdemyBusiness />

            <section className="section py-0 wf-section">
                <CoreValuesMethod />
            </section>

            <div className="max-w-screen overflow-hidden h-48 lg:h-64">
                <div className="bg-neutral-800 py-4 lg:py-8 my-12 custom-rotate overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:60s]">
                        <MarqueeContent />
                    </Marquee>
                </div>
            </div>

            <section className="section py-0 wf-section">
                <WhoIAm />
            </section>
            <BlogHome />
        </div>
    );
}

export default Home;
