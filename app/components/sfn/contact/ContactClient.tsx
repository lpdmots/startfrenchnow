"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import Image from "next/image";
import Link from "next-intl/link";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { sendContactForm, subscribeNewsletter } from "@/app/lib/apiNavigation";
import Spinner from "@/app/components/common/Spinner";
import SimpleButton from "@/app/components/animations/SimpleButton";

const initialValue = {
    name: "",
    email: "",
    subject: "",
    message: "",
    mailTo: "",
};

interface FormDataProps {
    values: typeof initialValue;
    isLoading: boolean;
    error: boolean;
    mailTo: string;
    newsletterCheck: boolean;
}

const initState = { values: initialValue, isLoading: false, error: false, mailTo: "yohann", newsletterCheck: false };

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
                <div className="inner-container _380">
                    <div className="text-center---tablet">
                        <div className="card categories-card">
                            <div className="flex items-center">
                                <Image src="/images/envelope-icon-large-paperfolio-webflow-template.svg" height={34} width={46} alt="envelope icon" className="mb-6 mr-4" />
                                <p>{messages["contactPrompt"]}</p>
                            </div>
                            <div className="w-dyn-list">
                                <div role="list" className="collection-list categories w-dyn-items">
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
                await subscribeNewsletter(values.email);
            }

            setFormData({ ...initState, mailTo });
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
                <div className="width-100 _100---tablet">
                    <div className="card form w-form">
                        {!submitted ? (
                            <>
                                <div className="flex">
                                    <SimpleButton>
                                        <Link href={`mailto:${mailTo}@startfrenchnow.com`} className="text-decoration-none w-inline-block mb-2">
                                            <p className="contact-link underline decoration-dotted">
                                                {messages["emailTo"]}
                                                {mailTo.charAt(0).toUpperCase() + mailTo.slice(1)}
                                            </p>
                                        </Link>
                                    </SimpleButton>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="w-layout-grid grid-2-columns form">
                                        <div className="position-relative col-span-2 md:col-span-1">
                                            <label htmlFor="name">{messages["nameLabel"]}</label>
                                            <input
                                                onChange={handleChange}
                                                value={values.name}
                                                type="text"
                                                className="input icon-input name-icon w-input"
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
                                                className="input icon-input email-icon w-input"
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
                                                className="input w-input"
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
                                                className="text-area w-input"
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
                            <div className="success-message w-form-done">
                                <div>
                                    <BsCheckCircle className="mr-2" style={{ fontSize: 28 }} />
                                    <div className="heading-h3-size mg-bottom-8px">{messages["successTitle"]}</div>
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
