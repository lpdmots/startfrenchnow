import { sendContactForm } from "@/app/lib/apiNavigation";
import { AnimatePresence, m } from "framer-motion";
import { useSession } from "next-auth/react";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import Spinner from "../../common/Spinner";
import { Question } from "@/app/types/sfn/blog";

const DEFAULTCHECKBOXES = {
    answer: false,
    theme: false,
    error: false,
};

interface ReportQuestionProps {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    exerciseId: string;
    question: Question;
}

export const ReportQuestion = ({ open, setOpen, exerciseId, question }: ReportQuestionProps) => {
    const { data: session } = useSession();
    const [checboxes, setCheckboxes] = useState(DEFAULTCHECKBOXES);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState("");
    const { answer, theme, error } = checboxes;
    const disabled = useMemo(() => (!answer && !theme && !error && !input) || !!message, [answer, theme, error, input, message]);

    const getMailBody = () => {
        let body = "";
        if (answer) body += "My answer should have been accepted.\n";
        if (theme) body += "This question does not correspond to the theme.\n";
        if (error) body += "Something went wrong.\n";
        if (input) body += `Additional information: ${input}\n`;
        body += `\nQuestion: ${question._key} -> ${question.prompt.text}\nExercise: ${exerciseId}`;
        return body;
    };

    const handleSubmit = () => {
        (async () => {
            setSending(true);
            const values = {
                name: session?.user.name || "Utilisateur anonyme",
                email: session?.user.email || "Utilisateur anonyme",
                subject: "Question report",
                message: getMailBody(),
                mailTo: "nicolas@startfrenchnow.com",
            };
            const resp = await sendContactForm(values);
            if (resp?.success) setMessage("Thank you for your message!");
            else setMessage("Sorry, an error occured.");
            setSending(false);
        })();
    };

    const handleClickCancel = () => {
        setOpen(false);
    };

    const handleCheck = (key: "answer" | "theme" | "error") => {
        setCheckboxes((prev) => ({ ...DEFAULTCHECKBOXES, [key]: !prev[key] }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInput(value);
    };

    return (
        <>
            {open && (
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
                            onClick={() => setOpen(false)}
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
                            <div className="flex flex-col gap-2">
                                <p className="font-bold mb-0">Report</p>
                                <div className="w-checkbox checkbox-field-wrapper mb-0">
                                    <label className="w-stars-label flex items-center cursor-pointer mb-0 w-full gap-2" onClick={() => handleCheck("answer")}>
                                        <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${answer && "w--redirected-checked"}`}></div>
                                        <p className="mb-0 bs">My answer should have been accepted.</p>
                                    </label>
                                </div>
                                <div className="w-checkbox checkbox-field-wrapper mb-0">
                                    <label className="w-stars-label flex items-center cursor-pointer mb-0 w-full gap-2" onClick={() => handleCheck("theme")}>
                                        <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${theme && "w--redirected-checked"}`}></div>
                                        <p className="mb-0 bs">This question does not correspond to the theme</p>
                                    </label>
                                </div>
                                <div className="w-checkbox checkbox-field-wrapper mb-0">
                                    <label className="w-stars-label flex items-center cursor-pointer mb-0 w-full gap-2" onClick={() => handleCheck("error")}>
                                        <div id="checkbox" className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${error && "w--redirected-checked"}`}></div>
                                        <p className="mb-0 bs">Something went wrong</p>
                                    </label>
                                </div>
                                <div className="w-full flex justify-center my-1">
                                    <input
                                        type="text"
                                        className="rounded-xl px-2 my-1 focus:border-secondary-2 w-full h-12 md:h-14"
                                        onChange={handleChange}
                                        name="response"
                                        placeholder="There's a typo..."
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                            {message && (
                                <m.div
                                    initial={{ height: 0 }}
                                    animate={{
                                        height: "auto",
                                    }}
                                    exit={{
                                        height: 0,
                                    }}
                                    transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                                >
                                    <p className="text-center">{message}</p>
                                </m.div>
                            )}
                            <div className="flex justify-end gap-4">
                                <button className="btn-secondary small" onClick={handleClickCancel}>
                                    Cancel
                                </button>
                                <button className="btn-primary small" style={{ minWidth: "111.66px" }} disabled={disabled} onClick={handleSubmit}>
                                    {sending ? <Spinner maxHeight="35px" color="var(--neutral-100)" /> : "Submit"}
                                </button>
                            </div>
                        </m.div>
                    </div>
                </AnimatePresence>
            )}
        </>
    );
};
