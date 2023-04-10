import { defineType, defineArrayMember } from "sanity";
import { FaHighlighter } from "react-icons/fa";
import { AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight } from "react-icons/ai";
import { MdTranslate } from "react-icons/md";
import { BsCaretRightFill } from "react-icons/bs";

/**
 * This is the schema definition for the rich text fields used for
 * for this blog studio. When you import it in schemas.js it can be
 * reused in other parts of the studio with:
 *  {
 *    name: 'someName',
 *    title: 'Some title',
 *    type: 'blockContent'
 *  }
 */

const hightLigthIcon = (color: string) => {
    return <FaHighlighter style={{ color }} />;
};

const HighlightDecoratorRed = (props: any) => <span style={{ backgroundColor: "red" }}>{props.children}</span>;
const HighlightDecoratorBlue = (props: any) => <span style={{ backgroundColor: "blue" }}>{props.children}</span>;
const HighlightDecoratorOrange = (props: any) => <span style={{ backgroundColor: "orange" }}>{props.children}</span>;
const AlignLeft = (props: any) => <p style={{ textAlign: "center" }}>{props.children}</p>;
const AlignCenter = (props: any) => <p style={{ textAlign: "center" }}>{props.children}</p>;
const AlignRight = (props: any) => <p style={{ textAlign: "right" }}>{props.children}</p>;
const TranslationBlock = (props: any) => (
    <div className="translation pl-8 md:pl-12" style={{ borderLeft: "solid 8px var(--neutral-600)" }}>
        <p className="italic">{props.children}</p>
    </div>
);
const InlineTranslation = (props: any) => {
    return (
        <span className="translation italic underline ml-1">
            <BsCaretRightFill style={{ color: "var(--neutral-600)", marginRight: 2 }} />
            {props.children}
        </span>
    );
};

export default defineType({
    title: "Story Content",
    name: "storyContent",
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
                { title: "Title", value: "h3" },
                { title: "Translation", value: "translation", component: TranslationBlock },
            ],
            lists: [{ title: "Bullet", value: "bullet" }],
            // Marks let you mark up inline text in the block editor.
            marks: {
                // Decorators usually describe a single property – e.g. a typographic
                // preference or highlighting by editors.
                decorators: [
                    { title: "Strong", value: "strong" },
                    { title: "Emphasis", value: "em" },
                    { title: "Hightlight Red", value: "hightlightRed", icon: hightLigthIcon("red"), component: HighlightDecoratorRed },
                    { title: "Hightlight Blue", value: "hightlightBlue", icon: hightLigthIcon("blue"), component: HighlightDecoratorBlue },
                    { title: "Hightlight Orange", value: "hightlightOrange", icon: hightLigthIcon("orange"), component: HighlightDecoratorOrange },
                    { title: "Left", value: "left", icon: () => <AiOutlineAlignLeft />, component: AlignLeft },
                    { title: "Center", value: "center", icon: () => <AiOutlineAlignCenter />, component: AlignCenter },
                    { title: "Right", value: "right", icon: () => <AiOutlineAlignRight />, component: AlignRight },
                    { title: "Inline translation", value: "inlineTranslation", icon: () => <MdTranslate />, component: InlineTranslation },
                ],
            },
        }),
    ],
});
