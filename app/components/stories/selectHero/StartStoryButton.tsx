"use client";
import { useSetStartData } from "@/app/hooks/stories/useSetStartData";
import { useStoryStore } from "@/app/stores/storiesStore";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalFromBottom } from "../../animations/Modals";
import urlFor from "@/app/lib/urlFor";
import { ElementProps } from "@/app/types/stories/element";
import { useElementTreatment } from "@/app/hooks/stories/useElement";
import { Adventure } from "@/app/types/stories/adventure";
import Spinner from "../../common/Spinner";
import { ElementDataProps } from "@/app/types/stories/state";
import { ELEMENTDATA } from "@/app/lib/constantes";

export const StartStoryButton = ({ element, story: newStory }: { story: Adventure; element: ElementProps }) => {
    const { story: oldStory, resetData } = useStoryStore();
    const router = useRouter();
    const [open, setOpen] = useState<boolean>(false);
    const [startNewStory, setStartNewStory] = useState<boolean>(false);
    const [startButton, setStartButton] = useState<boolean>(false);

    useEffect(() => {
        if (oldStory && !startNewStory) {
            setOpen(true);
        } else {
            setStartNewStory(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [oldStory]);

    const data = {
        setOpen,
        message: "Une partie est déjà en cours, voulez-vous la reprendre ?",
        functionOk: () => router.push(`/stories/${oldStory?.slug.current}/`),
        functionCancel: () => {
            resetData();
            setStartNewStory(true);
        },
        imageUrl: oldStory?.images.icon ? urlFor(oldStory?.images.icon)?.url() : undefined,
        clickOutside: false,
    };

    useEffect(() => {
        if (startNewStory && !oldStory) setStartButton(true);
    }, [startNewStory, oldStory]);

    return (
        <>
            {startButton && <StartButton element={element} newStory={newStory} />}
            {open && <ModalFromBottom data={data} />}
        </>
    );
};

const StartButton = ({ element, newStory }: { element: ElementProps; newStory: Adventure }) => {
    const setStartData = useSetStartData();
    const { elementTreatment } = useElementTreatment();
    const router = useRouter();
    const { layouts, chapter, updateOnChoice, addElementsData } = useStoryStore();
    const [clicked, setClicked] = useState(false);
    const layoutsReady = layouts?.length;

    // Execut only when setStartData is done
    useEffect(() => {
        (async () => {
            if (chapter) {
                const elementData: ElementDataProps = { ...JSON.parse(JSON.stringify(ELEMENTDATA)), elementId: element._id };
                await elementTreatment(element._id, elementData);
                addElementsData("0", elementData);
                updateOnChoice({ _id: "0", elementId: element._id, code: "1", label: undefined });
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chapter]);

    useEffect(() => {
        if (clicked && layoutsReady) {
            router.push(`/stories/${newStory.slug.current}/`);
        }
    }, [clicked, newStory, layoutsReady, router]);

    const handleClick = () => {
        setStartData(newStory);
        setClicked(true);
    };

    return (
        <button className="btn-primary" onClick={handleClick} style={{ minWidth: 278 }}>
            {clicked && !layoutsReady ? <Spinner radius maxHeight="40px" /> : "Commencer la partie"}
        </button>
    );
};
