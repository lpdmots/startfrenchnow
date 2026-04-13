"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";

type FideLiteYoutubeEmbedProps = {
    id: string;
    title: string;
};

export function FideLiteYoutubeEmbed({ id, title }: FideLiteYoutubeEmbedProps) {
    return (
        <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto p-0 w-full">
            <LiteYouTubeEmbed id={id} title={title} poster="maxresdefault" announce="" />
        </div>
    );
}
