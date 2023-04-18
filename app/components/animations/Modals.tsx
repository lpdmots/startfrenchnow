"use client";
import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";

interface Props {
    data: {
        setOpen: (value: boolean) => void;
        message: string;
        functionOk: () => void;
        functionCancel?: () => void;
        imageUrl?: string;
        clickOutside?: boolean;
        buttonOkStr?: string;
        oneButtonOnly?: boolean;
    };
}

export const ModalFromBottom = ({ data }: Props) => {
    const { setOpen, message, functionOk, functionCancel, imageUrl, clickOutside, buttonOkStr, oneButtonOnly } = data;

    const handleClickOk = () => {
        functionOk();
        setOpen(false);
    };

    const handleClickCancel = () => {
        functionCancel && functionCancel();
        setOpen(false);
    };

    return (
        <AnimatePresence>
            <div className="px-5 fixed h-full w-full flex items-center justify-center top-0 left-0">
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 0.3,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    onClick={() => {
                        return clickOutside ? setOpen(false) : null;
                    }}
                    className="bg-neutral-800 px-5 fixed h-full w-full flex items-center justify-center top-0 left-0"
                />
                <m.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{
                        y: 0,
                        opacity: 1,
                    }}
                    exit={{
                        y: -50,
                        opacity: 0,
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                    className="absolute z-100 p-5 bg-neutral-200 h-auto max-w-md  text-white rounded-lg"
                    style={{ width: "98%" }}
                >
                    <div className="grid grid-cols-5 gap-4">
                        {imageUrl && (
                            <div className="col-span-1">
                                <Image src={imageUrl} height={50} width={50} alt={message} className="h-12 sm:h-16 md:h-24 object-contain w-auto" />
                            </div>
                        )}
                        <p className="col-span-4 flex items-center">{message}</p>
                    </div>
                    <div className="flex justify-end gap-4">
                        {!oneButtonOnly && (
                            <button className="btn-secondary small" onClick={handleClickCancel}>
                                Annuler
                            </button>
                        )}
                        <button className="btn-primary small" onClick={handleClickOk}>
                            {buttonOkStr ? buttonOkStr : "Continuer"}
                        </button>
                    </div>
                </m.div>
            </div>
        </AnimatePresence>
    );
};