import NewsletterCard from "@/app/components/common/NewsletterCard";
import { Video } from "@/app/types/video";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "../sanity/RichTextComponents";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

type Props = {
    video: Video;
};

function FreeVideo({ video }: Props) {
    return (
        <div className="page-wrapper">
            <section className="section hero v4 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---mbl center">
                        <div className="text-center">
                            <div className="inner-container _1015px center">
                                <h1 className="display-1 mg-bottom-12px">{video?.title}</h1>
                            </div>
                            <div className="inner-container _800px center">
                                <div className="inner-container _700px---tablet center">
                                    <div className="inner-container _500px---mbl center">
                                        <p className="mg-bottom-48px">{video?.description}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="cms-featured-image-wrapper image-wrapper border-radius-30px mx-auto" style={{ width: "100%", lineHeight: 0 }}>
                        <video className="image-wrapper border-radius-30px" src={cloudFrontDomain + video?.s3Key} height="auto" width="100%" controls></video>
                    </div>
                </div>
            </section>
            <section className="section pd-bottom-220px pd-top-0 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="grid-2-columns post-rigth-sidebar _1-col-tablet">
                            <div className="inner-container _758px">
                                <div className="mg-bottom-48px">
                                    <PortableText value={video?.body} components={RichTextComponents} />
                                </div>
                            </div>
                            <div id="w-node-_2efa5bda-72aa-9528-9385-590a86804244-6f543d60" className="sticky-top _48px-top">
                                <NewsletterCard />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default FreeVideo;
