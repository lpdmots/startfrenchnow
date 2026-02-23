import { ParentToChildrens, RotateChildren, ScaleChildren, TranslateRightChildren } from "@/app/components/animations/ParentToChildrens";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/app/lib/schadcn-utils";
import clsx from "clsx";
import Link from "next-intl/link";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaAngleRight, FaCheck } from "react-icons/fa";
import { BookFirstMeeting, BookReservation } from "./BookFirstMeeting";
import { useSession } from "next-auth/react";

interface CardProps {
    card: {
        title: string;
        description: JSX.Element;
        price: string;
        priceContent?: React.ReactNode;
        features: string[];
        extras: string[];
        color: string;
        labelCTA: string;
        checkoutUrl: string;
    };
    hasPack?: boolean;
    bookReservation?: boolean;
    setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PriceCard = ({ card, hasPack, bookReservation = false, setIsOpen }: CardProps) => {
    const { title, description, price, priceContent, features, extras, color, labelCTA, checkoutUrl } = card;
    const bgColor = `bg-${color}`;
    const textColor = `text-${color}`;
    const { data: session } = useSession();
    const [hasReservation, setHasReservation] = useState(false);

    useEffect(() => {
        if (session?.user?.lessons) {
            const reservation = session.user.lessons.some((lesson) => lesson.eventType === "Fide Preparation Class" && lesson.totalPurchasedMinutes > 0);
            setHasReservation(reservation);
        }
    }, [session]);

    return (
        <ParentToChildrens>
            <div className="w-full flex justify-center h-full max-w-96">
                <div className="card link-card flex flex-col h-full w-full relative overflow-hidden">
                    <ScaleChildren scale={1.05} duration={0}>
                        <div className={cn("image-wrapper-card-top p-2 flex justify-center rounded-sm", "bg-neutral-300")}>
                            <div className="flex gap-4 justify-center items-center w-full">
                                <p className={cn("mb-0 text-neutral-800 text-3xl font-bold underline", `decoration-${color}`)}>{title}</p>
                            </div>
                        </div>
                    </ScaleChildren>
                    <div className="bs p-4 flex flex-col space-between">{description}</div>
                    <RotateChildren rotation={4}>
                        <div className={cn("p-4 flex justify-center items-center -mx-12", bgColor)} style={{ transform: "rotate(-4deg)" }}>
                            {priceContent ? <div className="w-full text-center text-neutral-100">{priceContent}</div> : <p className="text-4xl text-neutral-100 font-bold mb-0">{price}</p>}
                        </div>
                    </RotateChildren>
                    <div className="flex flex-col grow min-h-72">
                        <div
                            className="p-4 flex flex-col gap-2 grow justify-center
                        py-8"
                        >
                            {features.map((feature, index) => (
                                <React.Fragment key={index}>
                                    <div className="grid grid-cols-9 gap-2">
                                        <FaCheck className={cn("text-xl col-span-1", textColor)} />
                                        <p className="text-neutral-800 col-span-8 mb-0 text-sm">{feature}</p>
                                    </div>
                                    {index !== features.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex w-full justify-center p-4 pt-0">
                            {bookReservation ? (
                                <BookReservation label={labelCTA} hasPack={false} openFreeHours={setIsOpen} />
                            ) : (
                                <Link
                                    href={hasPack ? "#" : checkoutUrl}
                                    style={{ ["--hover-color" as any]: `var(--${color})` }}
                                    className={clsx(
                                        "btn btn-primary small w-full text-center",
                                        hasPack && "pointer-events-none opacity-60 cursor-not-allowed",
                                        `hover:bg-[var(--hover-color)] border-${color} hover:!border-[var(--hover-color)]`
                                    )}
                                    aria-disabled={hasPack}
                                >
                                    {hasPack ? "VOUS DISPOSEZ DÉJÀ DU PACK" : labelCTA}
                                </Link>
                            )}
                        </div>
                        <div className={cn("p-4 flex flex-col gap-2", "bg-neutral-300")}>
                            {extras.map((extra, index) => (
                                <div className="flex gap-2" key={index}>
                                    <TranslateRightChildren className="max-h-6" duration={0.2}>
                                        <FaAngleRight className="text-2xl min-w-6" />
                                    </TranslateRightChildren>
                                    <p className="mb-0 text-sm">{extra}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ParentToChildrens>
    );
};
