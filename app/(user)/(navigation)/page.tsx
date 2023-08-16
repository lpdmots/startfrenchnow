import React from "react";
import Marquee from "../../components/animations/Marquee";
import BlogHome from "../../components/sfn/home/BlogHome";
import CommentsCarousel from "../../components/sfn/home/CommentsCarousel";
import CoreValuesMethod from "../../components/sfn/home/CoreValuesMethod";
import LessonCards from "../../components/sfn/home/LessonCards";
import UdemyBusiness from "../../components/sfn/home/UdemyBusiness";
import WhoIAm from "../../components/sfn/home/WhoIAm";
import MarqueeContent from "../../components/sfn/home/MarqueeContent";
import { StoriesHome } from "@/app/components/sfn/home/StoriesHome";
import { HeroSfn } from "@/app/components/sfn/home/HeroSfn";

function Home() {
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
            {/* @ts-expect-error Server Component */}
            <BlogHome />
        </div>
    );
}

export default Home;
