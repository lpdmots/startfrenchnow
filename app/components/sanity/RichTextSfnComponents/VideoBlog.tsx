"use client";
import getYouTubeId from "get-youtube-id";
import LiteYouTubeEmbed from "react-lite-youtube-embed";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

const VideoBlog = (props: any) => {
    const { url, title, className } = props.values;

    if (!url) {
        return <div>Missing YouTube URL</div>;
    }

    if (!url.startsWith("http")) {
        return (
            <div className={className ?? "my-12"}>
                <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto" style={{ width: "100%", lineHeight: 0 }}>
                    <video className="image-wrapper border-radius-30px" src={cloudFrontDomain + url} height="auto" width="100%" controls></video>
                </div>
                {title && <p className="display-4 w-full text-center pt-6 mb-0">{title}</p>}
            </div>
        );
    }

    const id = getYouTubeId(url);
    return (
        <div className={className ?? "my-12"}>
            <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto">
                <LiteYouTubeEmbed id={id || ""} title={title} poster="maxresdefault" />
            </div>
            {title && <p className="display-4 w-full text-center pt-6 mb-0">{title}</p>}
        </div>
    );
};

export default VideoBlog;
