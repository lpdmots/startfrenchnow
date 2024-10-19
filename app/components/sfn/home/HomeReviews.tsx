import { SlideFromBottom } from "../../animations/Slides";
import { Fade } from "../../animations/Fades";
import LinkArrow from "../../common/LinkArrow";
import { useLocale, useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";
import { MarqueeSocial } from "./MarqueeSocial";

function HomeReviews() {
    const t = useTranslations("CommentsCarousel");
    const locale = useLocale();
    return (
        <div className="my-12 w-full flex flex-col items-center">
            <div className="w-full p-2 sm:p-4" style={{ maxWidth: 1500 }}>
                <SlideFromBottom>
                    <div className="flex w-full justify-center">
                        <div className="text-center max-w-5xl">
                            <h2 className="display-2">{t.rich("title", intelRich())}</h2>
                            <p className="mg-bottom-48px">
                                {t("description")}
                                <span className="text-no-wrap">
                                    {t("description2")} <LinkArrow url="https://www.udemy.com/course/french-for-beginners-a1/">Udemy</LinkArrow>
                                </span>
                            </p>
                        </div>
                    </div>
                </SlideFromBottom>
                <Fade delay={0.6}>
                    <MarqueeSocial locale={locale} />
                </Fade>
            </div>
        </div>
    );
}

export default HomeReviews;

{
    /* <div className="slider-wrapper w-slider">
                        <CarouselComments />
                    </div> */
}
