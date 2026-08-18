import { Fade } from "@/app/components/animations/Fades";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import { CarouselReviews } from "@/app/components/common/CarouselReviews.tsx/CarouselReviews";
import { CarouselComments } from "@/app/components/sfn/home/CarouselComments";
import { sortFideReviews } from "@/app/lib/fideReviews.mjs";
import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import Image from "next/image";
import type { ReactNode } from "react";

export type SharedFideReview = {
    featured?: boolean;
    isVideo?: boolean;
    userName: string;
    userImage: ReactNode;
    title: string;
    comment: ReactNode;
    score?: number;
    lessons?: number;
    progressFrom?: string;
    progressTo?: string;
    date?: number;
    videoUrl?: string;
    videoThumbnail?: string;
    subtitleENUrl?: string;
    subtitleFRUrl?: string;
    modalComment?: ReactNode;
    certificat?: string;
};

const reviewsComments: SharedFideReview[] = [
    {
        featured: true,
        userName: "Paula",
        userImage: (
            <div className="h-[100px] w-[100px] overflow-hidden rounded-full" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/fide/reviews/paula.webp" height={100} width={100} alt="Paula" className="h-full w-full object-cover object-[50%_22%]" />
            </div>
        ),
        title: "Just a few sessions were enough to boost my confidence",
        comment: (
            <p className="mb-0 text-sm">
                Just a few sessions with Yohann and his expertise were enough to understand the logic of the exam and boost my confidence before the big day! Thank you for your invaluable guidance.
            </p>
        ),
        score: 100,
        progressTo: "B1",
        date: 1778112000000, // 7 mai 2026
        certificat: "/images/fide/reviews/paula.webp",
    },
    {
        userName: "Jessica",
        userImage: (
            <div className="h-[100px] w-[100px] overflow-hidden rounded-full" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/avatars/femme1.png" height={100} width={100} alt="Jessica" className="h-full w-full object-cover" />
            </div>
        ),
        title: "Yohann is an exceptional teacher",
        comment: (
            <p className="mb-0 text-sm">
                I first discovered Yohann through his YouTube videos, where I found his explanations of the FIDE exam incredibly easy to follow. From beginning to end, he was incredibly supportive
                and guided me through the entire process.
            </p>
        ),
        score: 95,
        progressTo: "B1",
        date: 1783296000000, // 6 juillet 2026
        modalComment: (
            <p className="mb-0">
                Yohann is an exceptional teacher. I first discovered him through his YouTube videos, where I found his explanations of the FIDE exam incredibly easy to follow. Because of that, I
                decided to book some sessions with him, and I was not disappointed. From beginning to end, Yohann was incredibly supportive and guided me through the entire process, even though I
                had very limited time before my exam. The notes we made together during our sessions were encouraging and useful for review. I highly recommend him to anyone who needs an expert who
                knows the ins and outs of the FIDE.
            </p>
        ),
    },
    {
        userName: "Javier",
        userImage: (
            <div className="h-[100px] w-[100px] overflow-hidden rounded-full" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/avatars/homme3.png" height={100} width={100} alt="Javier" className="h-full w-full object-cover" />
            </div>
        ),
        title: "Les exercices m’ont donné la confiance nécessaire",
        comment: (
            <p className="mb-0 text-sm">
                Bonne nouvelle : comme on dit au Mexique, tu as eu la voix d’un prophète et j’ai réussi à obtenir le B1, même à l’écrit. Les exercices que nous avons faits m’ont donné la confiance et
                la pratique nécessaires pour passer l’examen.
            </p>
        ),
        score: 100,
        progressTo: "B1",
        date: 1783036800000, // 3 juillet 2026
        certificat: "/images/fide/reviews/javier-result.webp",
        modalComment: (
            <p className="mb-0">
                Cher Yohann,
                <br />
                <br />
                J’espère que tu vas bien. Je viens de recevoir le résultat de mon examen et je veux le partager avec toi.
                <br />
                <br />
                Bonne nouvelle. Comme on dit au Mexique, tu as eu la voix d’un prophète et j’ai réussi à obtenir le B1, même à l’écrit.
                <br />
                <br />
                Merci beaucoup pour ton aide et tes conseils. Les exercices que nous avons faits m’ont donné la confiance et la pratique nécessaires pour passer l’examen.
                <br />
                <br />
                Je suis très heureux.
            </p>
        ),
    },
    {
        userName: "Selahattin",
        userImage: (
            <div className="h-[100px] w-[100px] overflow-hidden rounded-full" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/avatars/homme1.png" height={100} width={100} alt="Selahattin" className="h-full w-full object-cover" />
            </div>
        ),
        title: "J’ai progressé rapidement et gagné beaucoup de confiance",
        comment: (
            <p className="mb-0 text-sm">
                La réussite de mon examen est en grande partie grâce à Yohann. C’est un professeur très professionnel, calme et toujours à l’écoute. Sa méthode de travail est extrêmement efficace et
                orientée vers l’objectif.
            </p>
        ),
        progressTo: "B1",
        date: 1780876800000, // 8 juin 2026
        certificat: "/images/fide/reviews/selahattin-result.webp",
        modalComment: (
            <p className="mb-0">
                La réussite de mon examen est en grande partie grâce à Yohann. C’est un professeur très professionnel, calme et toujours à l’écoute. Sa méthode de travail est extrêmement efficace et
                orientée vers l’objectif.
                <br />
                <br />
                Grâce à son accompagnement, j’ai réussi à obtenir le niveau B1 à l’examen FIDE. J’ai progressé rapidement en français, notamment à l’oral, et j’ai gagné beaucoup de confiance pour
                communiquer au quotidien.
                <br />
                <br />
                Je ne le remercierai jamais assez pour son aide et son soutien. Je le recommande à toute personne qui souhaite réussir son examen et améliorer son français. Si vous voulez vraiment
                atteindre vos objectifs, je vous conseille vivement de travailler avec Yohann.
            </p>
        ),
    },
    {
        userName: "Murat",
        userImage: (
            <div className="h-[100px] w-[100px] overflow-hidden rounded-full" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/avatars/homme2.png" height={100} width={100} alt="Murat" className="h-full w-full object-cover" />
            </div>
        ),
        title: "You are truly great",
        comment: (
            <p className="mb-0 text-sm">
                Hi Yohann — I got B1 :) With this opportunity, I would like to thank you once more. You are truly great :)
            </p>
        ),
        progressTo: "B1",
        date: 1780531200000, // 4 juin 2026
        certificat: "/images/fide/reviews/murat-result.webp",
    },
    {
        isVideo: true,
        userName: "Rita",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/Rita-avatar.jpg" height={100} width={100} alt="rita" className="aspect-square image object-cover" />
            </div>
        ),
        title: "This was honestly the easiest and most enjoyable French-learning experience I've ever had.",
        comment: (
            <p className="mb-0 line-clamp-6">
                Bonjour à tous ! <br />
                My name is Rita, and I am one of Yohann’s former students. <br />
                He is truly an <strong>excellent teacher</strong> who genuinely cares about his students’ progress. That’s why learning French with him feels so <strong>easy and enjoyable</strong>. As
                a professional, board-certified French teacher, he structures his lessons clearly and logically, whether it’s a one-to-one class or an on-demand course. He also offers a wide range of
                services with great flexibility, fair pricing, and consistently <strong>high-quality content</strong>.<br />
            </p>
        ),
        score: 97,
        lessons: 7,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1762963200000, // 12 novembre 2025
        videoUrl: "fide/reviews/Rita.mp4",
        videoThumbnail: "/images/rita-thumbnail.webp",
        subtitleENUrl: "fide/reviews/Rita.vtt",
        modalComment: (
            <p className="mb-0">
                Bonjour à tous ! <br />
                My name is Rita, and I am one of Yohann’s former students. <br />
                And yes… of course you’re about to read how brilliant Yohann is 😅
                <br />
                <br />
                He is truly an <strong>excellent teacher</strong> who genuinely cares about his students’ progress. That’s why learning French with him feels so <strong>easy and enjoyable</strong>. As
                a professional, board-certified French teacher, he structures his lessons clearly and logically, whether it’s a one-to-one class or an on-demand course. He also offers a wide range of
                services with great flexibility, fair pricing, and consistently <strong>high-quality content</strong>.<br />
                <br />
                As a person, Yohann is kind, patient, and genuinely interesting to talk to - which is crucial, because you need real conversation practice to progress in a language. And no matter your
                level, whether total beginner or more advanced, he always finds the right approach to help you reach your goals.
                <br />
                <br />I needed to obtain a <strong>B1 level</strong> for the speaking part of the <strong>FIDE exam</strong>. In just <b>two months</b>, I progressed from A1/A2 to B1 using Yohann’s
                on-demand courses he provides on the Udemy platform - unique, all-in-one resources for different levels that are fun and incredibly easy to follow. I genuinely enjoyed every lesson!
                <br />
                <br />
                In addition, I took seven online one-to-one lessons with Yohann to prepare the main topics for the FIDE exam and consolidate everything I had learned from his courses. During our
                sessions, we focused only on the speaking part, and I did just one writing mock test for myself at home - yet I still managed to achieve <b>97% in the B1 speaking part</b> and{" "}
                <b>91% in the writing part</b>. Can you imagine? I’m so proud of myself 🤗
                <br />
                <br />
                Yohann prepares you perfectly for the exam structure, which is already 50–70% of success, and gives you all the grammar and vocabulary tools you need to pass the level you’re aiming
                for.
                <br />
                <br />
                You won’t regret choosing Yohann as your teacher. This was honestly the <b>easiest and most enjoyable French-learning experience I’ve ever had</b> 😌👌 And trust me, I tried learning
                French with other teachers and apps over the past five years… with almost no progress.
                <br />
                <br />
                So don’t hesitate, just click the “Take FREE lesson” button 😅
                <br />
                <br />
                Bonne chance à vous 😉
            </p>
        ),
    },
    {
        userName: "Rachael",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/rachael-3.png" height={100} width={100} alt="rachael" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Passed FIDE B1 easily with only 6 lessons",
        comment: (
            <p className="mb-0 text-sm">
                Yohann did a fantastic job preparing me for the B1 FIDE exam. Despite being uncertain that I would pass, I passed easily thanks to Yohann's help. Yohann's lessons were very engaging
                and a very efficient use of my time - I only needed 6 lessons.
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                Yohann has played an essential role in my journey of learning French. His well-organized lessons, engaging teaching style and regular encouragement made the process both effective and
                enjoyable. Thanks to him, I improved my language skills and successfully earned my B1 certification. I strongly recommend him to anyone aiming to pass their French exam confidently.
                It's absolutely worth it!
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                Yohann is an excellent teacher. In just 5 hours, he guided me with a strategy that proved highly effective. I started with a rather rusty A2 level in French and managed to achieve a B1
                in both the written and oral sections. This success was entirely thanks to Yohann’s targeted preparation for the exam. He knows exactly what to emphasize and how to navigate the FIDE.
                It was the best investment I could have made for my exam preparation. Highly recommended!
            </p>
        ),
        score: 83,
        lessons: 5,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1757808000000, // 14 septembre 2025
    },
    {
        userName: "Mohammad P.",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/mohammed-p.jpeg" height={100} width={100} alt="mohammed-p" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Yohann’s focused and organized approach made all the difference",
        comment: (
            <p className="mb-0 text-sm">
                I want to express my gratitude to Yohann for helping me to easily pass the FIDE French B1 exam. Starting in January 2025, Yohann's focused and organized approach made all the
                difference. His emphasis on what is important and his method of keeping everything in one place for review were incredibly effective. i made the exam in the 1st half of April and got
                the results last week! also i want to add that seeing these great videos from Start French Now would help a lot to understand and be familar of what you are expecting during FIDE
                test!! Thank you, Yohann!
            </p>
        ),
        score: 85,
        lessons: 30,
        progressFrom: "A2",
        progressTo: "B1",
        date: 1745539200000, // 25 avril 2025
    },
    {
        userName: "Samanta Capolicchio",
        userImage: (
            <div className="rounded-full w-[100px] md:w-[100px] overflow-hidden" style={{ border: "solid 2px var(--neutral-800)" }}>
                <Image src="/images/samanta.png" height={100} width={100} alt="samanta-capolicchio" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Well-structured and friendly FIDE preparation",
        comment: (
            <p className="mb-0 text-sm">
                I had a great experience with the Fide preparation course with Yohann. The teacher was very friendly and knowledgeable, especially when it came to the topics for the oral exam. The
                course was well-structured and focused on helping me get ready for the speaking portion. I would definitely recommend this to anyone getting ready for the Fide oral exam.
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                Merci à Yohann pour son excellent accompagnement pendant mes cours de français. Sa méthode est claire, structurée et adaptée au rythme de chaque élève. J’ai particulièrement apprécié
                ses exercices de scénario, très efficaces pour se préparer à l’oral du test FIDE.\nSes cours sur Udemy sont aussi très bien faits et offrent une bonne opportunité de s’exercer seul à
                la maison, en complément des cours en direct.\nGrâce à son soutien, j’ai gagné en confiance et j’ai réussi à atteindre le niveau B1 à l’examen FIDE.\nJe recommande vivement Yohann à
                toute personne souhaitant progresser en français.
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                I highly recommend taking lessons from Yohann for the FIDE exam. When I started, my French level was quite low and I lacked confidence, but thanks to his focused and well-structured
                lessons, I was able to improve significantly and successfully pass the B1 level. He is patient, encouraging, and really knows how to prepare you for the exam. Taking lessons from him
                was a great decision.
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                Yohann was a great French tutor! I worked with him on an urgent basis, just a few weeks before my FIDE exam, and he helped improve my oral from a low of 60% to 87%, reaching the B1
                level. Very targeted instruction and practical examples!
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                J’ai contacté Yohann quelques semaines avant mon examen FIDE afin de me préparer efficacement. Grâce à sa parfaite connaissance du format de l’examen, il a su cibler les points clés et
                me donner de précieux conseils. Résultat : j’ai obtenu 85% à l’oral et 81% à l’écrit ! Je recommande vivement Yohann à toute personne souhaitant se préparer sérieusement et
                efficacement au FIDE.
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                A few months ago I realised that if I would ever pass FIDE, I would need one on one lessons. Group lessons were just not working for me. A few searches on YouTube let me to Yohann and
                we started our Zoom classes. The lessons were relaxed and I found Yohann s teaching materials comprehensive and easy to follow. He took me through all the possible scenarios with ease.
                Two months later I scheduled an appointment to take the exam. With the skills and knowledge I had acquired in our one on one lessons, I found the Exam easy to manage. I received my
                Fide Language Passport two weeks after the exam and I had passed with flying colours!!!! If you need to pass FIDE, you have limited time, you have confidence issues (like me) you need
                an excellent teacher who is also familiar with the FIDE exam, then I highly recommend Yohann. Thanks Yohann. You rock!
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                I highly recommend Yohann for anyone who wants to take FIDE test. Yohann has a comphrensive teaching system, clear explanations and he is very patient. I started with zero confidence
                in speaking French and after 4 months learning and practising with Yohann, I am able to pass B1 level. His classes were well-structured, engaging and tailored to my level, making the
                learning process enjoyable and effective. Merci Yohann!
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                I received my results today and I did it!!! I got A2 for both oral/understanding and reading/writing! Thank you for all your help! You were amazing and I have recommended you to
                friends who are interested in FIDE courses and studying. I will definitely work with you again for more studying and learning. I look forward to working with you for the B1-B2 levels
                as well!
            </p>
        ),
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
        comment: <p className="mb-0 text-sm">Yes, I received the results and submitted the C permit application on Monday! Woohoo! Much better than I expected. Thanks to you for all the help :)</p>,
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
        comment: (
            <p className="mb-0 text-sm">
                I strongly encourage anyone looking to master the FIDE exam to sign up for some classes with Yohann. I signed up for 4 classes 2 months before my test and it paid off. He spends time
                teaching you the structure of the exam and prepares you with relevant content. It was well worth the money spent as I've received the B1 level I needed for the oral FIDE exam. It was
                very easy to follow his classes as well.
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                Yohann has been an exceptional French teacher, guiding me through the preparation for the A1 French FIDE test. Initially targeting the A1 level, the outcome of achieving A2 was a
                wonderful surprise. The approach taken in the three classes I took was both structured and comprehensive, with a strong emphasis on understanding the test's format and key areas of
                focus that made a significant difference. \n Yohann's ability to explain the language in English was invaluable, especially for someone like me who needed clarity in understanding the
                language. His teaching methods not only built confidence but also made learning engaging and effective. Overall, I recommend Yohann to anyone looking to learn French or prepare for
                similar tests!
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                I reached out to Yohann just a few weeks before my FIDE exam for a crash course, and am glad I did! He is extremely familiar with the format of the exams and was able to help me focus
                my preparation on the relevant themes and evaluation requirements. Our sessions were a lot of fun and really helped me build up my confidence going into the exam. I ultimately scored
                100% on the FIDE with his guidance. I would highly recommend Yohann for anyone looking to get up to speed on their FIDE preparation!
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                Preparing for the FIDE exam with Johann was a great experience! He really understood where I needed help and made sure our sessions were focused and effective. Johann’s guidance gave
                me the confidence I needed, and I felt well-prepared on exam day. I highly recommend him to anyone getting ready for the FIDE exam!
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                Une première leçon et c'était fantastique ! Rapide, précis et très efficace! Si vous avez besoin d'aide pour préparer l'examen FIDE en Suisse, Yohann est l'un des meilleurs professeurs
                dans le domaine.
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                今天我很開心，因為我收到了我的fidetest A2
                合格通知書，擔心了一年，跟過幾位不同的老師，上過幾十小時的網課和實體課，但以乎都在講一些和考試扯不上邊的話題，而且一直開不了口，直到找到了Yohann
                老師，我跟了他十小時，然後就自信滿滿地去考了，口語部份，我感覺兩位考官都被我驚豔到了。\n Today I am very happy, because I received my fidetest A2 pass notice, i was worried about a
                year, i studied with several different teachers, took dozens of hours online classes and physical classes, but so that they were talking about some topics that are not related to the
                exam😅, until I found Yohann , I followed him for about ten hours, and then confidently went to the test, the oral part, I really feel that both examiners were impressed by me. 🥰
            </p>
        ),
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
        comment: (
            <p className="mb-0 text-sm">
                Yohann is an amazing teacher who knows exactly how to explain everything clearly and effectively. His program for preparing students for the FIDE exam is perfect. He thoroughly
                explains the structure and logic of the exam, ensuring that you go into the test already familiar with the types of tasks you’ll face. This approach reduces stress significantly.
                Yohann is always up-to-date with what’s happening in the exam, the current popular topics, and the best ways to approach them. He even provides key phrases and vocabulary to help you
                succeed. The materials he has prepared for his students are incredibly detailed and well thought out. Thanks to Yohann’s excellent teaching, I passed the exam with a B1 level, and I am
                incredibly grateful to him for his support and dedication.
            </p>
        ),
        score: 91,
        lessons: 4,
        progressFrom: "A2/B1",
        progressTo: "B1",
    },
    {
        userName: "Orkun",
        userImage: (
            <div
                className="rounded-full w-[100px] h-[100px] md:w-[100px] md:h-[100px] overflow-hidden flex items-center justify-center bg-neutral-200 text-neutral-800 text-3xl font-semibold"
                style={{ border: "solid 2px var(--neutral-800)" }}
                aria-label="Avatar Orkun"
            >
                <Image src="/images/avatars/homme4.png" height={100} width={100} alt="Orkun" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Your patience, structure, and clear guidance made a significant difference",
        comment: (
            <p className="mb-0 text-sm">
                I wanted to take a moment to sincerely thank you for your support throughout my preparation for the FIDE B1 exam. Your patience, structure, and clear guidance made a significant
                difference in my learning journey. You always kept the sessions focused and practical, which helped me build confidence step by step.
            </p>
        ),
        score: 92,
        progressTo: "B1",
        date: 1776902400000, // 23 avril 2026
        certificat: "fide/certificats/orkun-certif.png",
        modalComment: (
            <p className="mb-0">
                I wanted to take a moment to sincerely thank you for your support throughout my preparation for the FIDE B1 exam. Your patience, structure, and clear guidance made a significant
                difference in my learning journey. You always kept the sessions focused and practical, which helped me build confidence step by step, even when I wasn’t sure I would be able to pass
                the exam.
                <br />
                <br />
                Thanks to your motivating approach and consistent encouragement, I not only passed but achieved a result I’m genuinely proud of. You created a learning environment that pushed me to
                improve while also making the process enjoyable. I truly appreciate your dedication and the way you adapted your teaching to my needs—it made all the difference.
            </p>
        ),
    },
    {
        userName: "Jiahong",
        userImage: (
            <div
                className="rounded-full w-[100px] h-[100px] md:w-[100px] md:h-[100px] overflow-hidden flex items-center justify-center bg-neutral-200 text-neutral-800 text-3xl font-semibold"
                style={{ border: "solid 2px var(--neutral-800)" }}
                aria-label="Avatar Jiahong"
            >
                <Image src="/images/avatars/femme3.png" height={100} width={100} alt="Jiahong" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Tailor-made teaching and a straight-to-the-point approach to the exam",
        comment: (
            <p className="mb-0 text-sm">
                I discovered Yohann’s introduction to the FIDE exam on YouTube 10 days before my FIDE exam. That introduction was so comprehensive. After four sessions, I felt more confident speaking,
                and I noticed my progress was rapid. Thanks to Yohann’s tailor-made teaching and straight-to-the-point approach, I was able to pass the Swiss FIDE Exam B1 with flying colours.
            </p>
        ),
        score: 91,
        lessons: 4,
        progressTo: "B1",
        date: 1764892800000, // 5 décembre 2025
        certificat: "fide/certificats/Passport-Fide-Jiahong.jpg",
        modalComment: (
            <p className="mb-0">
                I discovered Yohann’s introduction to the FIDE exam on YouTube 10 days before my FIDE exam. That introduction was so comprehensive. I contacted Yohann immediately to demand a
                tailor-made course (for three sessions) since I spoke only broken French and my French language grammar is not solid at all. After attending three sessions, I requested an additional
                session before the exam. After the four sessions, I felt more confident speaking, and I noticed my progress was rapid. Thanks to Yohann’s tailor-made teaching and straight-to-the-point
                approach to the exam, I was able to pass the Swiss FIDE Exam B1 with flying colours.
                <br />
                <br />
                我发现网上授课为准备瑞士FIDE法语考试的老师只有Yohann。感谢我最好的法语老师Yohann帮我在最短的时间内复习瑞士FIDE的法语的B1考试。我的烂法语通过Yohann老师三星期前给我量身定制的四节课程和直接就考试题目的练xi和复习指导，我的法语水平极快提高，自信心大涨，所以，临场发挥自如。今日收到了BERD
                FIDE 发的B1通过的证书。依我看，真对FIDE的法语考试的最好的老师就是Yohann。
            </p>
        ),
    },
    {
        userName: "Antonio P.",
        userImage: (
            <div
                className="rounded-full w-[100px] h-[100px] md:w-[100px] md:h-[100px] overflow-hidden flex items-center justify-center bg-neutral-200 text-neutral-800 text-3xl font-semibold"
                style={{ border: "solid 2px var(--neutral-800)" }}
                aria-label="Avatar Antonio P."
            >
                <Image src="/images/avatars/homme2.png" height={100} width={100} alt="Antonio P." className="aspect-square image object-cover" />
            </div>
        ),
        title: "A very clear, calm and easy-going approach",
        comment: (
            <p className="mb-0 text-sm">
                I strongly recommend Yohann. Yohann supported me with my FIDE test, his method of teaching is very clear and very real. He provides you with a very clear understanding of the mechanics
                of the exam and focuses on real case scenarios for the test.
            </p>
        ),
        progressTo: "B1",
        date: 1768953600000, // 21 janvier 2026
        modalComment: (
            <p className="mb-0">
                I strongly recommend Yohann. Yohann supported me with my Fide test, his method of teaching is very clear and very real. 1. He provides you with a very clear understanding of the
                mechanics of the exam so to be prepared and he focuses on real case scenarios for the test. He identifies your strengths and helps you building on them, but more than anything he has a
                very clear, calm and easy going approach. I took many French lessons courses but with Yohann is what I absorbed the most. Antonio
            </p>
        ),
    },
    {
        userName: "Shazia",
        userImage: (
            <div
                className="rounded-full w-[100px] h-[100px] md:w-[100px] md:h-[100px] overflow-hidden flex items-center justify-center bg-neutral-200 text-neutral-800 text-3xl font-semibold"
                style={{ border: "solid 2px var(--neutral-800)" }}
                aria-label="Avatar Shazia"
            >
                <Image src="/images/avatars/femme1.png" height={100} width={100} alt="Shazia" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Good news!!!",
        comment: <p className="mb-0 text-sm">Good news!!! Thank you for your help</p>,
        score: 90,
        progressTo: "B1",
        date: 1769040000000, // 22 janvier 2026
        certificat: "fide/certificats/Shazia-certif.png",
    },
    {
        userName: "Ailan",
        userImage: (
            <div
                className="rounded-full w-[100px] h-[100px] md:w-[100px] md:h-[100px] overflow-hidden flex items-center justify-center bg-neutral-200 text-neutral-800 text-3xl font-semibold"
                style={{ border: "solid 2px var(--neutral-800)" }}
                aria-label="Avatar Ailan"
            >
                <Image src="/images/avatars/homme3.png" height={100} width={100} alt="Ailan" className="aspect-square image object-cover" />
            </div>
        ),
        title: "Very targeted preparation helped me pass on the first try",
        comment: (
            <p className="mb-0 text-sm">
                I learned French some time back and didn't use it for the last 5 years. I took a few lessons with Yohann and thanks to his professionalism, support and very targeted preparation I did
                pass the exam from the first try and received the highest grade B1!
            </p>
        ),
        score: 100,
        progressTo: "B1",
        date: 1777680000000, // 2 mai 2026
        certificat: "fide/certificats/Ailan-certif.jpeg",
        modalComment: (
            <p className="mb-0">
                I learned French some time back and didn't use it for the last 5 years. I took a few lessons with Yohann and thanks to his professionalism, support and very targeted preparation I did
                pass the exam from the first try and received the highest grade B1! He knows all the requirements and specificities of the exam which helps you to feel confident during the exam! Thank
                you dear Yohann! Ailan
            </p>
        ),
    },
    {
        userName: "Wendy M.",
        userImage: (
            <div
                className="rounded-full w-[100px] h-[100px] md:w-[100px] md:h-[100px] overflow-hidden flex items-center justify-center bg-neutral-200 text-neutral-800 text-3xl font-semibold"
                style={{ border: "solid 2px var(--neutral-800)" }}
                aria-label="Avatar Wendy M."
            >
                <Image src="/images/avatars/femme4.png" height={100} width={100} alt="Wendy M." className="aspect-square image object-cover" />
            </div>
        ),
        title: "Yohann Coussot’s FIDE exam preparation coaching made all the difference",
        comment: (
            <p className="mb-0 text-sm">
                I had very little time to prepare for my FIDE exam, and Yohann’s YouTube examples stood out to me as the most helpful. His teaching style, research materials and video scenarios really
                prepare you for success, focusing only on the content needed for the FIDE exam.
            </p>
        ),
        score: 93,
        progressTo: "B1",
        date: 1777334400000, // 28 avril 2026
        certificat: "fide/certificats/wendy-certif.png",
        modalComment: (
            <p className="mb-0">
                Yohann Coussot’s FIDE exam preparation coaching made all the difference.
                <br />
                <br />I had very little time to prepare for my FIDE exam so I searched all the various sites and video clips available online looking for FIDE study and learning materials. It was
                Yohann Coussot’s YouTube examples for preparation that stood out to me and were the most helpful. Yohann offers flexible learning packages to suit everyone’s level, and in particular,
                he offers an intensive preparation 1:1 which I identified was the right match for me. Following a 15-minute introductory call I had no hesitation that Yohann was a particularly
                knowledgeable teacher who knew well the FIDE exam structure and how to prepare for the exam. Yohann is an extremely good teacher, his teaching style, research materials and video
                scenarios really prepare you for success and it’s unique because there isn’t any time wasted learning what you don’t need to know. Focusing on the content needed for the FIDE exam and
                going into the exam well prepared made all the difference for me. I can’t thank Yohann enough and would recommend his courses very highly.
            </p>
        ),
    },
    {
        userName: "Myra G.",
        userImage: (
            <div
                className="rounded-full w-[100px] h-[100px] md:w-[100px] md:h-[100px] overflow-hidden flex items-center justify-center bg-neutral-200 text-neutral-800 text-3xl font-semibold"
                style={{ border: "solid 2px var(--neutral-800)" }}
                aria-label="Avatar Myra G."
            >
                <Image src="/images/avatars/femme2.png" height={100} width={100} alt="Myra G." className="aspect-square image object-cover" />
            </div>
        ),
        title: "Professional, patient, and focused on exactly what I needed",
        comment: (
            <p className="mb-0 text-sm">
                I highly recommend Yohann as a FIDE teacher. He is very professional, patient, and explains everything clearly. His lessons were well organized and focused exactly on the skills needed
                for the FIDE B1 exam.
            </p>
        ),
        score: 83,
        progressTo: "B1",
        modalComment: (
            <p className="mb-0">
                I highly recommend Yohann as a FIDE teacher. He is very professional, patient, and explains everything clearly. His lessons were well organized and focused exactly on the skills needed
                for the FIDE B1 exam. Thanks to his preparation and teaching methods, I was able to pass the FIDE B1 exam easily and with confidence.
                <br />
                <br />
                If you are preparing for the FIDE exam, especially the oral part, you MUST get Yohann, he is an excellent teacher!
            </p>
        ),
    },
];

export const sharedFideReviews = reviewsComments;

type ReviewsFideProps = {
    headingSpanClassName?: string;
};

export const ReviewsFide = ({ headingSpanClassName = "heading-span-secondary-2" }: ReviewsFideProps) => {
    const t = useTranslations("Fide.ReviewsFide");

    const richTitle = {
        ...intelRich(),
        hs1: (chunks: any) => <span className={headingSpanClassName}>{chunks}</span>,
        hs2: (chunks: any) => <span className={headingSpanClassName}>{chunks}</span>,
        hs3: (chunks: any) => <span className={headingSpanClassName}>{chunks}</span>,
        hs4: (chunks: any) => <span className={headingSpanClassName}>{chunks}</span>,
        hs5: (chunks: any) => <span className={headingSpanClassName}>{chunks}</span>,
        hs6: (chunks: any) => <span className={headingSpanClassName}>{chunks}</span>,
    };

    return (
        <>
            <SlideFromBottom>
                <div className="flex w-full justify-center">
                    <div className="text-center max-w-5xl">
                        <h2 className="display-2 pb-4 lg:pb-8">{t.rich("title", richTitle)}</h2>
                        <p className="mg-bottom-48px">{t("description")}</p>
                    </div>
                </div>
            </SlideFromBottom>
            <Fade delay={0.6}>
                <div className="relative min-h-[470px]">
                    <CarouselReviews comments={sortFideReviews(sharedFideReviews)} />
                    <div className="h-20 lg:hidden"></div>
                </div>
            </Fade>
        </>
    );
};
