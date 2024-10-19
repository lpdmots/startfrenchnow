"use client";
import { useEffect, useState } from "react";
import { SlideInOneByOneChild, SlideInOneByOneParent } from "../../animations/Slides";
import { FaCommentDots, FaStar, FaStarHalfAlt, FaUserGraduate } from "react-icons/fa";
import { CompteurIncrement, CompteurStarsIncrement } from "../../common/CompteurIncrement";
import { getCourseDetails } from "@/app/serverActions/udemyActions";
import { UdemyBig, UdemyColor } from "../../common/logos/Udemy";
import Image from "next/image";

interface CourseDetails {
    avg_rating: number;
    num_reviews: number;
    num_subscribers: number;
}

interface Props {
    courseIds: string[];
    baseNumbers: {
        subscribers: number;
        rating: number;
        reviews: number;
    };
}

export const CourseRatings = ({ courseIds, baseNumbers }: Props) => {
    const [course, setCourse] = useState<CourseDetails | null>(null);
    const [isComponentVisible, setIsComponentVisible] = useState(false);
    const { subscribers, rating, reviews } = baseNumbers;

    useEffect(() => {
        (async () => {
            const course = { avg_rating: 0, num_reviews: 0, num_subscribers: 0 };
            for (const courseId of courseIds) {
                const courseDetails = await getCourseDetails(courseId);
                if (courseDetails?.error?.message) return console.error(courseDetails.error.message);
                course.avg_rating += courseDetails.avg_rating;
                course.num_reviews += courseDetails.num_reviews;
                course.num_subscribers += courseDetails.num_subscribers;
            }
            course.avg_rating = Math.round((course.avg_rating / courseIds.length) * 10) / 10; // Calculate average and round to the nearest tenth
            setCourse(course);
        })();
    }, [courseIds]);

    return (
        <SlideInOneByOneParent onVisible={setIsComponentVisible}>
            <div className="flex justify-center w-full">
                <div className="flex justify-around gap-2 md:gap-8 lg:gap-12" style={{ maxWidth: "95vw" }}>
                    <SlideInOneByOneChild>
                        <div className="w-full md:w-auto">
                            <UdemyColor width={150} height={50} />
                        </div>
                    </SlideInOneByOneChild>
                    <SlideInOneByOneChild>
                        <div className="flex flex-col  justify-center items-center gap-2" style={{ minWidth: 80 }}>
                            <p className="font-extrabold text-xl md:text-2xl mb-0">
                                <CompteurIncrement nombreDeBase={subscribers} nombreFinal={isComponentVisible && course?.num_subscribers ? course?.num_subscribers : subscribers} />
                            </p>
                            <FaUserGraduate className="text-lg md:text-3xl" />
                        </div>
                    </SlideInOneByOneChild>
                    <SlideInOneByOneChild>
                        <CompteurStarsIncrement nombreDeBase={rating} nombreFinal={isComponentVisible && course?.avg_rating ? course?.avg_rating : rating} />
                    </SlideInOneByOneChild>
                    {/* <SlideInOneByOneChild>
                        <div className="flex flex-col justify-center items-center gap-2" style={{ minWidth: 80 }}>
                            <p className="font-extrabold text-2xl  mb-0">
                                <CompteurIncrement nombreDeBase={reviews} nombreFinal={isComponentVisible && course?.num_reviews ? course?.num_reviews : reviews} />
                            </p>
                            <FaCommentDots className="text-3xl" />
                        </div>
                    </SlideInOneByOneChild> */}
                </div>
            </div>
        </SlideInOneByOneParent>
    );
};
