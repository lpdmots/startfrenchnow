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
};

function VideoList({ filteredPackSommaire, locale, hasPack }: Props) {
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

/* function PrimaryFidePostSkeleton() {
    return (
        <div className="relative blog-card-wrapper card link-card w-inline-block overflow-hidden aria-busy" aria-busy="true" aria-label="Chargement">
            
            <div className="blog-card-image-wrapper inside-card" style={{ minHeight: 150 }}>
                <div className="w-full h-[220px] sm:h-[260px] rounded-2xl sm:rounded-3xl bg-neutral-300 animate-pulse" />
              
                <div className="blog-card-badge-wrapper-top text-right pointer-events-none">
                    <div className="inline-block h-6 w-24 rounded-full bg-neutral-300 animate-pulse mt-2" />
                </div>
            </div>

            
            <div className="blog-card-content-inside">
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
        <div className="relative card blog-secondary-card link-card w-inline-block !p-4 !sm:p-8 overflow-hidden aria-busy" aria-busy="true" aria-label="Chargement">
            
            <div className="blog-card-image-wrapper inside-card blog-secondary-card-image flex flex-col gap-4 h-full" style={{ maxHeight: "none", overflow: "visible" }}>
                <div className="rounded-2xl sm:rounded-3xl overflow-hidden">
                    <div className="w-full h-[150px] sm:h-[200px] rounded-2xl sm:rounded-3xl bg-neutral-300 animate-pulse" />
                </div>

                <div>
                    <div className="inline-block h-6 w-20 rounded-full bg-neutral-300 animate-pulse" />
                </div>
            </div>

            
            <div className="inner-container blog-secondary-card-content flex flex-col justify-between" style={{ minHeight: 200 }}>
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
