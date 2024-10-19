"use client";
import { ParentToChildrens, ScaleChildren, TranslateRightChildren } from "@/app/components/animations/ParentToChildrens";
import { motion } from "framer-motion";
import Link from "next-intl/link";
import Image from "next/image";
import React from "react";

export const FideCourseCard = ({ description }: { description: string }) => {
    return (
        <Link href="/courses/intermediates" className="no-underline w-full sm:w-auto cursor-pointer">
            <ParentToChildrens>
                <div className="flex flex-col gap-4 w-full card link-card overflow-hidden group">
                    <ScaleChildren scale={1.03}>
                        <Image src="/images/cours2.jpg" alt="Daily Life Dialogues" width={500} height={500} className="w-full h-auto contain" />
                    </ScaleChildren>
                    <ScaleChildren scale={0.99}>
                        <p className="p-4">{description}</p>
                    </ScaleChildren>
                </div>
            </ParentToChildrens>
        </Link>
    );
};
