"use client";
import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";

interface Props {
    data: {
        setOpen?: (value: boolean) => void;
        title?: string | JSX.Element;
        message: JSX.Element;
        functionOk: () => void;
        functionCancel?: () => void;
        imageUrl?: string;
        clickOutside?: boolean;
        buttonOkStr?: string | JSX.Element;
        buttonAnnulerStr?: string | JSX.Element;
        oneButtonOnly?: boolean;
    };
}

export const ModalFromBottom = ({ data }: Props) => {
    const { setOpen, message, title, functionOk, functionCancel, imageUrl, clickOutside, buttonOkStr, oneButtonOnly, buttonAnnulerStr } = data;

    const handleClickOk = () => {
        functionOk();
        setOpen && setOpen(false);
    };

    const handleClickCancel = () => {
        functionCancel && functionCancel();
        setOpen && setOpen(false);
    };

    return (
        <AnimatePresence>
            <div className="px-5 fixed h-screen w-screen flex items-center justify-center top-0 left-0" style={{ zIndex: 2000 }}>
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
                        return clickOutside ? setOpen && setOpen(false) : null;
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
                    className="absolute z-100 p-5 bg-neutral-200 h-auto max-w-md text-white rounded-lg"
                    style={{ width: "98%" }}
                >
                    <div className="grid grid-cols-5 gap-4 mb-2">
                        <div className={`${imageUrl ? "col-span-4" : "col-span-5"} flex flex-col text-left`}>
                            <div className="font-bold underline">{title}</div>
                            {message}
                        </div>
                        {imageUrl && (
                            <div className="col-span-1">
                                <Image src={imageUrl} height={50} width={50} alt="representation de l'objet" className="h-12 sm:h-16 md:h-24 object-contain w-auto" />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-4">
                        {!oneButtonOnly && (
                            <button className="btn-secondary small" onClick={handleClickCancel}>
                                {buttonAnnulerStr ? buttonAnnulerStr : "Annuler"}
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
