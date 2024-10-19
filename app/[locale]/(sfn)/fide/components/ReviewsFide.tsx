import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import { CarouselComments } from "@/app/components/sfn/home/CarouselComments";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";

const comments = [
    {
        userName: "Anisha Jalla",
        userImage: (
            <div className="rounded-full testimonial-image-wrapper image-comment lg:h-auto overflow-hidden card shadow-1 w-[200px] md:w-[300px] lg:w-[47%]">
                <Image src="/images/anisha.jpeg" height={500} width={500} alt="Anisha Jalla" className="aspect-square image object-cover" />
            </div>
        ),
        comment:
            "I reached out to Yohann just a few weeks before my FIDE exam for a crash course, and am glad I did! He is extremely familiar with the format of the exams and was able to help me focus my preparation on the relevant themes and evaluation requirements. Our sessions were a lot of fun and really helped me build up my confidence going into the exam. I ultimately scored 100% on the FIDE with his guidance. I would highly recommend Yohann for anyone looking to get up to speed on their FIDE preparation!",
    },
    {
        userName: "Serge Tat",
        userImage: (
            <div className="rounded-full testimonial-image-wrapper image-comment lg:h-auto overflow-hidden card shadow-1 w-[200px] md:w-[300px] lg:w-[47%]">
                <Image src="/images/serge.jpg" height={500} width={500} alt="Serge Tat" className="aspect-square image object-cover" />
            </div>
        ),
        comment:
            "Preparing for the FIDE exam with Johann was a great experience! He really understood where I needed help and made sure our sessions were focused and effective. Johann’s guidance gave me the confidence I needed, and I felt well-prepared on exam day. I highly recommend him to anyone getting ready for the FIDE exam!",
    },
    {
        userName: "Pramod",
        userImage: (
            <div className="rounded-full testimonial-image-wrapper image-comment lg:h-auto overflow-hidden card shadow-1 w-[200px] md:w-[300px] lg:w-[47%]">
                <Image src="/images/avatar-de-pramod.png" height={500} width={500} alt="Pramod" className="aspect-square image object-cover" />
            </div>
        ),
        comment:
            "Une première leçon et c'était fantastique ! Rapide, précis et très efficace! Si vous avez besoin d'aide pour préparer l'examen FIDE en Suisse, Yohann est l'un des meilleurs professeurs dans le domaine.",
    },
];

export const ReviewsFide = () => {
    const t = useTranslations("Fide.ReviewsFide");

    return (
        <>
            <SlideFromBottom>
                <div className="flex w-full justify-center">
                    <div className="text-center max-w-5xl">
                        <h2 className="display-2">{t.rich("title", intelRich())}</h2>
                        <p className="mg-bottom-48px">{t("description")}</p>
                    </div>
                </div>
            </SlideFromBottom>
            <Fade delay={0.6}>
                <div className="relative">
                    <CarouselComments comments={comments} />
                    <div className="h-20 lg:hidden"></div>
                </div>
            </Fade>
        </>
    );
};
