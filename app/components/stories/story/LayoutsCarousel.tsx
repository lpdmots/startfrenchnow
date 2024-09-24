"use client";
import { useElementTreatment } from "@/app/hooks/stories/useElement";
import { useStoryStore } from "@/app/stores/storiesStore";
import { AnimatePresence, m } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { DesktopLayout } from "@/app/components/stories/story/DesktopLayout";
import { MobileTabsContent } from "./MobileTabsContent";
import useMediaQuery from "@/app/hooks/useMediaQuery";
import { Reviews } from "./Reviews";
import { useSession } from "next-auth/react";
import { useRouter } from "next-intl/client";
import { ModalFromBottom } from "../../animations/Modals";

export const LayoutsCarousel = () => {
    const { layouts, slideIndex, story } = useStoryStore();
    const router = useRouter();
    const { choicesTreatment } = useElementTreatment();
    const isDesktop = useMediaQuery("(min-width: 992px)");
    const [openSignUpAlert, setOpenSignUpAlert] = useState<boolean>(false);
    const { data: session, status } = useSession();

    const modalData = {
        setOpen: setOpenSignUpAlert,
        title: <h3 className="display-3">Enregistrez Vos Progrès</h3>,
        message: (
            <div className="flex flex-col sm:gap-2 lg:gap-4">
                <p className="mb-0">Voulez-vous garder vos scores et ce que vous avez accompli ? Connectez-vous !</p>
                <p>
                    <strong>Vous n'avez pas de compte ?</strong> Créez-en un, commencez l'histoire de nouveau, vous pourrez reprendre l'aventure en cours.
                </p>
            </div>
        ),
        functionOk: () => router.push("/auth/signIn?callbackUrl=" + `/stories/${story?.slug.current}`),
        clickOutside: false,
        buttonOkStr: "Se connecter",
        buttonAnnulerStr: "Plus tard",
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (status !== "authenticated") setOpenSignUpAlert(true);
        }, 320000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        choicesTreatment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [layouts]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const dateKey = useMemo(() => new Date().getTime(), [layouts]); // Force re-render when layouts change but not the slideIndex or it will not animate
    const layout = layouts[slideIndex];

    return (
        <div className="slider-wrapper w-slider flex justify-center items-center pb-0 grow">
            <AnimatePresence mode="wait">
                <m.div
                    className="h-full w-full flex justify-center items-around"
                    key={dateKey + slideIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {isDesktop ? (
                        layout?.reviewLayout ? (
                            <Reviews data={layout} />
                        ) : (
                            <DesktopLayout data={layout} />
                        )
                    ) : layout?.reviewLayout ? (
                        <Reviews data={layout} />
                    ) : (
                        <div className="flex grow justify-center items-center">
                            <MobileTabsContent data={layout} />
                        </div>
                    )}
                </m.div>
            </AnimatePresence>
            {openSignUpAlert && <ModalFromBottom data={modalData} />}
        </div>
    );
};
