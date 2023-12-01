import Image from "next/image";
import Link from "next-intl/link";
import urlFor from "@/app/lib/urlFor";
import { BsCaretRightFill } from "react-icons/bs";
import TabelVoc from "./RichTextSfnComponents/TabelVoc";
import { FaFileDownload } from "react-icons/fa";
import VideoBlog from "./RichTextSfnComponents/VideoBlog";
import Flashcards from "../exercises/Flashcards";
import { FcIdea } from "react-icons/fc";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import { CATEGORIESCOLORS, HEADINGSPANCOLORS } from "@/app/lib/constantes";
import lessonTeacher from "@/public/images/lesson-teacher.png";
import { TranslationPopover } from "./RichTextSfnComponents/TranslationPopover";
import Exercise from "../exercises/exercise/Exercise";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

export const RichTextComponents = (category?: keyof typeof CATEGORIESCOLORS) => ({
    types: {
        image: ({ value }: any) => {
            return (
                <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto my-12" style={{ maxWidth: "700px" }}>
                    <Image src={urlFor(value).url()} height={700} width={700} loading="eager" alt="Blog Post Image" className="image object-contain rounded-lg" />
                </div>
            );
        },
        videoBlog: ({ value }: any) => <VideoBlog values={value} />,
        tabelVoc: ({ value }: any) => <TabelVoc data={value} />,
        flashcards: ({ value }: any) => {
            return <Flashcards data={value} />;
        },
        exercise: ({ value }: any) => {
            return <Exercise _ref={value._ref} />;
        },
    },
    list: {
        bullet: ({ children }: any) => <ul className="ml-4 sm:ml-10 py-5 list-disc space-y-5">{children}</ul>,
        number: ({ children }: any) => <ol className="mt-lg list-decimal">{children}</ol>,
    },
    block: {
        h1: ({ children }: any) => <h1 className="display-1 my-12">{children}</h1>,
        h2: ({ children }: any) => <h2 className="display-3 my-12">{children}</h2>,
        h3: ({ children }: any) => <h3 className="display-4 my-12">{children}</h3>,
        h4: ({ children }: any) => <h4 className="display-4 my-12">{children}</h4>,
        blockquote: ({ children }: any) => (
            <blockquote className="sm:p-4 mx-0 sm:mx-6 md:mx-12">
                <div className="flex w-full">
                    <RiDoubleQuotesL className="text-3xl md:text-4xl text-neutral-600" />
                </div>
                <p className="mb-0 bl font-bold px-6 sm:px-12 text-justify text-neutral-600">{children}</p>
                <div className="flex w-full justify-end">
                    <RiDoubleQuotesR className="text-3xl md:text-4xl text-neutral-600" />
                </div>
            </blockquote>
        ),
        exemple: ({ children }: any) => (
            <div className="pl-8 md:pl-12 pr-2 md:pr-4 py-2 sm:py-4 mb-4" style={{ borderLeft: "solid 6px var(--neutral-500)" }}>
                <p className="italic mb-0">{children}</p>
            </div>
        ),
        help: ({ children }: any) => (
            <div
                className="help pl-8 md:pl-12 bg-neutral-300 pr-2 md:pr-4 py-2 sm:py-4 mb-4"
                style={{ borderLeft: "solid 6px var(--neutral-600)", borderRadius: 10, borderColor: CATEGORIESCOLORS[category || "tips"] }}
            >
                <p className="mb-0">{children}</p>
            </div>
        ),
        funfact: ({ children }: any) => (
            <div className="flex flex-col items-center my-8">
                <div className="w-full bg-neutral-600 mb-4" style={{ height: 1 }}></div>
                <div className="flex items-center justify-center">
                    <div className="px-4 sm:px-8">
                        <FcIdea className="text-3xl sm:text-4xl" />
                    </div>
                    <div>
                        <p className="font-bold mb-0">Le saviez-vous ?</p>
                        <p>{children}</p>
                    </div>
                </div>
                <div className="w-full bg-neutral-600" style={{ height: 1 }}></div>
            </div>
        ),
        extract: ({ children }: any) => (
            <div className="card p-4 sm:p-8 my-4 sm:my-8">
                <p className="mb-0">{children}</p>
            </div>
        ),
        lesson: ({ children }: any) => (
            <div
                className="p-4 sm:p-8 my-4 sm:my-8"
                style={{
                    backgroundColor: "var(--neutral-300)",
                    borderBottom: "solid 6px var(--secondary-1)",
                    borderRadius: 10,
                    borderColor: CATEGORIESCOLORS[category || "tips"],
                }}
            >
                <Image height={75} width={75} src={lessonTeacher} alt="the teacher" style={{ objectFit: "contain", float: "left" }} className="mb-1 mr-1" />
                <span className="mb-0">{children}</span>
            </div>
        ),
    },
    marks: {
        link: ({ children, value }: any) => {
            const href = value.download ? cloudFrontDomain + value.href : value.href;
            const rel = value.href[0] !== "/" ? "noreferrer noopener" : undefined;
            const target = value.target ? "_blank" : "_self";
            return (
                <span className="flex justify-center my-8">
                    <Link className="btn-primary w-button" href={href} target={target} rel={rel} download={value.download}>
                        {value.download && <FaFileDownload className="mr-2" />}
                        {children}
                    </Link>
                </span>
            );
        },
        highlight: ({ children }: any) => (
            <span className={HEADINGSPANCOLORS[category || "tips"]} style={{ whiteSpace: "normal" }}>
                {children}
            </span>
        ),
        hightlightRed: ({ children }: any) => <span className="heading-span-secondary-4">{children}</span>,
        hightlightBlue: ({ children }: any) => (
            <span className="heading-span-secondary-2" style={{ whiteSpace: "normal" }}>
                {children}
            </span>
        ),
        hightlightYellow: ({ children }: any) => <span className="heading-span-secondary-1">{children}</span>,
        hightlightGreen: ({ children }: any) => <span className="heading-span-secondary-5">{children}</span>,
        hightlightOrange: ({ children }: any) => <span className="heading-span-secondary-6">{children}</span>,
        hightlightPurple: ({ children }: any) => <span className="heading-span-secondary-3">{children}</span>,
        left: ({ children }: any) => <p style={{ textAlign: "left" }}>{children}</p>,
        center: ({ children }: any) => <p style={{ textAlign: "center" }}>{children}</p>,
        right: ({ children }: any) => <p style={{ textAlign: "right" }}>{children}</p>,
        translationPopover: ({ children, value }: any) => {
            return <TranslationPopover contentData={children} popoverData={value.translation} />;
        },
        strong: ({ children }: any) => (
            <strong className="font-bold" style={{ color: CATEGORIESCOLORS[category || "tips"] }}>
                {children}
            </strong>
        ),
        underline: ({ children }: any) => (
            <span className="underline decoration-2 underline-offset-4" style={{ textDecorationColor: CATEGORIESCOLORS[category || "tips"] }}>
                {children}
            </span>
        ),
    },
});
