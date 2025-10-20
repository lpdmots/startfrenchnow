import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import { CarouselReviews } from "@/app/components/common/CarouselReviews.tsx/CarouselReviews";
import { CarouselComments } from "@/app/components/sfn/home/CarouselComments";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";

const reviewsComments = [
    {
        userName: "Esabel",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/esabel.jpeg" height={100} width={100} alt="esabel" className="aspect-square image object-cover" />
            </div>
        ),
        title: "From zero confidence to B1 level",
        comment:
            "I highly recommend Yohann for anyone who wants to take FIDE test. Yohann has a comphrensive teaching system, clear explanations and he is very patient. I started with zero confidence in speaking French and after 4 months learning and practising with Yohann, I am able to pass B1 level. His classes were well-structured, engaging and tailored to my level, making the learning process enjoyable and effective. Merci Yohann!",
        score: 84,
        lessons: 25,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1743379200000,
    },
    {
        userName: "Andriana",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/Andriana.jpeg" height={100} width={100} alt="Andriana" className="aspect-square image object-cover" />
            </div>
        ),
        title: "I look forward to working with you",
        comment:
            "I received my results today and I did it!!! I got A2 for both oral/understanding and reading/writing! Thank you for all your help! You were amazing and I have recommended you to friends who are interested in FIDE courses and studying. I will definitely work with you again for more studying and learning. I look forward to working with you for the B1-B2 levels as well!",
        score: 82,
        lessons: 5,
        progressFrom: "A1",
        progressTo: "A2",
        date: 1742515200000,
    },
    {
        userName: "Adam",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/Adam.jpeg" height={100} width={100} alt="Adam" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Much better than I expected",
        comment: "Yes, I received the results and submitted the C permit application on Monday! Woohoo! Much better than I expected. Thanks to you for all the help :)",
        score: 93,
        lessons: 13,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1740700800000,
    },
    {
        userName: "Dhisana",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/Dhisana.jpeg" height={100} width={100} alt="Dhisana" className="aspect-square image object-cover" />
            </div>
        ),
        title: "It was well worth the money spent",
        comment:
            "I strongly encourage anyone looking to master the FIDE exam to sign up for some classes with Yohann. I signed up for 4 classes 2 months before my test and it paid off. He spends time teaching you the structure of the exam and prepares you with relevant content. It was well worth the money spent as I've received the B1 level I needed for the oral FIDE exam. It was very easy to follow his classes as well.",
        score: 81,
        lessons: 4,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1738800000000,
    },
    {
        userName: "Chloe",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/Chloe.jpeg" height={100} width={100} alt="Chloe" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Yohann's ability to explain the language in English was invaluable",
        comment:
            "Yohann has been an exceptional French teacher, guiding me through the preparation for the A1 French FIDE test. Initially targeting the A1 level, the outcome of achieving A2 was a wonderful surprise. The approach taken in the three classes I took was both structured and comprehensive, with a strong emphasis on understanding the test's format and key areas of focus that made a significant difference. \n Yohann's ability to explain the language in English was invaluable, especially for someone like me who needed clarity in understanding the language. His teaching methods not only built confidence but also made learning engaging and effective. Overall, I recommend Yohann to anyone looking to learn French or prepare for similar tests!",
        score: 82,
        lessons: 3,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1738627200000,
    },
    {
        userName: "Anisha Jalla",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/anisha.jpeg" height={100} width={100} alt="Anisha Jalla" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Extremely familiar with the format",
        comment:
            "I reached out to Yohann just a few weeks before my FIDE exam for a crash course, and am glad I did! He is extremely familiar with the format of the exams and was able to help me focus my preparation on the relevant themes and evaluation requirements. Our sessions were a lot of fun and really helped me build up my confidence going into the exam. I ultimately scored 100% on the FIDE with his guidance. I would highly recommend Yohann for anyone looking to get up to speed on their FIDE preparation!",
        score: 100,
        lessons: 6,
        progressFrom: "B1",
        progressTo: "B1",
    },
    {
        userName: "Serge Tat",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/serge.jpg" height={100} width={100} alt="Anisha Jalla" className="aspect-square image object-cover" />
            </div>
        ),
        title: "He really understood where I needed help",
        comment:
            "Preparing for the FIDE exam with Johann was a great experience! He really understood where I needed help and made sure our sessions were focused and effective. Johann’s guidance gave me the confidence I needed, and I felt well-prepared on exam day. I highly recommend him to anyone getting ready for the FIDE exam!",
        score: 87,
        lessons: 8,
        progressFrom: "A2",
        progressTo: "B1",
    },
    {
        userName: "Pramod",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/pramod-reviews.jpg" height={100} width={100} alt="Anisha Jalla" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Rapide, précis et très efficace!",
        comment:
            "Une première leçon et c'était fantastique ! Rapide, précis et très efficace! Si vous avez besoin d'aide pour préparer l'examen FIDE en Suisse, Yohann est l'un des meilleurs professeurs dans le domaine.",
        score: 93,
        lessons: 2,
        progressFrom: "B1",
        progressTo: "B1",
    },
    {
        userName: "Tina",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/tina.jpg" height={100} width={100} alt="Tina" className="aspect-square image object-cover" />
            </div>
        ),
        title: "I really feel that both examiners were impressed by me",
        comment:
            "今天我很開心，因為我收到了我的fidetest A2 合格通知書，擔心了一年，跟過幾位不同的老師，上過幾十小時的網課和實體課，但以乎都在講一些和考試扯不上邊的話題，而且一直開不了口，直到找到了Yohann 老師，我跟了他十小時，然後就自信滿滿地去考了，口語部份，我感覺兩位考官都被我驚豔到了。\n Today I am very happy, because I received my fidetest A2 pass notice, i was worried about a year, i studied with several different teachers, took dozens of hours online classes and physical classes, but so that they were talking about some topics that are not related to the exam😅, until I found Yohann , I followed him for about ten hours, and then confidently went to the test, the oral part, I really feel that both examiners were impressed by me. 🥰",
        score: 70,
        lessons: 10,
        progressFrom: "A1/A2",
        progressTo: "A2",
    },
    {
        userName: "Alina",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/alina.jpg" height={100} width={100} alt="Alina" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Yohann is always up-to-date with what’s happening in the exam",
        comment:
            "Yohann is an amazing teacher who knows exactly how to explain everything clearly and effectively. His program for preparing students for the FIDE exam is perfect. He thoroughly explains the structure and logic of the exam, ensuring that you go into the test already familiar with the types of tasks you’ll face. This approach reduces stress significantly. Yohann is always up-to-date with what’s happening in the exam, the current popular topics, and the best ways to approach them. He even provides key phrases and vocabulary to help you succeed. The materials he has prepared for his students are incredibly detailed and well thought out. Thanks to Yohann’s excellent teaching, I passed the exam with a B1 level, and I am incredibly grateful to him for his support and dedication.",
        score: 91,
        lessons: 4,
        progressFrom: "A2/B1",
        progressTo: "B1",
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
                <div className="relative min-h-[470px]">
                    <CarouselReviews comments={reviewsComments} />
                    <div className="h-20 lg:hidden"></div>
                </div>
            </Fade>
        </>
    );
};
