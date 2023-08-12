"use client";
import { AnimatePresence, m } from "framer-motion";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";
import { BiExit } from "react-icons/bi";
import { GiSpellBook } from "react-icons/gi";
import SimpleButton from "../../animations/SimpleButton";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useStoryStore } from "@/app/stores/storiesStore";
import { setStoryFeedback } from "@/app/serverActions/storyActions";

export const ReviewFormularNavbar = () => {
    const [open, setOpen] = useState<boolean>(false);

    const handleClickForm = () => {
        if (!open) setOpen(true);
    };

    return (
        <div>
            <SimpleButton>
                <div className="flex items-center" onClick={handleClickForm}>
                    <BiExit className="fill-neutral-800 text-3xl sm:text-4xl" />
                </div>
            </SimpleButton>
            {open && <ModalAskForComment setOpen={setOpen} />}
        </div>
    );
};

export const ReviewFormularButton = () => {
    const [open, setOpen] = useState<boolean>(false);

    const handleClickForm = () => {
        if (!open) setOpen(true);
    };

    return (
        <div>
            <button className="btn-primary w-button my-6" onClick={handleClickForm}>
                <div className="flex items-center justify-center">
                    <GiSpellBook className="mr-2" style={{ fontSize: 30 }} />
                    Retourner aux histoires
                </div>
            </button>
            {open && <ModalAskForComment setOpen={setOpen} />}
        </div>
    );
};

const ModalAskForComment = ({ setOpen }: { setOpen: Dispatch<SetStateAction<boolean>> }) => {
    const [checked, setChecked] = useState<boolean>(false);
    const { story } = useStoryStore();
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const handleCheck = () => {
        setChecked(!checked);
    };

    const handleLeave = () => {
        if (checked) setStoryFeedback(session?.user?._id as string, story?._id as string, "no");
        router.push("/stories");
    };

    const handleFeedback = () => {
        if (checked) setStoryFeedback(session?.user?._id as string, story?._id as string, "no");
        router.push(pathname + "/feedback");
    };

    return (
        <AnimatePresence>
            <div className="px-5 fixed h-full w-full flex items-center justify-center top-0 left-0" style={{ zIndex: 2000 }}>
                <m.div
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 0.3,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                    className="bg-neutral-800 px-5 fixed h-full w-full flex items-center justify-center top-0 left-0"
                    onClick={() => setOpen(false)}
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
                    <div>
                        <Image src="/images/ask-for-help.png" height={100} width={100} alt="Le développeur" className="object-contain float-left mr-4 mb-4" style={{ maxHeight: 100 }} />

                        <p className="text-justify">
                            J'espère que vous avez bien voyagé à travers cette histoire. Accepteriez-vous de partager vos impressions sur cette expérience ? Votre retour nous aide à améliorer nos
                            histoires. Si vous avez des souhaits, c'est le moment de demander !
                        </p>
                    </div>
                    <div className="w-checkbox checkbox-field-wrapper col-span-2">
                        <label className="bs w-form-label flex items-center" onClick={handleCheck}>
                            <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checked ? "w--redirected-checked" : undefined}`}></div>
                            Ne plus afficher ce message.
                        </label>
                    </div>
                    {status === "authenticated" && (
                        <div className="flex justify-end gap-4">
                            <button className="btn-secondary small" onClick={handleLeave}>
                                Quitter
                            </button>
                            <button className="btn-primary small" onClick={handleFeedback}>
                                Donner son avis
                            </button>
                        </div>
                    )}
                </m.div>
            </div>
        </AnimatePresence>
    );
};
