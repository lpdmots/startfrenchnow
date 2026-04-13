// components/fide/VideoList.tsx
"use client";

import { ParentToChildrens } from "@/app/components/animations/ParentToChildrens";
import { splitArrayIntoChunks } from "@/app/lib/utils";
import { FlatFidePackSommaire } from "../page";
import PrimaryFidePost from "./PrimaryFidePost";
import SecondaryFidePost from "./SecondaryFidePost";
import { Locale } from "@/i18n";

type Props = {
    filteredPackSommaire: FlatFidePackSommaire;
    locale: string;
    hasPack: boolean;
    hidePackageBadge?: boolean;
};

function VideoList({ filteredPackSommaire, locale, hasPack, hidePackageBadge = false }: Props) {
    const chunkedPosts = splitArrayIntoChunks(filteredPackSommaire, 3);

    return (
        <>
            {chunkedPosts.map((chunk, index) => (
                <div className="grid grid-cols-7 gap-8 mb-8" key={index}>
                    <div className={`col-span-7 lg:col-span-3 ${index % 2 === 1 ? "order-2" : ""}`}>
                        <div role="list" className="height-100 w-dyn-items">
                            <div role="listitem" className="height-100 w-dyn-item">
                                {chunk.length > 0 && (
                                    <ParentToChildrens>
                                        <PrimaryFidePost post={chunk[0]} locale={locale} hasPack={hasPack} hidePackageBadge={hidePackageBadge} />
                                    </ParentToChildrens>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-7 lg:col-span-4">
                        <div role="list" className="grid-1-column gap-x-[32px] gap-y-[32px] w-dyn-items">
                            <div role="listitem" className="w-dyn-item">
                                {chunk.length > 1 && (
                                    <ParentToChildrens>
                                        <SecondaryFidePost post={chunk[1]} locale={locale as Locale} hasPack={hasPack} hidePackageBadge={hidePackageBadge} />
                                    </ParentToChildrens>
                                )}
                            </div>
                            <div role="listitem" className="w-dyn-item">
                                {chunk.length > 2 && (
                                    <ParentToChildrens>
                                        <SecondaryFidePost post={chunk[2]} locale={locale as Locale} hasPack={hasPack} hidePackageBadge={hidePackageBadge} />
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

/* function PrimaryFidePostSkeleton() {
    return (
        <div className="relative max-w-[1010px] ml-auto text-[var(--neutral-600)] no-underline flex h-full p-[30px_30px_40px] flex-col rounded-[32px] max-h-[none] p-[28px_28px_54px] max-[991px]:w-full max-[991px]:max-h-[none] max-[991px]:pr-[24px] max-[991px]:pb-[45px] max-[991px]:pl-[24px] max-[767px]:pt-[24px] max-[767px]:pr-[24px] max-[767px]:pl-[24px] max-[479px]:rounded-[24px] card link-card w-inline-block overflow-hidden aria-busy" aria-busy="true" aria-label="Chargement">
            
            <div className="blog-card-image-wrapper inside-card" style={{ minHeight: 150 }}>
                <div className="w-full h-[220px] sm:h-[260px] rounded-2xl sm:rounded-3xl bg-neutral-300 animate-pulse" />
              
                <div className="absolute left-auto top-[20px] right-[20px] bottom-auto text-right pointer-events-none">
                    <div className="inline-block h-6 w-24 rounded-full bg-neutral-300 animate-pulse mt-2" />
                </div>
            </div>

            
            <div className="flex p-[40px_0px_0px] flex-col [flex:1_1] max-[479px]:p-[24px_0px_0px]">
                <div className="inner-container _350px---mbl flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-md bg-neutral-300 animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-6 w-3/4 rounded-md bg-neutral-300 animate-pulse" />
                        <div className="h-4 w-1/2 rounded-md bg-neutral-300 animate-pulse" />
                    </div>
                </div>

                <div className="space-y-2 mt-3">
                    <div className="h-4 w-full rounded-md bg-neutral-300 animate-pulse" />
                    <div className="h-4 w-11/12 rounded-md bg-neutral-300 animate-pulse" />
                    <div className="h-4 w-10/12 rounded-md bg-neutral-300 animate-pulse" />
                    <div className="h-4 w-9/12 rounded-md bg-neutral-300 animate-pulse" />
                </div>

               
                <div className="flex justify-end items-center gap-2 flex-wrap mt-4">
                    <div className="h-5 w-16 rounded-md bg-neutral-300 animate-pulse" />
                    <div className="h-5 w-24 rounded-md bg-neutral-300 animate-pulse" />
                    <div className="h-5 w-20 rounded-md bg-neutral-300 animate-pulse" />
                    <div className="h-5 w-28 rounded-md bg-neutral-300 animate-pulse" />
                </div>
            </div>
        </div>
    );
}

function SecondaryFidePostSkeleton() {
    return (
        <div className="relative card flex p-[30px] items-center gap-x-[28px] gap-y-[28px] max-[767px]:pt-[24px] max-[767px]:pr-[24px] max-[767px]:pl-[24px] max-[767px]:flex-col max-[767px]:items-stretch link-card w-inline-block !p-4 !sm:p-8 overflow-hidden aria-busy" aria-busy="true" aria-label="Chargement">
            
            <div className="blog-card-image-wrapper inside-card flex max-h-[242px] max-w-[274px] justify-center items-center self-start [flex:1_1] max-[991px]:max-w-[222px] max-[767px]:max-h-[none] max-[767px]:max-w-[199%] flex flex-col gap-4 h-full" style={{ maxHeight: "none", overflow: "visible" }}>
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden">
                    <div className="w-full h-[150px] sm:h-[200px] rounded-2xl sm:rounded-3xl bg-neutral-300 animate-pulse" />
                </div>

                <div>
                    <div className="inline-block h-6 w-20 rounded-full bg-neutral-300 animate-pulse" />
                </div>
            </div>

            
            <div className="inner-container min-w-[205px] [flex:1_1] max-[767px]:min-w-auto flex flex-col justify-between" style={{ minHeight: 200 }}>
                <div>
                    <div className="flex gap-2 items-center mb-2">
                        <div className="h-8 w-8 rounded-md bg-neutral-300 animate-pulse mt-0.5 shrink-0" />
                        <div className="h-5 w-4/5 rounded-md bg-neutral-300 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-full rounded-md bg-neutral-300 animate-pulse" />
                        <div className="h-4 w-11/12 rounded-md bg-neutral-300 animate-pulse" />
                        <div className="h-4 w-10/12 rounded-md bg-neutral-300 animate-pulse" />
                    </div>
                </div>

                
                <div className="flex justify-end items-center gap-2 flex-wrap mt-4">
                    <div className="h-5 w-14 rounded-md bg-neutral-300 animate-pulse" />
                    <div className="h-5 w-20 rounded-md bg-neutral-300 animate-pulse" />
                    <div className="h-5 w-16 rounded-md bg-neutral-300 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
 */
