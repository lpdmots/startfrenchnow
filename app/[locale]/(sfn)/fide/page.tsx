import { Locale } from "@/i18n";
import { HeroFide } from "./components/HeroFide";
import { Formateur } from "./components/Formateur";
import { ReviewsFide } from "./components/ReviewsFide";
import { WhatIsFide } from "./components/WhatIsFide";
import HowClassLook from "./components/HowClassLook";
import { FideFaq } from "./components/FideFaq";
import { ContactForFide } from "./components/ContactForFide";
import { AdditionalCourses } from "./components/AdditionalCourses";
import { ContactForFideCourses } from "./components/ContactForFideCourses";

function FidePage({ params }: { params: { locale: Locale } }) {
    return (
        <div className="w-full">
            <div className="page-wrapper flex flex-col max-w-7xl m-auto" style={{ minHeight: "80vh" }}>
                <HeroFide />
            </div>
            <div className="bg-neutral-800 color-neutral-100 flex justify-center">
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
            <div className="max-w-7xl m-auto pt-24 pb-0 px-4 lg:px-8">
                <ReviewsFide />
            </div>
            <ContactForFide />
            <div className="py-24 px-4 lg:px-8">
                <div className="max-w-7xl m-auto">
                    <FideFaq />
                </div>
            </div>
            <div id="ContactForFIDECourses" className="py-24 px-4 lg:px-8 bg-neutral-800">
                <div className="max-w-7xl m-auto">
                    <ContactForFideCourses />
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

export default FidePage;
