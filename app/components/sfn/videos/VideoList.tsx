import { intelRich } from "@/app/lib/intelRich";
import { useTranslations } from "next-intl";
import { Post } from "../../../types/sfn/blog";
import { ParentToChildrens } from "../../animations/ParentToChildrens";
import SecondaryPost from "../blog/SecondaryPost";
import PrimaryPost from "../blog/PrimaryPost";
import { splitArrayIntoChunks } from "@/app/lib/utils";

type Props = {
    posts: Post[];
    postLang: "en" | "fr";
    reversed?: boolean;
};

function VideoList({ posts, postLang, reversed = false }: Props) {
    const t = useTranslations("Videos.VideoList");
    const chunkedPosts = splitArrayIntoChunks(posts, 3);

    return (
        <div className="section hero v3 wf-section">
            <div className="container-default w-container">
                <div className="inner-container _600px---tablet center">
                    <div className="inner-container _500px---mbl center mb-8">
                        <div className="inner-container _725px center---full-width-mbl">
                            <div className="text-center mg-bottom-40px">
                                <h1 className="display-1 mg-bottom-8px mb-8">{t.rich("title", intelRich())}</h1>
                                <p className="mg-bottom-0">{t.rich("description", intelRich())}</p>
                            </div>
                        </div>
                        {chunkedPosts.map((chunk, index) => (
                            <div className="grid grid-cols-7 gap-8 mb-8" key={index}>
                                <div className={`col-span-7 lg:col-span-3 ${index % 2 === 1 ? "order-2" : ""}`}>
                                    <div role="list" className="height-100 w-dyn-items">
                                        <div role="listitem" className="height-100 w-dyn-item">
                                            {chunk.length > 0 && (
                                                <ParentToChildrens>
                                                    <PrimaryPost post={chunk[0]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-7 lg:col-span-4">
                                    <div role="list" className="grid-1-column gap-32px w-dyn-items">
                                        <div role="listitem" className="w-dyn-item">
                                            {chunk.length > 1 && (
                                                <ParentToChildrens>
                                                    <SecondaryPost post={chunk[1]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                        <div role="listitem" className="w-dyn-item">
                                            {chunk.length > 2 && (
                                                <ParentToChildrens>
                                                    <SecondaryPost post={chunk[2]} postLang={postLang} />
                                                </ParentToChildrens>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoList;
