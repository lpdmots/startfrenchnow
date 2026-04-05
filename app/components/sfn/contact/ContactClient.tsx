"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { sendContactForm, subscribeNewsletter } from "@/app/lib/apiNavigation";
import Spinner from "@/app/components/common/Spinner";
import SimpleButton from "@/app/components/animations/SimpleButton";

const initialValue = () => ({
    name: "",
    email: "",
    subject: "",
    message: "",
    mailTo: "",
    website: "",
    startedAt: Date.now(),
});

interface FormDataProps {
    values: ReturnType<typeof initialValue>;
    isLoading: boolean;
    error: boolean;
    mailTo: string;
    newsletterCheck: boolean;
}

const initState = { values: initialValue(), isLoading: false, error: false, mailTo: "yohann", newsletterCheck: false };

export const ContactClient = ({ nameList, messages }: { nameList: string; messages: any }) => {
    const name = ["yohann", "nicolas"].includes(nameList?.[0]) && nameList?.[0];
    const [formData, setFormData] = useState<FormDataProps>({ ...initState, mailTo: name ? name : "yohann" });
    const mailTo = formData.mailTo;

    const handleMailTo = (name: string) => {
        setFormData((state) => ({ ...state, mailTo: name }));
    };
    return (
        <>
            <div className="sticky-top _48px-top sticky-tbl">
                <div className="inner-container max-w-[380px] max-[991px]:max-w-full">
                    <div className="text-center---tablet">
                        <div className="card flex p-[48px_25px] flex-col shadow-[none] hover:[transform:none] max-[991px]:flex max-[991px]:pt-[40px] max-[991px]:pb-[40px] max-[991px]:flex-row max-[991px]:justify-center max-[991px]:gap-x-[16px] max-[991px]:gap-y-[16px] max-[767px]:p-[32px_24px] max-[767px]:flex-wrap max-[767px]:gap-x-[10px] max-[767px]:gap-y-[10px] max-[479px]:flex-col max-[479px]:gap-y-[5px]">
                            <div className="flex items-center">
                                <Image src="/images/envelope-icon-large-paperfolio-webflow-template.svg" height={34} width={46} alt="envelope icon" className="mb-6 mr-4" />
                                <p>{messages["contactPrompt"]}</p>
                            </div>
                            <div className="w-dyn-list">
                                <div
                                    role="list"
                                    className="max-[991px]:flex max-[991px]:flex-wrap max-[991px]:gap-x-[16px] max-[991px]:gap-y-[16px] max-[767px]:gap-x-[10px] max-[767px]:gap-y-[10px] max-[479px]:flex-col max-[479px]:gap-y-0 categories w-dyn-items"
                                >
                                    <div role="listitem" className="w-dyn-item w-full" onClick={() => handleMailTo("yohann")}>
                                        <div className={`blog-categories-item-wrapper w-full ${mailTo === "yohann" && "current pointer-events-none"}`}>
                                            <p className="text-lg mb-0 w-full text-center">Yohann</p>
                                            <p className="bs color-neutral-500 mb-0 w-full text-center italic">{messages["yohann"]}</p>
                                        </div>
                                    </div>
                                    <div role="listitem" className="w-dyn-item w-full" onClick={() => handleMailTo("nicolas")}>
                                        <div className={`blog-categories-item-wrapper w-full ${mailTo === "nicolas" && "current pointer-events-none"}`}>
                                            <p className="text-lg mb-0 w-full text-center">Nicolas</p>
                                            <p className="bs color-neutral-500 mb-0 w-full text-center italic">{messages["nicolas"]}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid gap-12">
                <ContactForm formData={formData} setFormData={setFormData} messages={messages["ContactForm"]} />
            </div>
        </>
    );
};

