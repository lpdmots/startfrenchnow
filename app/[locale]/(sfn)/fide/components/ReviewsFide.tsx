import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import { CarouselReviews } from "@/app/components/common/CarouselReviews.tsx/CarouselReviews";
import { CarouselComments } from "@/app/components/sfn/home/CarouselComments";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";

const reviewsComments = [
    {
        userName: "Rachael",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/rachael-3.png" height={100} width={100} alt="rachael" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Passed FIDE B1 easily with only 6 lessons",
        comment:
            "Yohann did a fantastic job preparing me for the B1 FIDE exam. Despite being uncertain that I would pass, I passed easily thanks to Yohann's help. Yohann's lessons were very engaging and a very efficient use of my time - I only needed 6 lessons.",
        score: 100,
        lessons: 6,
        progressFrom: "B1",
        progressTo: "B1",
        date: 1761264000000, // 24 octobre 2025
    },
    {
        userName: "Aneela",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/aneela.png" height={100} width={100} alt="aneela" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Enjoyable and effective lessons",
        comment:
            "Yohann has played an essential role in my journey of learning French. His well-organized lessons, engaging teaching style and regular encouragement made the process both effective and enjoyable. Thanks to him, I improved my language skills and successfully earned my B1 certification. I strongly recommend him to anyone aiming to pass their French exam confidently. It's absolutely worth it!",
        score: 83,
        lessons: 20,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1760572800000, // 16 octobre 2025
    },
    {
        userName: "Hrvoje",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/hrvoje.png" height={100} width={100} alt="hrvoje" className="aspect-square image object-cover" />
            </div>
        ),
        title: "From rusty A2 to confident B1",
        comment:
            "Yohann is an excellent teacher. In just 5 hours, he guided me with a strategy that proved highly effective. I started with a rather rusty A2 level in French and managed to achieve a B1 in both the written and oral sections. This success was entirely thanks to Yohann’s targeted preparation for the exam. He knows exactly what to emphasize and how to navigate the FIDE. It was the best investment I could have made for my exam preparation. Highly recommended!",
        score: 83,
        lessons: 5,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1757808000000, // 14 septembre 2025
    },
    {
        userName: "Samanta Capolicchio",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/samanta.png" height={100} width={100} alt="samanta-capolicchio" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Well-structured and friendly FIDE preparation",
        comment:
            "I had a great experience with the Fide preparation course with Yohann. The teacher was very friendly and knowledgeable, especially when it came to the topics for the oral exam. The course was well-structured and focused on helping me get ready for the speaking portion. I would definitely recommend this to anyone getting ready for the Fide oral exam.",
        score: 100,
        lessons: 7,
        progressFrom: "B1",
        progressTo: "B1",
        date: 1744934400000, // 18 avril 2025
    },
    {
        userName: "Suleyman Karacay",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/suleyman.png" height={100} width={100} alt="suleyman-karacay" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Gained confidence and passed B1 FIDE",
        comment:
            "Merci à Yohann pour son excellent accompagnement pendant mes cours de français. Sa méthode est claire, structurée et adaptée au rythme de chaque élève. J’ai particulièrement apprécié ses exercices de scénario, très efficaces pour se préparer à l’oral du test FIDE.\nSes cours sur Udemy sont aussi très bien faits et offrent une bonne opportunité de s’exercer seul à la maison, en complément des cours en direct.\nGrâce à son soutien, j’ai gagné en confiance et j’ai réussi à atteindre le niveau B1 à l’examen FIDE.\nJe recommande vivement Yohann à toute personne souhaitant progresser en français.",
        lessons: 21,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1747699200000, // 20 mai 2025
    },
    {
        userName: "Aakriti Thakur",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/aakriti.png" height={100} width={100} alt="aakriti-thakur" className="aspect-square image object-cover" />
            </div>
        ),
        title: "From low confidence to B1 success",
        comment:
            "I highly recommend taking lessons from Yohann for the FIDE exam. When I started, my French level was quite low and I lacked confidence, but thanks to his focused and well-structured lessons, I was able to improve significantly and successfully pass the B1 level. He is patient, encouraging, and really knows how to prepare you for the exam. Taking lessons from him was a great decision.",
        score: 89,
        lessons: 15,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1747958400000, // 23 mai 2025
    },
    {
        userName: "Anant Murthy",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/anant.png" height={100} width={100} alt="anant-murthy" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Rapid improvement before FIDE exam",
        comment:
            "Yohann was a great French tutor! I worked with him on an urgent basis, just a few weeks before my FIDE exam, and he helped improve my oral from a low of 60% to 87%, reaching the B1 level. Very targeted instruction and practical examples!",
        score: 87,
        lessons: 6,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1750204800000, // 18 juin 2025
    },
    {
        userName: "Siddharth Kaushik",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/siddharth.png" height={100} width={100} alt="siddharth-kaushik" className="aspect-square image object-cover" />
            </div>
        ),
        title: "The perfect FIDE preparation course",
        comment:
            "J’ai contacté Yohann quelques semaines avant mon examen FIDE afin de me préparer efficacement. Grâce à sa parfaite connaissance du format de l’examen, il a su cibler les points clés et me donner de précieux conseils. Résultat : j’ai obtenu 85% à l’oral et 81% à l’écrit ! Je recommande vivement Yohann à toute personne souhaitant se préparer sérieusement et efficacement au FIDE.",
        score: 85,
        lessons: 15,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1750204800000, // 18 juin 2025
    },
    {
        userName: "Nyalleng Pii",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/nyalleng.png" height={100} width={100} alt="nyalleng-pii" className="aspect-square image object-cover" />
            </div>
        ),
        title: "From no confidence to flying colours at FIDE",
        comment:
            "A few months ago I realised that if I would ever pass FIDE, I would need one on one lessons. Group lessons were just not working for me. A few searches on YouTube let me to Yohann and we started our Zoom classes. The lessons were relaxed  and I found Yohann s teaching materials comprehensive and easy to follow. He took me through all the possible scenarios with ease. Two months later I  scheduled an appointment to take the exam. With the skills and knowledge I had acquired in our one on one lessons, I found the Exam easy to manage. I received my Fide Language Passport two weeks after the exam and I had passed with flying colours!!!! If you need to pass FIDE, you have limited time, you have confidence issues (like me) you need an excellent teacher who is also familiar with the FIDE exam, then I highly recommend Yohann. Thanks Yohann. You rock!",
        score: 90,
        lessons: 13,
        progressFrom: "A1",
        progressTo: "A2",
        date: 1753228800000, // 23 juillet 2025
    },
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
