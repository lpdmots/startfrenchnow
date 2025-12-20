import { HeroFide } from "./components/HeroFide";
import { Formateur } from "./components/Formateur";
import { ReviewsFide } from "./components/ReviewsFide";
import HowClassLook from "./components/HowClassLook";
import { FideFaq } from "./components/FideFaq";
import { ContactForFide } from "./components/ContactForFide";
import { ContactForFideCourses } from "./components/ContactForFideCourses";
import { Locale } from "@/i18n";
import { VideosSection } from "./components/VideosSection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import Marquee from "@/app/components/ui/marquee";
import MarqueePackFideContent from "./components/MarqueePackFideContent";
import ExamsSection from "./components/ExamsSection";
import { PricingPlans } from "./components/PricingPlans";
import FideUdemyReviews from "./components/FideUdemyReviews";
import { PreviewsSection } from "./components/PreviewsSection";
import { WhatIsFide } from "./components/WhatIsFide";
import GetPdfBand from "./components/GetPdfBand";

async function ExamsPage({ params: { locale } }: { params: { locale: Locale } }) {
    const session = await getServerSession(authOptions);
    const hasPack = !!session?.user?.permissions?.some((p) => p.referenceKey === "pack_fide");

    return (
        <div className="w-full mb-24">
            <div className="page-wrapper flex flex-col max-w-7xl m-auto">
                <HeroFide />
            </div>
            <div className="bg-neutral-800 color-neutral-100 flex justify-center overflow-hidden">
                <Formateur />
            </div>
            <GetPdfBand />
            <div className="max-w-7xl m-auto pt-24 pb-6 px-4 lg:px-8">
                <ReviewsFide />
            </div>
            <ContactForFide />
            <VideosSection hasPack={hasPack} locale={locale} />
            <div className="max-w-screen overflow-hidden h-48 lg:h-64">
                <div className="bg-neutral-800 py-4 lg:py-8 my-12 custom-rotate overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:30s] sm:[--duration:30s]">
                        <MarqueePackFideContent />
                    </Marquee>
                </div>
            </div>
            <ExamsSection hasPack={hasPack} />
            <div className="bg-neutral-800 color-neutral-100 py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <HowClassLook />
                </div>
            </div>
            <PricingPlans hasPack={hasPack} locale={locale} />
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
                </div>
            </div>
            <div className="max-w-7xl m-auto pt-24 pb-12 px-4 lg:px-8 text-neutral-800">
                <WhatIsFide />
            </div>
            <ContactForFide />
            <div id="FideFAQ" className="py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <FideFaq />
                </div>
            </div>
        </div>
    );
}

export default ExamsPage;
