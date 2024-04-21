import { useTranslations } from "next-intl";
import { SlideInOneByOneParent } from "../../animations/Slides";
import { intelRich } from "@/app/lib/intelRich";
import { LessonCardsRender } from "../home/LessonCards";

const CoursesOtherChoices = ({ courseUrl, courseRef }: { courseUrl: string; courseRef: string }) => {
    const t = useTranslations("LessonCards");
    const tOther = useTranslations(`Courses.${courseRef}.OtherCourses`);

    const allLessons = [
        {
            title: t("lessons.beginnerLevel1.title"),
            image: "/images/cours1.jpg",
            description: t("lessons.beginnerLevel1.description"),
            price: 100,
            reduction: 60,
            difficulty: "A1",
            time: "16h10",
            link: "/courses/beginners",
        },
        {
            title: t("lessons.lowIntermediateLevel2.title"),
            image: "/images/cours2.jpg",
            description: t("lessons.lowIntermediateLevel2.description"),
            price: 120,
            reduction: 70,
            difficulty: "A2",
            time: "11h40",
            link: "/courses/intermediates",
        },
        {
            title: t("lessons.lowIntermediateLevel3.title"),
            image: "/images/cours3.jpg",
            description: t("lessons.lowIntermediateLevel3.description"),
            price: 120,
            reduction: 70,
            difficulty: "B1",
            time: "23h",
            link: "/courses/dialogues",
            isNew: t("lessons.lowIntermediateLevel3.new"),
        },
        {
            title: t("lessons.masterPastTenses.title"),
            image: "/images/cours-passe.png",
            description: t("lessons.masterPastTenses.description"),
            price: 90,
            reduction: null,
            difficulty: "A2",
            time: "1h30",
            link: "/courses/past-tenses",
        },
    ];
    const lessons = allLessons.filter((lesson) => lesson.link !== courseUrl);

    return (
        <section className="padding-courses pt-0">
            <div className="container-default w-container ">
                <div className="max-w-500 md:max-w-none m-auto">
                    <SlideInOneByOneParent>
                        <>
                            <div>
                                <h2 id="courses" className="display-2 mb-12 md:mb-24">
                                    {tOther.rich("title", intelRich())}
                                </h2>
                            </div>
                            <div className="grid grid-cols-6 gap-4 lg:gap-8">
                                <LessonCardsRender lessons={lessons} />
                            </div>
                        </>
                    </SlideInOneByOneParent>
                </div>
            </div>
        </section>
    );
};

export default CoursesOtherChoices;
