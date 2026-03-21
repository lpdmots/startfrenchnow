import Marquee from "@/app/components/ui/marquee";
import { ContactForFide } from "../../components/ContactForFide";
import { MockExamsFaqSection } from "./sections/MockExamsFaqSection";
import { MockExamsNextStepsSection } from "./sections/MockExamsNextStepsSection";
import { MockExamsOfferSection } from "./sections/MockExamsOfferSection";
import { MockExamsOnlineSection } from "./sections/MockExamsOnlineSection";
import { MockExamsReviewsSection } from "./sections/MockExamsReviewsSection";
import { MockExamsTestsSection } from "./sections/MockExamsTestsSection";
import MarqueeMockExamsContent from "./MarqueeMockExamsContent";

export function MockExamsPageSections() {
    return (
        <>
            <MockExamsTestsSection />
            <MockExamsOnlineSection />
            <MockExamsReviewsSection />
            <div className="max-w-screen overflow-hidden h-48 lg:h-64">
                <div className="bg-neutral-800 py-4 lg:py-8 my-12 custom-rotate overflow-hidden">
                    <Marquee pauseOnHover className="[--duration:30s] sm:[--duration:30s]">
                        <MarqueeMockExamsContent />
                    </Marquee>
                </div>
            </div>
            <MockExamsOfferSection />
            <MockExamsFaqSection />
            <ContactForFide />
            <MockExamsNextStepsSection />
        </>
    );
}
