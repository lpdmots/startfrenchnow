import { Conditions } from "./RichTextStoryComponents/Conditions";
import { Count } from "./RichTextStoryComponents/Count";
import { GenderWord } from "./RichTextStoryComponents/GenderWord";
import { Translation } from "./RichTextStoryComponents/Translation";

export const RichTextStory = (isSpan: boolean = false) => ({
    list: {
        bullet: ({ children }: any) => <ul className="ml-4 sm:ml-10 py-5 list-disc space-y-5">{children}</ul>,
        number: ({ children }: any) => <ol className="mt-lg list-decimal">{children}</ol>,
    },
    block: (props: any) => {
        if (props.node.style === "normal" && isSpan) {
            // Rendre le contenu du bloc à l'intérieur d'une balise <span>
            return <span>{props.children}</span>;
        }
        if (props.node.style === "title") {
            // Rendre le contenu du bloc à l'intérieur d'une balise <span>
            return <h3 className="display-3">{props.children}</h3>;
        }
        return <p>{props.children}</p>;
    },
    marks: {
        translation: ({ children, value }: any) => {
            return <Translation contentData={children} popoverData={value.translation} />;
        },
        gender: ({ children, value }: any) => {
            return <GenderWord male={children} female={value.female} />;
        },
        withConditions: ({ children, value }: any) => {
            return <Conditions value={value} />;
        },
        count: ({ children, value }: any) => {
            return <Count value={value} />;
        },
    },
});
