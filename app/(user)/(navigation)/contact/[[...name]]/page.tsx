"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, Dispatch, FormEvent, MouseEvent, SetStateAction, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { sendContactForm, subscribeNewsletter } from "@/app/lib/apiNavigation";
import Spinner from "../../../../components/common/Spinner";
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

function Contact({ params: { name: nameList } }: { params: { name: string } }) {
    const name = ["yohann", "nicolas"].includes(nameList?.[0]) && nameList?.[0];
    const [formData, setFormData] = useState<FormDataProps>({ ...initState, mailTo: name ? name : "yohann" });
    const mailTo = formData.mailTo;

    const handleMailTo = (name: string) => {
        setFormData((state) => ({ ...state, mailTo: name }));
    };

    return (
        <div className="page-wrapper">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="inner-container _500px---mbl center">
                            <div className="mg-bottom-60px">
                                <div className="text-center---tablet">
                                    <div className="w-layout-grid grid-2-columns title-and-paragraph v2">
                                        <div className="flex-horizontal start flex-wrap center---tablet">
                                            <h1 className="display-1 color-neutral-800 mg-bottom-0 heading-span-secondary-2 ml-4">Contact us</h1>
                                        </div>
                                        <div className="inner-container _560px">
                                            <p className="text-center md:text-right mg-bottom-0">Do not hesitate to contact us if you have any questions. We will be happy to answer you.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-layout-grid grid-2-columns blog-left-sidebar">
                                <div className="sticky-top _48px-top sticky-tbl">
                                    <div className="inner-container _380">
                                        <div className="text-center---tablet">
                                            <div className="card categories-card">
                                                <div className="flex items-center">
                                                    <Image src="/images/envelope-icon-large-paperfolio-webflow-template.svg" height={34} width={46} alt="envelope icon" className="mb-6 mr-4" />
                                                    <p>Who would you like to contact?</p>
                                                </div>
                                                <div className="w-dyn-list">
                                                    <div role="list" className="collection-list categories w-dyn-items">
                                                        <div role="listitem" className="w-dyn-item w-full" onClick={() => handleMailTo("yohann")}>
                                                            <div className={`blog-categories-item-wrapper w-full ${mailTo === "yohann" && "current pointer-events-none"}`}>
                                                                <p className="text-lg mb-0 w-full text-center">Yohann</p>
                                                                <p className="bs color-neutral-500 mb-0 w-full text-center italic">Courses and video content</p>
                                                            </div>
                                                        </div>
                                                        <div role="listitem" className="w-dyn-item w-full" onClick={() => handleMailTo("nicolas")}>
                                                            <div className={`blog-categories-item-wrapper w-full ${mailTo === "nicolas" && "current pointer-events-none"}`}>
                                                                <p className="text-lg mb-0 w-full text-center">Nicolas</p>
                                                                <p className="bs color-neutral-500 mb-0 w-full text-center italic">Stories and website content</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid gap-12">
                                    <ContactForm formData={formData} setFormData={setFormData} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;

const ContactForm = ({ formData, setFormData }: { formData: FormDataProps; setFormData: Dispatch<SetStateAction<FormDataProps>> }) => {
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
                                            <p className="contact-link underline decoration-dotted">Email to {mailTo.charAt(0).toUpperCase() + mailTo.slice(1)}</p>
                                        </Link>
                                    </SimpleButton>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="w-layout-grid grid-2-columns form">
                                        <div className="position-relative col-span-2 md:col-span-1">
                                            <label htmlFor="name">Name</label>
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
                                            <label htmlFor="email">Email*</label>
                                            <input
                                                onChange={handleChange}
                                                type="email"
                                                className="input icon-input email-icon w-input"
                                                name="email"
                                                placeholder="adress@email.com"
                                                value={values.email}
                                                id="email"
                                                required={true}
                                                maxLength={256}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label htmlFor="subject">Subject*</label>
                                            <input
                                                onChange={handleChange}
                                                value={values.subject}
                                                type="text"
                                                className="input w-input"
                                                name="subject"
                                                placeholder="Select"
                                                id="subject"
                                                maxLength={256}
                                                required={true}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label htmlFor="message">Message*</label>
                                            <textarea
                                                onChange={handleChange}
                                                id="message"
                                                name="message"
                                                placeholder="Please write your message..."
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
                                                Subscribe to our newsletter
                                            </label>
                                        </div>
                                        <button type="submit" className="col-span-2 md:col-span-1 btn-primary w-button">
                                            {isLoading ? <Spinner radius maxHeight="40px" color="var(--neutral-100)" /> : formData.error ? "Oops! Something went wrong..." : "Send Message"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="success-message w-form-done">
                                <div>
                                    <BsCheckCircle className="mr-2" style={{ fontSize: 28 }} />
                                    <div className="heading-h3-size mg-bottom-8px">Thank you</div>
                                    <div>
                                        Your message has been submitted{!!newsletterCheck && " and you have joined our newsletter"}. <br />
                                        We will get back to you as soon as possible.
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
