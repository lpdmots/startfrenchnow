import { SlideFromBottom } from "../../animations/Slides";
import { Fade } from "../../animations/Fades";
import LinkArrow from "../../common/LinkArrow";
import { CarouselComments } from "./CarouselComments";
import { useTranslations } from "next-intl";
import { intelRich } from "@/app/lib/intelRich";

function CommentsCarousel() {
    const t = useTranslations("CommentsCarousel");
    return (
        <section className="section overflow-hidden testimonial-section wf-section">
            <div className="container-default w-container">
                <SlideFromBottom>
                    <div className="inner-container _550px center">
                        <div className="inner-container _600px---tablet center">
                            <div className="inner-container _500px---mbl center">
                                <div className="inner-container _400px---mbp center">
                                    <div className="text-center mg-bottom-40px">
                                        <div className="inner-container _400px---mbl center">
                                            <div className="inner-container _350px---mbp center">
                                                <h2 className="display-2">{t.rich("title", intelRich())}</h2>
                                            </div>
                                        </div>
                                        <p className="mg-bottom-48px">
                                            {t("description")}
                                            <span className="text-no-wrap">
                                                {t("description2")} <LinkArrow url="https://www.udemy.com/course/french-for-beginners-a1/">Udemy</LinkArrow>.
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </SlideFromBottom>
                <Fade delay={0.6}>
                    <div className="slider-wrapper w-slider">
                        <CarouselComments />
                    </div>
                </Fade>
            </div>
        </section>
    );
}

export default CommentsCarousel;
