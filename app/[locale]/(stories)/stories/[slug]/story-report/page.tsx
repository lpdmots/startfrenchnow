"use client";
import { ModalFromBottom } from "@/app/components/animations/Modals";
import { ProtectedPage } from "@/app/components/auth/ProtectedPage";
import Spinner from "@/app/components/common/Spinner";
import { sendContactForm } from "@/app/lib/apiNavigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next-intl/client";
import { useEffect, useRef, useState } from "react";

interface Props {
    params: {
        slug: string;
    };
}

const StoryReport = ({ params: { slug } }: Props) => {
    const comment = useRef<HTMLTextAreaElement>(null);
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [modalData, setModalData] = useState<any>(null);
    const [open, setOpen] = useState<boolean>(false);
    const router = useRouter();

    useEffect(() => {
        if (status !== "authenticated" || sending) setIsLoading(true);
        else setIsLoading(false);
    }, [status, sending, setIsLoading]);

    const getModalData = (type: "success" | "error" | "fill") => ({
        setOpen,
        title: <h3 className="display-3">{type === "success" ? "Message envoyé" : type === "error" ? "Erreur" : "Champ vide"}</h3>,
        message: (
            <div>
                {type === "success" ? (
                    <p>Merci pour votre message ! Nous vous répondrons dès que possible.</p>
                ) : type === "error" ? (
                    <p>Une erreur est survenue. Veuillez réessayer plus tard.</p>
                ) : (
                    <p>Veuillez remplir le champ avant d'envoyer votre message.</p>
                )}
            </div>
        ),
        functionOk: type === "success" ? () => router.push("/stories/" + slug) : () => setOpen(false),
        clickOutside: type === "success" ? false : true,
        buttonOkStr: type === "success" ? "Reprendre l'histoire" : "Ok",
        oneButtonOnly: true,
    });

    const handleSubmit = () => {
        (async () => {
            if (!comment.current?.value) {
                setModalData(getModalData("fill"));
                setOpen(true);
                return;
            }
            setSending(true);
            const values = {
                name: session?.user.name || "Utilisateur anonyme",
                email: session?.user.email || "Utilisateur anonyme",
                subject: "Story report",
                message: comment.current?.value,
                mailTo: "nicolas@startfrenchnow.com",
            };
            const resp = await sendContactForm(values);
            if (resp?.success) setModalData(getModalData("success"));
            else setModalData(getModalData("error"));
            setOpen(true);
            setSending(false);
        })();
    };

    return (
        <ProtectedPage callbackUrl={`/stories/${slug}/story-report`} messageInfo="">
            <div className="container-default mx-auto h-screen grid grid-cols-2 gap-0 lg:gap-8">
                <div className="col-span-2 lg:col-span-1 h-full w-full flex flex-col items-center justify-center py-8 md:gap-4">
                    <h1 className="display-1">
                        <span className="heading-span-secondary-2">Nous contacter</span>
                    </h1>
                    <p>Un bug à signaler ? Une suggestion pour améliorer nos histoires interactives ?</p>
                    <textarea placeholder={"Laissez-nous un message..."} ref={comment} className="text-area w-input mt-4" maxLength={1000}></textarea>
                    <div className="flex w-full justify-center gap-4 mt-4">
                        <button className="btn-secondary" onClick={() => router.push("/stories/" + slug)}>
                            Annuler
                        </button>
                        <button className="btn-primary" onClick={handleSubmit} style={{ minWidth: 160 }}>
                            {isLoading ? <Spinner radius maxHeight="40px" color="var(--neutral-100)" /> : "Envoyer"}
                        </button>
                    </div>
                </div>
                <div className="col-span-2 lg:col-span-1 flex w-full justify-center">
                    <Image src="/images/codeur.png" alt="un développeur" height={500} width={500} style={{ objectFit: "contain", height: "auto" }} />
                </div>
            </div>
            {open && <ModalFromBottom data={modalData} />}
        </ProtectedPage>
    );
};

export default StoryReport;
