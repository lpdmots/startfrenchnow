import { defineField } from "sanity";
import getYouTubeId from "get-youtube-id";
import VideoBlog from "@/app/components/sanity/RichTextSfnComponents/VideoBlog";

const Preview = (props: any) => {
    const { url, title, renderDefault } = props;
    if (!url) {
        return <div>Missing YouTube URL</div>;
    }
    const id = getYouTubeId(url);
    return (
        <div>
            {renderDefault({ ...props, title: title })}
            <VideoBlog values={{ url, title }} />
        </div>
    );
};

const videoBlog = {
    name: "videoBlog",
    title: "Vidéo blog",
    type: "object",
    fields: [
        defineField({
            name: "title",
            title: "Titre",
            type: "string",
        }),
        defineField({
            name: "url",
            title: "URL Youtube ou s3Key",
            type: "string",
        }),
        defineField({
            name: "subtitleFr",
            title: "Sous-titre (Français)",
            type: "string",
        }),
        defineField({
            name: "subtitleEn",
            title: "Sous-titre (Anglais)",
            type: "string",
        }),
    ],
    preview: {
        select: {
            url: "url",
            title: "title",
        },
    },
    components: {
        preview: Preview,
    },
};

export default videoBlog;
