"use client";
import { ProtectedPage } from "@/app/components/auth/ProtectedPage";
import { StarRating } from "@/app/components/common/StarRating.js";
import { forwardRef, MouseEvent, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next-intl/client";
import { setStoryFeedback, updateFeedback } from "@/app/serverActions/storyActions";
import { useSession } from "next-auth/react";
import Spinner from "@/app/components/common/Spinner";
import { ModalFromBottom } from "@/app/components/animations/Modals";
import Collapse from "@/app/components/animations/Collapse";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
import { useStoryStore } from "@/app/stores/storiesStore";
import SimpleButton from "@/app/components/animations/SimpleButton";

type Props = {
    params: {
        slug: string;
    };
};

const initialStars = {
    "Intérêt pour l'application": -1,
    "Expérience utilisateur": -1,
    story: -1,
};

type CheckBoxesKeys = "enigm" | "dialog" | "exercises" | "soundscape" | "audio";

export interface CheckBoxes {
    enigm: { checked: boolean; title: string };
    dialog: { checked: boolean; title: string };
    exercises: { checked: boolean; title: string };
    soundscape: { checked: boolean; title: string };
    audio: { checked: boolean; title: string };
}

const initialCheckBoxes = {
    enigm: { checked: false, title: "Des énigmes" },
    dialog: { checked: false, title: "Des dialogues" },
    exercises: { checked: false, title: "Des exercices" },
    soundscape: { checked: false, title: "Une ambiance sonore" },
    audio: { checked: false, title: "Des passages à écouter" },
};

const t = {
    en: {
        title: (
            <span>
                Evaluation of <span className="heading-span-secondary-2">Your Experience</span>
            </span>
        ),
        feedbackInfo: "Your feedback is important to us and will help us make our interactive story application better.",
        interestTitle: "Your interest in the application",
        interestDescription: "How do you appreciate interactive stories? Do you like the concept? Would you be inclined to discover other stories of this type?",
        uxTitle: "User Experience Feedback",
        uxDescription: "Did you find our interface easy to use? Was the navigation within the story smooth? Did you notice any anomalies or confusing elements?",
        storyTitle: "Story Appreciation",
        storyDescription: "Did you like the story? Did you appreciate the choices that were offered to you? Did you have a good time?",
        futureWishes: "Wishes for the future?",
        futureDescription: "What would you like to find in future stories? What elements were missing in this story? Specify the features to be developed as a priority.",
        checkboxes: {
            enigm: "Riddles",
            dialog: "Dialogues",
            exercises: "Exercises",
            soundscape: "A soundscape",
            audio: "Passages to listen to",
        },
        commentLabel: "Would you like to add details or suggestions?",
        cancelButton: "Cancel",
        submitButton: "Submit",
        thx: "Your feedback has been taken into account. It's very nice of you to have participated!",
        thxLeave: "Leave",
        addComment: "Add a comment",
        commentPlaceholder: "Would you like to add details?",
        placeholder: "Write here...",
        error404: "Sorry, we encountered an error that prevented us from saving your feedback. Please try again later.",
        error500: "Oops, an error occurred and we were unable to save your feedback. Please try again later.",
        allready: "You had already given us your feedback for this story. Thank you!",
        // ... [autres traductions en anglais]
    },
    fr: {
        title: (
            <span>
                Évaluation de <span className="heading-span-secondary-2">Votre Expérience</span>
            </span>
        ),
        feedbackInfo: "Votre avis est important pour nous et nous aidera à rendre notre application d'histoires interactives meilleure.",
        interestTitle: "Votre intérêt pour l'application",
        interestDescription: "Quelle est votre appréciation des histoires interactives ? Le concept vous séduit-il ? Seriez-vous enclin à découvrir d'autres histoires de ce type ?",
        uxTitle: "Retour sur l'expérience utilisateur",
        uxDescription: "Avez-vous trouvé notre interface facile à utiliser ? La navigation au sein de l'histoire était-elle fluide ? Avez-vous constaté des anomalies ou des éléments déroutants ?",
        storyTitle: "Appréciation de l'histoire",
        storyDescription: "L'histoire vous a-t-elle plu ? Avez-vous apprécié les choix qui vous ont été proposés ? Avez-vous passé un bon moment ?",
        futureWishes: "Des envies pour la suite ?",
        futureDescription: "Qu'aimeriez-vous trouver dans les prochaines histoires ? Quels éléments vous ont manqué dans cette histoire ? Précisez les fonctionnalités à développer en priorité.",
        checkboxes: {
            enigm: "Des énigmes",
            dialog: "Des dialogues",
            exercises: "Des exercices",
            soundscape: "Une ambiance sonore",
            audio: "Des passages à écouter",
        },
        commentLabel: "Souhaitez-vous ajouter des détails ou des suggestions ?",
        cancelButton: "Annuler",
        submitButton: "Envoyer",
        thx: "Votre avis a bien été pris en compte. C'est très sympa d'avoir participé !",
        thxLeave: "Quitter",
        addComment: "Ajouter un commentaire",
        commentPlaceholder: "Souhaitez-vous ajouter des précisions ?",
        placeholder: "Écrivez ici...",
        error404: "Désolé, nous avons rencontré une erreur qui ne nous a pas permis d'enregistrer votre feedback. Veuillez réessayer plus tard.",
        error500: "Oups, une erreur s'est produite et nous n'avons pas pu enregistrer votre feedback. Veuillez réessayer plus tard.",
        allready: "Vous nous aviez déjà fait part de votre feedback pour cette histoire. Merci !",
        // ... [autres traductions en français]
    },
};

interface SubmitResponse {
    error: "error404" | "error500" | "allready" | null;
    success: boolean;
}

export default function Feedback({ params: { slug } }: Props) {
    const [stars, setStars] = useState(initialStars);
    const [language, setLanguage] = useState<"fr" | "en">("fr");
    const [checkboxes, setCheckboxes] = useState(initialCheckBoxes);
    const { story } = useStoryStore();
    const comment = useRef<HTMLTextAreaElement>(null);
    const interestRef = useRef<HTMLTextAreaElement>(null);
    const uxRef = useRef<HTMLTextAreaElement>(null);
    const storyRef = useRef<HTMLTextAreaElement>(null);
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [modal, setModal] = useState({ open: false, data: {} });
    const router = useRouter();

    const getModalData = (response: SubmitResponse) => {
        if (response.error) {
            return {
                title: "Erreur",
                message: <p>{t[language][response.error]}</p>,
                functionOk: () => router.push(`/stories`),
                imageUrl: "/images/page-not-found-icon-paperfolio-webflow-template.svg",
                clickOutside: false,
                buttonOkStr: t[language].thxLeave,
                oneButtonOnly: true,
            };
        } else {
            return {
                title: "Merci !",
                message: <p>{t[language].thx}</p>,
                functionOk: () => {
                    setStoryFeedback(session?.user?._id as string, story?._id as string, "done");
                    router.push(`/stories`);
                },
                imageUrl: "/images/smile.png",
                clickOutside: false,
                buttonOkStr: t[language].thxLeave,
                oneButtonOnly: true,
            };
        }
    };

    const divider = (
        <div className="w-full flex justify-center py-8">
            <div style={{ width: "30%", height: 1, border: "1px solid gray" }}></div>
        </div>
    );

    const handleStarIndex = (index: number, ObjectKey: string) => {
        setStars((prev) => ({ ...prev, [ObjectKey]: index }));
    };

    const handleCheckbox = (objectKey: CheckBoxesKeys) => {
        setCheckboxes((prev) => ({ ...prev, [objectKey]: { ...prev[objectKey], checked: !prev[objectKey].checked } }));
    };

    const handleSubmit = async (e: MouseEvent<HTMLButtonElement>) => {
        const interestComment = interestRef.current?.value ? "**Intérêt pour l'application:** " + interestRef.current?.value + "\n" : "";
        const uxComment = uxRef.current?.value ? "**Expérience utilisateur:** " + uxRef.current?.value + "\n" : "";
        const storyComment = storyRef.current?.value ? "**Appréciation de l'histoire:** " + storyRef.current?.value + "\n" : "";
        const commentValue = comment.current?.value ? "**Commentaire:** " + comment.current?.value : "";
        const commentString = interestComment + uxComment + storyComment + commentValue;

        const data = {
            stars,
            checkboxes,
            comment: commentString,
        };

        setIsLoading(true);
        const resp = await updateFeedback(data, slug, session?.user?._id);
        setModal({ open: true, data: getModalData(resp as SubmitResponse) });
        setIsLoading(false);
    };

    const handleLanguage = () => {
        setLanguage((prev) => (prev === "fr" ? "en" : "fr"));
    };

    /* return (
        <ProtectedPage callbackUrl={`/stories/${slug}/select-heros`} messageInfo="You need to log in to keep track of your stories.">
            
        </ProtectedPage> */
    return (
        <div className="container-default mx-auto h-screen flex flex-col item-center">
            <LanguageButton language={language} handleLanguage={handleLanguage} />
            <div className="my-16 mt-0">
                <h1 className="display-1 w-full text-center">{t[language].title}</h1>
                <p className="mb-0 w-full text-center">{t[language].feedbackInfo}</p>
            </div>

            <div className="grid grid-cols-2">
                <div className="col-span-2 md:col-span-1 flex justify-center items-center">
                    <Image src="/images/codeur.png" alt="a coder working on computer" height={500} width={500} style={{ objectFit: "contain", height: "auto" }} />
                </div>
                <div className="col-span-2 md:col-span-1">
                    {divider}
                    <div className="flex flex-col justify-center items-center gap-4">
                        <StarRating starIndex={stars["Intérêt pour l'application"]} handleStarIndex={handleStarIndex} ObjectKey="Intérêt pour l'application" />
                        <div>
                            <h3 className="display-5 text-center">{t[language].interestTitle}</h3>
                            <p className="bs font-bold text-center mb-0 max-w-xl">{t[language].interestDescription}</p>
                            <CommentCollapse ref={interestRef} language={language} />
                        </div>
                    </div>

                    {divider}
                    <div className="flex flex-col justify-center items-center gap-4">
                        <StarRating starIndex={stars["Expérience utilisateur"]} handleStarIndex={handleStarIndex} ObjectKey="Expérience utilisateur" />
                        <div>
                            <h3 className="display-5 text-center">{t[language].uxTitle}</h3>
                            <p className="bs font-bold text-center mb-0 max-w-xl">{t[language].uxDescription}</p>
                            <CommentCollapse ref={uxRef} language={language} />
                        </div>
                    </div>
                    {divider}
                    <div className="flex flex-col justify-center items-center gap-4">
                        <StarRating starIndex={stars.story} handleStarIndex={handleStarIndex} ObjectKey="story" />
                        <div>
                            <h3 className="display-5 text-center">{t[language].storyTitle}</h3>
                            <p className="bs font-bold text-center mb-0 max-w-xl">{t[language].storyDescription}</p>
                            <CommentCollapse ref={storyRef} language={language} />
                        </div>
                    </div>
                </div>
            </div>
            {divider}
            <div className="grid grid-cols-2 gap-8 md:gap-16">
                <div className="col-span-2 md:col-span-1 flex flex-col justify-center md:items-end">
                    <div className="flex flex-col  md:items-end w-full md:max-w-sm">
                        <h3 className="display-5 text-left md:text-right">{t[language].futureWishes}</h3>
                        <p className="bs font-bold mb-0 max-w-xl text-left md:text-right">{t[language].futureDescription}</p>
                    </div>
                </div>
                <div className="col-span-2 md:col-span-1 flex flex-col justify-center">
                    <div className="w-checkbox checkbox-field-wrapper col-span-2">
                        <label className="w-stars-label flex items-center cursor-pointer" onClick={() => handleCheckbox("enigm")}>
                            <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checkboxes.enigm.checked ? "w--redirected-checked" : undefined}`}></div>
                            {t[language].checkboxes.enigm}
                        </label>
                    </div>
                    <div className="w-checkbox checkbox-field-wrapper col-span-2">
                        <label className="w-stars-label flex items-center cursor-pointer" onClick={() => handleCheckbox("dialog")}>
                            <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checkboxes.dialog.checked ? "w--redirected-checked" : undefined}`}></div>
                            {t[language].checkboxes.dialog}
                        </label>
                    </div>
                    <div className="w-checkbox checkbox-field-wrapper col-span-2">
                        <label className="w-stars-label flex items-center cursor-pointer" onClick={() => handleCheckbox("exercises")}>
                            <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checkboxes.exercises.checked ? "w--redirected-checked" : undefined}`}></div>
                            {t[language].checkboxes.exercises}
                        </label>
                    </div>
                    <div className="w-checkbox checkbox-field-wrapper col-span-2">
                        <label className="w-stars-label flex items-center cursor-pointer" onClick={() => handleCheckbox("soundscape")}>
                            <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checkboxes.soundscape.checked ? "w--redirected-checked" : undefined}`}></div>
                            {t[language].checkboxes.soundscape}
                        </label>
                    </div>
                    <div className="w-checkbox checkbox-field-wrapper col-span-2 mb-0">
                        <label className="w-stars-label flex items-center cursor-pointer" onClick={() => handleCheckbox("audio")}>
                            <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${checkboxes.audio.checked ? "w--redirected-checked" : undefined}`}></div>
                            {t[language].checkboxes.audio}
                        </label>
                    </div>
                </div>
            </div>
            {divider}
            <div className="w-full">
                <label htmlFor="message">{t[language].commentLabel}</label>
                <textarea ref={comment} placeholder={t[language].placeholder} className="text-area w-input" maxLength={1000}></textarea>
            </div>
            <div className="py-4 flex justify-center gap-4">
                <button className="btn btn-secondary" onClick={() => router.push("/stories")}>
                    {t[language].cancelButton}
                </button>
                <button onClick={isLoading ? undefined : handleSubmit} className="btn btn-primary" style={{ minWidth: 150 }}>
                    {isLoading ? <Spinner radius maxHeight="40px" color="var(--neutral-100)" /> : t[language].submitButton}
                </button>
            </div>
            {modal.open && <ModalFromBottom data={modal.data as any} />}
        </div>
    );
}

const CommentCollapse = forwardRef<HTMLTextAreaElement, any>(function (props: { language: "fr" | "en" }, ref) {
    const [textValue, setTextValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextValue(e.target.value);
    };

    const content = (
        <textarea ref={ref} placeholder={t[props.language].commentPlaceholder} className="text-area w-input mt-4" maxLength={1000} value={textValue} onChange={handleTextChange}></textarea>
    );

    return (
        <span>
            <Collapse content={content}>
                <div className="flex justify-center">
                    <div className="text-sm cursor-pointer pt-4 italic flex items-center" onClick={() => setIsOpen((prev) => !prev)}>
                        {t[props.language]?.addComment} {isOpen ? <FaCaretUp className="ml-2" /> : <FaCaretDown className="ml-2" />}
                    </div>
                </div>
            </Collapse>
        </span>
    );
});
CommentCollapse.displayName = "CommentCollapse";

const LanguageButton = ({ language, handleLanguage }: { language: "fr" | "en"; handleLanguage: () => void }) => {
    return (
        <div className="flex justify-end m-4 md:m-8">
            <SimpleButton>
                {language === "en" ? (
                    <span className="flex items-center" onClick={handleLanguage} style={{ maxWidth: 200, padding: 8 }}>
                        <Image src="/images/royaume-uni.png" height={25} width={25} alt="UK flag" style={{ width: "auto", marginRight: 4 }} />
                        <span>EN</span>
                    </span>
                ) : (
                    <span className="flex items-center" onClick={handleLanguage} style={{ maxWidth: 200, padding: 8 }}>
                        <Image src="/images/france.png" height={25} width={25} alt="French flag" style={{ width: "auto", marginRight: 4 }} />
                        <span>FR</span>
                    </span>
                )}
            </SimpleButton>
        </div>
    );
};
