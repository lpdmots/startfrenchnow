import { getSubscriberFromServer } from "@/app/lib/apiNavigation";
import { client } from "@/app/lib/sanity.client";
import { groq } from "next-sanity";
import NewsletterCard from "@/app/components/common/newsletter/NewsletterCard";
import { PortableText } from "@portabletext/react";
import { RichTextComponents } from "@/app/components/sanity/RichTextComponents";

const cloudFrontDomain = process.env.NEXT_PUBLIC_CLOUD_FRONT_DOMAIN_NAME;

const queryVideo = groq`
    *[_type=='video' && slug.current == $slug][0]
`;

async function FreeVideo(props: { params: Promise<{ data: string[] }> }) {
    const params = await props.params;

    const {
        data
    } = params;

    const video = await client.fetch(queryVideo, { slug: data[0] });
    const { subscriber } = await getSubscriberFromServer(data[1]);
    //console.log({ subscriber, video });
    if (!subscriber?.data?.id || !video) return <p className="w-full text-center py-12">Sorry, page not found</p>;

    return (
        <div className="page-wrapper">
            <section className="section hero pt-[53px] pb-[113px] max-[991px]:pb-[94px] max-[767px]:pb-[78px] max-[479px]:pt-[50px] max-[479px]:pb-[65px] wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---mbl center">
                        <div className="text-center">
                            <div className="inner-container max-w-[1015px] max-[991px]:max-w-full center">
                                <h1 className="display-1 mg-bottom-12px">{video?.title}</h1>
                            </div>
                            <div className="inner-container max-w-[800px] max-[991px]:max-w-full center">
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
            <section className="section pb-[220px] max-[991px]:pb-[183px] max-[767px]:pb-[153px] max-[479px]:pb-[128px] pd-top-0 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="grid-2-columns post-rigth-sidebar _1-col-tablet">
                            <div className="inner-container max-w-[758px]">
                                <div className="mg-bottom-48px">
                                    <PortableText value={video?.body} components={RichTextComponents()} />
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
