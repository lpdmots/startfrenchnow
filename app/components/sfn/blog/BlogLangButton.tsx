"use client";
import { useSfnStore } from "@/app/stores/sfnStore";
import { usePathname, useRouter } from "next-intl/client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ModalFromBottom } from "../../animations/Modals";
import SimpleButton from "../../animations/SimpleButton";
import { motion } from "framer-motion";

export const BlogLangButton = ({ messages, postLang: postLangParams }: { messages: any; postLang: "fr" | "en" }) => {
    const { postLang } = useSfnStore();
    const [openModal, setOpenModal] = useState(postLang ? false : true);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (postLangParams === "en" && postLang === "fr") router.push(pathname + "?postLang=fr");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const modalData = {
        title: <span className="font-bold">{messages.title}</span>,
        message: messages.message,
        functionOk: () => setOpenModal(false),
        imageUrl: "/images/france-english-flag.png",
        buttonOkStr: messages.okString,
        oneButtonOnly: true,
    };

    return (
        <div className="flex justify-center">
            <div>
                <LangButton />
            </div>
            {openModal && <ModalFromBottom data={modalData} />}
        </div>
    );
};

const LangButton = () => {
    const { postLang, updatePostLang } = useSfnStore();
    const pathname = usePathname();
    const router = useRouter();

    const handleLanguage = (value: "fr" | "en") => {
        updatePostLang(value);
        router.push(pathname + "?postLang=" + value);
    };

    useEffect(() => {
        if (!postLang) updatePostLang("en");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex w-full gap-4">
            <SimpleButton>
                <div className="tab-lang">
                    <span className="flex items-center mb-1" onClick={() => handleLanguage("en")} style={{ maxWidth: 200, padding: 8 }}>
                        <Image src="/images/royaume-uni.png" height={25} width={25} alt="UK flag" className="p-1" style={{ width: "auto", marginRight: 4 }} />
                        <span>EN</span>
                    </span>
                    {postLang === "en" ? <motion.div className="tab-underline" layoutId="underline" /> : null}
                </div>
            </SimpleButton>
            <SimpleButton>
                <div className="tab-lang">
                    <span className="flex items-center mb-1" onClick={() => handleLanguage("fr")} style={{ maxWidth: 200, padding: 8 }}>
                        <Image src="/images/france.png" height={25} width={25} alt="French flag" className="p-1" style={{ width: "auto", marginRight: 4 }} />
                        <span>FR</span>
                    </span>
                    {postLang === "fr" ? <motion.div className="tab-underline" layoutId="underline" /> : null}
                </div>
            </SimpleButton>
        </div>
    );
};
