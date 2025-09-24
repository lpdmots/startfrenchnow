import { ParentToChildrens } from "@/app/components/animations/ParentToChildrens";
import PrimaryPost from "@/app/components/sfn/blog/PrimaryPost";
import SecondaryPost from "@/app/components/sfn/blog/SecondaryPost";
import { splitArrayIntoChunks } from "@/app/lib/utils";
import { FidePackSommaire } from "@/app/serverActions/productActions";
import { FlatFidePackSommaire } from "../page";
import PrimaryFidePost from "./PrimaryFidePost";
import SecondaryFidePost from "./SecondaryFidePost";
import { Locale } from "@/i18n";

type Props = {
    FlatFidePackSommaire: FlatFidePackSommaire;
    locale: string;
    hasPack: boolean;
};

function VideoList({ FlatFidePackSommaire, locale, hasPack }: Props) {
    const chunkedPosts = splitArrayIntoChunks(FlatFidePackSommaire, 3);

    return (
        <>
            {chunkedPosts.map((chunk, index) => (
                <div className="grid grid-cols-7 gap-8 mb-8" key={index}>
                    <div className={`col-span-7 lg:col-span-3 ${index % 2 === 1 ? "order-2" : ""}`}>
                        <div role="list" className="height-100 w-dyn-items">
                            <div role="listitem" className="height-100 w-dyn-item">
                                {chunk.length > 0 && (
                                    <ParentToChildrens>
                                        <PrimaryFidePost post={chunk[0]} locale={locale} hasPack={hasPack} />
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
                                        <SecondaryFidePost post={chunk[1]} locale={locale as Locale} hasPack={hasPack} />
                                    </ParentToChildrens>
                                )}
                            </div>
                            <div role="listitem" className="w-dyn-item">
                                {chunk.length > 2 && (
                                    <ParentToChildrens>
                                        <SecondaryFidePost post={chunk[2]} locale={locale as Locale} hasPack={hasPack} />
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