const ContactForm = ({ formData, setFormData, messages }: { formData: FormDataProps; setFormData: Dispatch<SetStateAction<FormDataProps>>; messages: any }) => {
    const { values, isLoading, mailTo, newsletterCheck } = formData;
    const [submitted, setSubmitted] = useState<Boolean>(false);

    const handleChange = ({ target }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((state) => ({
            ...state,
            values: { ...state.values, [target.name]: target.value },
        }));
    };

    const handleNewsletter = () => {
        setFormData((state) => ({
            ...state,
            newsletterCheck: !state.newsletterCheck,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormData((state) => ({ ...state, isLoading: true }));
        try {
            await sendContactForm({ ...values, mailTo });
            if (newsletterCheck) {
                await subscribeNewsletter({ email: values.email });
            }

            setFormData({ ...initState, mailTo, values: initialValue() });
            setSubmitted(true);
        } catch (error: any) {
            setFormData((prev) => ({
                ...prev,
                isLoading: false,
                error: true,
            }));
        }
    };

    return (
        <>
            <SlideFromBottom delay={0.4}>
                <div className="mt-0 w-full _100---tablet">
                    <div className="card form w-form">
                        {!submitted ? (
                            <>
                                <div className="flex">
                                    <SimpleButton>
                                        <Link href={`mailto:${mailTo}@startfrenchnow.com`} className="no-underline w-inline-block mb-2">
                                            <p className="text-neutral-800 text-[20px] max-md:text-[18px] leading-[1.111em] font-medium underline decoration-dotted">
                                                {messages["emailTo"]}
                                                {mailTo.charAt(0).toUpperCase() + mailTo.slice(1)}
                                            </p>
                                        </Link>
                                    </SimpleButton>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <input type="hidden" name="startedAt" value={values.startedAt} />
                                    <div
                                        aria-hidden="true"
                                        style={{
                                            position: "absolute",
                                            left: "-5000px",
                                            top: "auto",
                                            width: "1px",
                                            height: "1px",
                                            overflow: "hidden",
                                        }}
                                    >
                                        <label htmlFor="website">Website</label>
                                        <input id="website" name="website" type="text" value={(values as any).website} onChange={handleChange} tabIndex={-1} autoComplete="off" />
                                    </div>
                                    <div className="w-layout-grid grid-2-columns form">
                                        <div className="position-relative col-span-2 md:col-span-1">
                                            <label htmlFor="name">{messages["nameLabel"]}</label>
                                            <input
                                                onChange={handleChange}
                                                value={values.name}
                                                type="text"
                                                className="input icon-input pl-[54px] placeholder:text-neutral-600 w-input"
                                                style={{
                                                    backgroundImage: "url('/images/icon-1-contact-paperfolio-template.svg')",
                                                    backgroundPosition: "24px 50%",
                                                    backgroundSize: "20px 20px",
                                                    backgroundRepeat: "no-repeat",
                                                }}
                                                name="name"
                                                placeholder="John Doe"
                                                id="name"
                                                maxLength={256}
                                            />
                                        </div>
                                        <div className="position-relative col-span-2 md:col-span-1">
                                            <label htmlFor="email">{messages["emailLabel"]}</label>
                                            <input
                                                onChange={handleChange}
                                                type="email"
                                                className="input icon-input pl-[54px] placeholder:text-neutral-600 w-input"
                                                style={{
                                                    backgroundImage: "url('/images/icon-2-contact-paperfolio-template.svg')",
                                                    backgroundPosition: "24px 50%",
                                                    backgroundSize: "20px 20px",
                                                    backgroundRepeat: "no-repeat",
                                                }}
                                                name="email"
                                                placeholder={messages["emailPlaceholder"]}
                                                value={values.email}
                                                id="email"
                                                required={true}
                                                maxLength={256}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label htmlFor="subject">{messages["subjectLabel"]}</label>
                                            <input
                                                onChange={handleChange}
                                                value={values.subject}
                                                type="text"
                                                className="input placeholder:text-neutral-600 w-input"
                                                name="subject"
                                                placeholder={messages["subjectPlaceholder"]}
                                                id="subject"
                                                maxLength={256}
                                                required={true}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label htmlFor="message">{messages["messageLabel"]}</label>
                                            <textarea
                                                onChange={handleChange}
                                                id="message"
                                                name="message"
                                                placeholder={messages["messagePlaceholder"]}
                                                className="max-h-[200px] max-w-full min-h-[144px] min-w-full p-[24px] border-solid border-[3px] border-[var(--neutral-800)] rounded-[22px] bg-[var(--neutral-100)] [transition:box-shadow_300ms_ease\,_color_300ms_ease\,_border-color_300ms_ease] text-[var(--neutral-800)] text-[18px] font-bold hover:border-[var(--neutral-800)] hover:shadow-[5px_5px_0_0_var(--neutral-800)] shadow-[5px_5px_0_0_var(--neutral-800)] font-medium min-h-[102px] pt-[20px] pb-[20px] rounded-[18px] text-[16px] max-[767px]:min-h-[134px] max-[767px]:pt-[20px] max-[767px]:pb-[20px] max-[767px]:rounded-[18px] max-[767px]:text-[16px] max-[767px]:min-h-[92px] max-[767px]:pt-[18px] max-[767px]:pb-[18px] max-[767px]:rounded-[14px] max-[767px]:text-[14px] max-[479px]:pr-[20px] max-[479px]:pl-[20px] placeholder:text-neutral-600 w-input"
                                                maxLength={5000}
                                                value={values.message}
                                                required={true}
                                            ></textarea>
                                        </div>
                                        <div className="w-checkbox checkbox-field-wrapper col-span-2">
                                            <label className="w-form-label flex items-center" onClick={handleNewsletter}>
                                                <div
                                                    id="checkbox"
                                                    className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${newsletterCheck ? "w--redirected-checked" : undefined}`}
                                                ></div>
                                                {messages["subscribeNewsletter"]}
                                            </label>
                                        </div>
                                        <button type="submit" className="col-span-2 md:col-span-1 btn-primary w-button">
                                            {isLoading ? <Spinner radius maxHeight="40px" color="var(--neutral-100)" /> : formData.error ? messages["error"] : messages["sendButton"]}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="success-message w-form-done flex w-full justify-center items-center">
                                <div className="flex flex-col w-full items-center">
                                    <BsCheckCircle className="mr-2" style={{ fontSize: 28 }} />
                                    <div className="text-[24px] leading-[1.417em] font-bold text-neutral-800 mg-bottom-8px">{messages["successTitle"]}</div>
                                    <div>
                                        {messages["successMessage"]}
                                        {!!newsletterCheck && messages["successNewsletter"]}. <br />
                                        {messages["successFooter"]}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SlideFromBottom>
        </>
    );
};
