import { Post } from "../../../types/sfn/blog";
import { ParentToChildrens } from "../../animations/ParentToChildrens";
import SecondaryPost from "../blog/SecondaryPost";
import PrimaryPost from "../blog/PrimaryPost";
import { splitArrayIntoChunks } from "@/app/lib/utils";

type Props = {
    posts: Post[];
    locale: string;
};

function VideoList({ posts, locale }: Props) {
    const chunkedPosts = splitArrayIntoChunks(posts, 3);

    return (
        <>
            {chunkedPosts.map((chunk, index) => (
                <div className="grid grid-cols-7 gap-8 mb-8" key={index}>
                    <div className={`col-span-7 lg:col-span-3 ${index % 2 === 1 ? "order-2" : ""}`}>
                        <div role="list" className="height-100 w-dyn-items">
                            <div role="listitem" className="height-100 w-dyn-item">
                                {chunk.length > 0 && (
                                    <ParentToChildrens>
                                        <PrimaryPost post={chunk[0]} locale={locale} />
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
                                        <SecondaryPost post={chunk[1]} locale={locale} />
                                    </ParentToChildrens>
                                )}
                            </div>
                            <div role="listitem" className="w-dyn-item">
                                {chunk.length > 2 && (
                                    <ParentToChildrens>
                                        <SecondaryPost post={chunk[2]} locale={locale} />
                                    </ParentToChildrens>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}

export default VideoList;
