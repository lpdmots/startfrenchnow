import { Locale } from "@/i18n";
import React from "react";
import { HeroPackFide } from "./components/HeroPackFide";
import { HowItWorks } from "./components/HowItWorks";
import { PreviewsSection } from "./components/PreviewsSection";
import FloatingCTA from "./components/FloatingCTA";
import { VideosSection } from "./components/VideosSection";
import { ContactForFide } from "../components/ContactForFide";
import ExamsSection from "./components/ExamsSection";
import Marquee from "@/app/components/ui/marquee";
import MarqueePackFideContent from "./components/MarqueePackFideContent";
import { ContactForFideCourses } from "../components/ContactForFideCourses";
import { PricingPlans } from "./components/PricingPlans";
import { FideFaq } from "../components/FideFaq";
import ButtonsDock from "./components/ButtonsDock";
import { authOptions } from "@/app/lib/authOptions";
import { getServerSession } from "next-auth";

async function PackFidePage({ params: { locale } }: { params: { locale: Locale } }) {
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");
    console.log({ session, permissions: session?.user?.permissions, hasPack });
    return (
        <div className="w-full">
            <div className="page-wrapper flex flex-col max-w-7xl m-auto">
                <HeroPackFide hasPack={hasPack} />
            </div>
            <HowItWorks />
            <PreviewsSection />
            <ContactForFide />
            <VideosSection hasPack={hasPack} />
            <div className="max-w-screen overflow-hidden h-48 lg:h-64">
                <div className="bg-neutral-800 py-4 lg:py-8 my-12 custom-rotate overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:30s] sm:[--duration:30s]">
                        <MarqueePackFideContent />
                    </Marquee>
                </div>
            </div>
            <ExamsSection hasPack={hasPack} />
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
                </div>
            </div>
            <PricingPlans hasPack={hasPack} />
            <ContactForFide />
            <div className="py-24">
                <FideFaq />
            </div>
            <ButtonsDock />
        </div>
    );
}

export default PackFidePage;
