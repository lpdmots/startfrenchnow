import { Fade } from "@/app/components/animations/Fades";
import Marquee from "@/app/components/ui/marquee";
import { ContactForFide } from "../../components/ContactForFide";
import { MockExamsFaqSection } from "./sections/MockExamsFaqSection";
import { MockExamsNextStepsSection } from "./sections/MockExamsNextStepsSection";
import { MockExamsOfferSection } from "./sections/MockExamsOfferSection";
import { MockExamsOnlineSection } from "./sections/MockExamsOnlineSection";
import { MockExamsReviewsSection } from "./sections/MockExamsReviewsSection";
import { MockExamsTestsSection } from "./sections/MockExamsTestsSection";
import MarqueeMockExamsContent from "./MarqueeMockExamsContent";

type MockExamsPageSectionsProps = {
    checkoutDisabled?: boolean;
    checkoutDisabledReason?: "hasCredit" | "noTemplates" | null;
};

export function MockExamsPageSections({ checkoutDisabled = false, checkoutDisabledReason = null }: MockExamsPageSectionsProps) {
    return (
        <>
            <MockExamsTestsSection />
            <MockExamsOnlineSection checkoutDisabled={checkoutDisabled} checkoutDisabledReason={checkoutDisabledReason} />
            <MockExamsReviewsSection />
            <Fade delay={0.1} duration={0.35}>
                <div className="max-w-screen h-48 overflow-hidden lg:h-64">
                    <div className="custom-rotate my-12 overflow-hidden bg-neutral-800 py-4 lg:py-8">
                        <Marquee pauseOnHover className="[--duration:30s] sm:[--duration:30s]">
                            <MarqueeMockExamsContent />
                        </Marquee>
                    </div>
                </div>
            </Fade>
            <MockExamsOfferSection checkoutDisabled={checkoutDisabled} checkoutDisabledReason={checkoutDisabledReason} />
            <MockExamsFaqSection />
            <ContactForFide />
            <MockExamsNextStepsSection />
        </>
    );
}
