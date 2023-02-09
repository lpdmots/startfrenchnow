import { defineType, defineArrayMember } from "sanity";
import { FaHighlighter } from "react-icons/fa";
import { AiOutlineAlignCenter, AiOutlineAlignLeft, AiOutlineAlignRight } from "react-icons/ai";

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
                { title: "Quote", value: "blockquote" },
                { title: "Hidden", value: "hidden" },
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
                    { title: "Gauche", value: "left", icon: () => <AiOutlineAlignLeft />, component: AlignLeft },
                    { title: "Centrer", value: "center", icon: () => <AiOutlineAlignCenter />, component: AlignCenter },
                    { title: "Droite", value: "right", icon: () => <AiOutlineAlignRight />, component: AlignRight },
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
                                type: "url",
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
            options: { hotspot: true },
        }),
    ],
});
