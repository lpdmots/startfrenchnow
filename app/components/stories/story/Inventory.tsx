"use client";
import { Variable, VariableState } from "@/app/types/stories/adventure";
import urlFor from "@/lib/urlFor";
import { splitArrayIntoChunks } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import { Carousel } from "../../animations/Carousel";
import { ModalFromBottom } from "../../animations/Modals";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import Image from "next/image";

const CHUNCKNUMBER = 6;

export const Inventory = ({ objects }: { objects: VariableState[] }) => {
    const isTablet = useMediaQuery("(min-width: 768px)");
    const data = useMemo(
        () =>
            splitArrayIntoChunks(objects, CHUNCKNUMBER).map((chunk, index) => (
                <div key={index} className={`grid ${isTablet ? "grid-cols-3 grid-rows-2" : "grid-cols-2 grid-rows-3"} gap-4 md:gap-6 h-5/6 grow w-full`}>
                    {chunk.map((object) => (
                        <InventoryItem key={object.data._id} object={object} />
                    ))}
                    {Array(CHUNCKNUMBER - chunk.length)
                        .fill(1)
                        .map((_, index) => (
                            <div key={index} className="flex flex-col justify-center items-center rounded-xl border border-dashed bg-neutral-300" style={{ borderColor: "var(--neutral-500)" }}></div>
                        ))}
                </div>
            )),
        [objects, isTablet]
    );

    return (
        <div className="rounded-xl shadow-1 simple-border w-full p-4 md:p-6" style={{ height: isTablet ? 450 : "80%" }}>
            <Carousel data={data} inventoryArrows />
        </div>
    );
};

const InventoryItem = ({ object }: { object: VariableState }) => {
    const [open, setOpen] = useState<boolean>(false);
    const display = object?.data?.display;

    const modalData = {
        setOpen,
        message: display.description,
        functionOk: () => setOpen(false),
        imageUrl: display?.image ? urlFor(display.image).url() : undefined,
        clickOutside: true,
        buttonOkStr: "Ok",
        oneButtonOnly: true,
    };

    const handleClick = () => {
        if (!open) setOpen(true);
    };

    return (
        <div className="flex flex-col justify-center items-center rounded-xl simple-border cursor-pointer" onClick={handleClick} style={{ borderColor: "var(--neutral-500)", width: "100%" }}>
            <div className="h-3/4 p-2 relative">
                <Image src={urlFor(display.image).url()} width={125} height={125} alt={display.name} className="w-full h-full object-contain" />
                <p className="absolute font-bold right-0 bottom-0 mb-0">{parseInt(object.value) > 1 && `x${object.value}`}</p>
            </div>
            <p className="flex justify-center items-center text-center mb-0 bs grow p-1">{display.name}</p>
            {open && <ModalFromBottom data={modalData} />}
        </div>
    );
};
