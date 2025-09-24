import { ParentToChildrens, RotateChildren, ScaleChildren, TranslateRightChildren } from "@/app/components/animations/ParentToChildrens";
import { Separator } from "@/app/components/ui/separator";
import { cn } from "@/app/lib/schadcn-utils";
import clsx from "clsx";
import Link from "next-intl/link";
import Image from "next/image";
import React from "react";
import { FaAngleRight, FaCheck } from "react-icons/fa";

interface CardProps {
    card: {
        image: string;
        title: string;
        subtitle: string;
        description: JSX.Element;
        price: number;
        features: string[];
        extras: string[];
        color: string;
        labelCTA: string;
        slugString: string;
    };
    hasPack?: boolean;
}

export const PriceCard = ({ card, hasPack }: CardProps) => {
    const { image, title, subtitle, description, price, features, extras, color, labelCTA, slugString } = card;
    const bgColor = `bg-${color}`;
    const textColor = `text-${color}`;

    return (
        <ParentToChildrens>
            <div className="w-full flex justify-center h-full max-w-96">
                <div className="card link-card flex flex-col h-full w-full relative overflow-hidden">
                    <ScaleChildren scale={1.05} duration={0}>
                        <div className={cn("image-wrapper-card-top p-2 flex justify-center rounded-sm", "bg-neutral-300")}>
                            <div className="grid grid-cols-3">
                                <div className="col-span-1 flex items-center justify-center w-full h-full">
                                    <Image className="h-16 w-16 object-contain" src={image} alt={"image du cours"} height={80} width={80} />
                                </div>
                                <div className="col-span-2">
                                    <p className="mb-0 text-neutral-800 text-3xl font-bold">{title}</p>
                                    <p className="mb-0 text-neutral-800 text-3xl font-bold">{subtitle}</p>
                                </div>
                            </div>
                        </div>
                    </ScaleChildren>
                    <div className="bs p-4 flex flex-col space-between">{description}</div>
                    <RotateChildren rotation={4}>
                        <div className={cn("p-4 flex justify-center items-center -mx-12", bgColor)} style={{ transform: "rotate(-4deg)" }}>
                            <p className="text-4xl text-neutral-100 font-bold mb-0">{price} CHF</p>
                        </div>
                    </RotateChildren>
                    <div className="flex flex-col grow min-h-72">
                        <div className="p-4 flex flex-col gap-2 grow justify-center">
                            {features.map((feature, index) => (
                                <React.Fragment key={index}>
                                    <div className="grid grid-cols-6 gap-2">
                                        <FaCheck className={cn("text-xl col-span-1", textColor)} />
                                        <p className="text-neutral-800 col-span-5 mb-0 text-sm">{feature}</p>
                                    </div>
                                    {index !== features.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex w-full justify-center p-4 pt-0">
                            <Link
                                href={
                                    hasPack
                                        ? "#" // n'ira nulle part
                                        : `/checkout/${slugString}?quantity=1&callbackUrl=${encodeURIComponent("/fide/pack-fide#plans")}`
                                }
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

const freePlan = {
    image: "📺",
    title: "Découverte",
    subtitle: "Gratuite",
    description: <p>Testez la méthode sans engagement grâce aux vidéos et examens d’essai.</p>,
    price: "0 CHF",
    features: ["Vidéos gratuites (Réseaux & blog)", "Aperçus gratuits (A1 • A2 • B1)", "Quelques examens d’essai"],
    extras: ["Sans suivi ni statistiques"],
    color: "neutral-300",
};

export const FreeCard = () => {
    const { image, title, subtitle, description, features, extras, color } = freePlan;
    const bgColor = `bg-${color}`;

    return (
        <ParentToChildrens>
            <div className="w-full flex justify-center rounded-2xl overflow-hidden border-2 border-solid border-neutral-300 max-w-96">
                <div className="flex flex-col h-full w-full relative overflow-hidden text-neutral-700">
                    <ScaleChildren scale={1.05} duration={0}>
                        <div className={cn("image-wrapper-card-top p-2 flex justify-center rounded-sm", bgColor)} style={{ height: 88 }}>
                            <div className="flex flex-col">
                                <div className="flex justify-center items-center w-full gap-2">
                                    <p className="mb-0 text-neutral-700 text-2xl font-bold">{title}</p>
                                </div>
                                <p className="mb-0 text-neutral-700 text-2xl font-bold w-full text-center">{subtitle}</p>
                            </div>
                        </div>
                    </ScaleChildren>
                    <div className="p-4 flex flex-col space-between grow bs">{description}</div>
                    <div className="flex flex-col min-h-72">
                        <div className="p-4 flex flex-col gap-2 grow justify-center">
                            {features.map((feature, index) => (
                                <React.Fragment key={index}>
                                    <div className="grid grid-cols-6 gap-2">
                                        <FaCheck className={cn("text-xl col-span-1", "text-neutral-400")} />
                                        <p className="text-neutral-700 col-span-5 mb-0 text-sm">{feature}</p>
                                    </div>
                                    {index !== features.length - 1 && <Separator />}
                                </React.Fragment>
                            ))}
                        </div>
                        <div className="flex w-full justify-center p-4">
                            <Link href="#previews-section" className="btn btn-secondary opacity-60 small w-full text-center">
                                Essayer gratuitement
                            </Link>
                        </div>
                        <div className={cn("p-4 flex flex-col gap-2", bgColor)}>
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
