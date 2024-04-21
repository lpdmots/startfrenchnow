import { defineType, defineArrayMember } from "sanity";
import { FaFileDownload, FaHighlighter } from "react-icons/fa";
import { AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight, AiOutlineSound } from "react-icons/ai";
import { MdTranslate } from "react-icons/md";
import { FcIdea } from "react-icons/fc";
import { RiDoubleQuotesL, RiDoubleQuotesR } from "react-icons/ri";
import Image from "next/image";
import lessonTeacher from "@/public/images/lesson-teacher.png";

const highligthIcon = (color?: string) => {
    return <FaHighlighter style={{ color: color || "var(--neutral-600)" }} />;
};

const HighlightDecorator = (props: any) => <span style={{ backgroundColor: "var(--neutral-300)" }}>{props.children}</span>;
const HighlightDecoratorRed = (props: any) => <span style={{ backgroundColor: "red" }}>{props.children}</span>;
const HighlightDecoratorBlue = (props: any) => <span style={{ backgroundColor: "blue" }}>{props.children}</span>;
const HighlightDecoratorOrange = (props: any) => <span style={{ backgroundColor: "orange" }}>{props.children}</span>;
const HighlightDecoratorYellow = (props: any) => <span style={{ backgroundColor: "yellow" }}>{props.children}</span>;
const HighlightDecoratorPurple = (props: any) => <span style={{ backgroundColor: "purple" }}>{props.children}</span>;
const HighlightDecoratorGreen = (props: any) => <span style={{ backgroundColor: "green" }}>{props.children}</span>;
const AlignLeft = (props: any) => <p style={{ textAlign: "center" }}>{props.children}</p>;
const AlignCenter = (props: any) => <p style={{ textAlign: "center" }}>{props.children}</p>;
const AlignRight = (props: any) => <p style={{ textAlign: "right" }}>{props.children}</p>;
const HelpBlock = (props: any) => (
    <div className="help pl-8 md:pl-12" style={{ borderLeft: "solid 8px var(--neutral-600)" }}>
        <p className="italic">{props.children}</p>
    </div>
);
const Funfact = (props: any) => (
    <div className="flex flex-col items-center my-8">
        <div className="w-full bg-neutral-600 mb-4" style={{ height: 1 }}></div>
        <div className="flex items-center justify-center">
            <div className="px-4 sm:px-8">
                <FcIdea className="text-3xl sm:text-4xl" />
            </div>
            <div>
                <p className="font-bold mb-0">Le saviez-vous ?</p>
                <p>{props.children}</p>
            </div>
        </div>
        <div className="w-full bg-neutral-600" style={{ height: 1 }}></div>
    </div>
);
const Blockquote = (props: any) => (
    <blockquote className="sm:p-4 mx-0 sm:mx-6 md:mx-12">
        <div className="flex w-full">
            <RiDoubleQuotesL className="text-5xl text-neutral-600" />
        </div>
        <p className="mb-0 bl font-bold px-6 sm:px-12 text-justify text-neutral-600">{props.children}</p>
        <div className="flex w-full justify-end">
            <RiDoubleQuotesR className="text-5xl text-neutral-600" />
        </div>
    </blockquote>
);
const Exemple = (props: any) => (
    <div className="pl-8 md:pl-12 bg-neutral-300" style={{ borderLeft: "solid 8px var(--neutral-600)" }}>
        <p className="italic">{props.children}</p>
    </div>
);
const Extract = ({ children }: any) => (
    <div className="card p-4 sm:p-8">
        <p className="mb-0">{children}</p>
    </div>
);
const Lesson = ({ children }: any) => (
    <div className="card p-4 sm:p-8 shadow-1 bg-neutral-300">
        <Image height={75} width={75} src={lessonTeacher} alt="the teacher" style={{ objectFit: "contain", float: "left" }} className="mb-1 mr-1" />
        <span className="mb-0">{children}</span>
    </div>
);

