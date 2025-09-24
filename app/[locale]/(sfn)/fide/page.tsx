import { HeroFide } from "./components/HeroFide";
import { Formateur } from "./components/Formateur";
import { ReviewsFide } from "./components/ReviewsFide";
import { WhatIsFide } from "./components/WhatIsFide";
import HowClassLook from "./components/HowClassLook";
import { FideFaq } from "./components/FideFaq";
import { ContactForFide } from "./components/ContactForFide";
import { AdditionalCourses } from "./components/AdditionalCourses";
import { ContactForFideCourses } from "./components/ContactForFideCourses";
import PriceSliderFide from "./components/PriceSliderFide";
import { Locale } from "@/i18n";

function ExamsPage({ params: { locale } }: { params: { locale: Locale } }) {
    return (
        <div className="w-full">
            <div className="page-wrapper flex flex-col max-w-7xl m-auto">
                <HeroFide />
            </div>
            <div className="bg-neutral-800 color-neutral-100 flex justify-center overflow-x-hidden">
                <Formateur />
            </div>
            <div className="max-w-7xl m-auto py-24 px-4 lg:px-8">
                <WhatIsFide />
            </div>
            <div className="bg-neutral-800 color-neutral-100 py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <HowClassLook />
                </div>
            </div>
            <div className="max-w-7xl m-auto pt-24 pb-12 px-4 lg:px-8">
                <ReviewsFide />
            </div>
            <ContactForFide />
            <PriceSliderFide locale={locale} />
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
                </div>
            </div>
            <div id="FideFAQ" className="pt-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <FideFaq />
                </div>
            </div>
            <div className="py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <AdditionalCourses />
                </div>
            </div>
        </div>
    );
}

export default ExamsPage;