export default defineType({
    title: "Block Content",
    name: "blockContent",
    type: "array",
    of: [
        defineArrayMember({
            title: "Block",
            type: "block",
            // Styles let you set what your user can mark up blocks with. These
            // correspond with HTML tags, but you can set any title or value
            // you want and decide how you want to deal with it where you want to
            // use your content.
            styles: [
                { title: "Normal", value: "normal" },
                { title: "H1", value: "h1" },
                { title: "H2", value: "h2" },
                { title: "H3", value: "h3" },
                { title: "H4", value: "h4" },
                { title: "Quote", value: "blockquote", component: Blockquote },
                { title: "Help", value: "help", component: HelpBlock },
                { title: "Funfact", value: "funfact", component: Funfact },
                { title: "Exemple", value: "exemple", component: Exemple },
                { title: "Extrait", value: "extract", component: Extract },
                { title: "Leçon", value: "lesson", component: Lesson },
            ],
            lists: [{ title: "Bullet", value: "bullet" }],
            // Marks let you mark up inline text in the block editor.
            marks: {
                // Decorators usually describe a single property – e.g. a typographic
                // preference or highlighting by editors.
                decorators: [
                    { title: "Strong", value: "strong" },
                    { title: "Emphasis", value: "em" },
                    { title: "Underline", value: "underline" },
                    { title: "Highlight", value: "highlight", icon: highligthIcon(), component: HighlightDecorator },
                    { title: "Highlight Red", value: "hightlightRed", icon: highligthIcon("red"), component: HighlightDecoratorRed },
                    { title: "Highlight Blue", value: "hightlightBlue", icon: highligthIcon("blue"), component: HighlightDecoratorBlue },
                    { title: "Highlight Orange", value: "hightlightOrange", icon: highligthIcon("orange"), component: HighlightDecoratorOrange },
                    { title: "Highlight Yellow", value: "hightlightYellow", icon: highligthIcon("yellow"), component: HighlightDecoratorYellow },
                    { title: "Highlight Purple", value: "hightlightPurple", icon: highligthIcon("purple"), component: HighlightDecoratorPurple },
                    { title: "Highlight Green", value: "hightlightGreen", icon: highligthIcon("green"), component: HighlightDecoratorGreen },
                    { title: "Left", value: "left", icon: () => <AiOutlineAlignLeft />, component: AlignLeft },
                    { title: "Center", value: "center", icon: () => <AiOutlineAlignCenter />, component: AlignCenter },
                    { title: "Right", value: "right", icon: () => <AiOutlineAlignRight />, component: AlignRight },
                ],
                // Annotations can be any object structure – e.g. a link or a footnote.
                annotations: [
                    {
                        title: "URL",
                        name: "link",
                        type: "object",
                        fields: [
                            {
                                title: "URL",
                                name: "href",
                                type: "string",
                            },
                            {
                                title: "New tab",
                                name: "target",
                                type: "boolean",
                                initialValue: true,
                            },
                            {
                                title: "Download",
                                name: "download",
                                type: "boolean",
                                initialValue: false,
                            },
                            {
                                title: "Span",
                                name: "isSpan",
                                type: "boolean",
                                initialValue: false,
                            },
                        ],
                    },
                    {
                        title: "Traduction",
                        name: "translationPopover",
                        type: "object",
                        icon: () => <MdTranslate />,
                        fields: [
                            {
                                title: "Français",
                                name: "french",
                                type: "string",
                            },
                            {
                                title: "Anglais",
                                name: "english",
                                type: "string",
                            },
                            {
                                title: "VocabItem",
                                name: "vocabItemId",
                                type: "reference",
                                to: [{ type: "vocabItem" }],
                            },
                        ],
                    },
                    {
                        title: "Sound",
                        name: "sound",
                        type: "object",
                        icon: () => <AiOutlineSound />,
                        fields: [
                            {
                                title: "VocabItem",
                                name: "vocabItem",
                                type: "reference",
                                to: [{ type: "vocabItem" }],
                            },
                            {
                                title: "Phonétique",
                                name: "phonetics",
                                type: "string",
                            },
                        ],
                    },
                ],
            },
        }),
        // You can add additional types here. Note that you can't use
        // primitive types such as 'string' and 'number' in the same array
        // as a block type.
        defineArrayMember({
            type: "image",
            options: { hotspot: true },
        }),
        defineArrayMember({
            type: "videoBlog",
        }),
        defineArrayMember({
            type: "tabelVoc",
        }),
        defineArrayMember({
            type: "flashcards",
        }),
        defineArrayMember({
            title: "Exercice",
            name: "exercise",
            type: "reference",
            to: [{ type: "exercise" }],
        }),
    ],
});
