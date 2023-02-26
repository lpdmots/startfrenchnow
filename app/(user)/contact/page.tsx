"use client";
import { SlideFromBottom } from "@/app/components/animations/Slides";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, MouseEvent, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";
import { sendContactForm, subscribeNewsletter } from "../../../lib/api";
import Spinner from "../../components/common/Spinner";

const initialValue = {
    name: "",
    email: "",
    subject: "",
    message: "",
};

const initState = { values: initialValue, isLoading: false, error: false };

function Contact() {
    const [formData, setFormData] = useState(initState);
    const { values, isLoading } = formData;
    const [submitted, setSubmitted] = useState<Boolean>(false);
    const [newsletterCheck, setNewsletterCheck] = useState<Boolean>(false);

    const handleChange = ({ target }: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((state) => ({
            ...state,
            values: { ...state.values, [target.name]: target.value },
        }));
    };

    const handleNewsletter = () => {
        setNewsletterCheck((state) => !state);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setFormData((state) => ({ ...state, isLoading: true }));
        try {
            await sendContactForm(values);
            if (newsletterCheck) {
                await subscribeNewsletter(values.email);
            }

            setFormData(initState);
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
        <div className="page-wrapper">
            <div className="section hero v3 wf-section">
                <div className="container-default w-container">
                    <div className="inner-container _600px---tablet center">
                        <div className="w-layout-grid grid-2-columns contact-v1">
                            <SlideFromBottom>
                                <div className="inner-container _489px _100---tablet">
                                    <div className="text-center---tablet">
                                        <h1 className="display-1">
                                            <span className="heading-span-secondary-2">Contact</span> me
                                        </h1>
                                        <p className="mg-bottom-32px">Do not hesitate to contact me if you have any questions. I will be happy to answer you.</p>
                                    </div>
                                    <div className="inner-container _100---tablet">
                                        <div className="card contact-card !px-4 ">
                                            <Link href="mailto:hello@johncarter.com" className="text-decoration-none  w-inline-block !justify-center w-full">
                                                <div className="flex start link---icon-left justify-center items-center gap-4 w-full">
                                                    <Image src="/images/envelope-icon-large-paperfolio-webflow-template.svg" height={34} width={46} alt="envelope icon" />
                                                    <div className="contact-link">yohann@startfrenchnow.com</div>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </SlideFromBottom>
                            <SlideFromBottom delay={0.4}>
                                <div className="inner-container _665px width-100 _100---tablet">
                                    <div className="card form w-form">
                                        {!submitted ? (
                                            <form onSubmit={handleSubmit}>
                                                <div className="w-layout-grid grid-2-columns form">
                                                    <div className="position-relative">
                                                        <label htmlFor="name">Name</label>
                                                        <input
                                                            onChange={handleChange}
                                                            type="text"
                                                            className="input icon-input name-icon w-input"
                                                            name="name"
                                                            placeholder="John Doe"
                                                            id="name"
                                                            maxLength={256}
                                                        />
                                                    </div>
                                                    <div className="position-relative">
                                                        <label htmlFor="email">Email*</label>
                                                        <input
                                                            onChange={handleChange}
                                                            type="email"
                                                            className="input icon-input email-icon w-input"
                                                            name="email"
                                                            placeholder="adress@email.com"
                                                            id="email"
                                                            required={true}
                                                            maxLength={256}
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label htmlFor="subject">Subject*</label>
                                                        <input
                                                            onChange={handleChange}
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
                                                            required={true}
                                                        ></textarea>
                                                    </div>
                                                    <div className="w-checkbox checkbox-field-wrapper col-span-2">
                                                        <label className="w-form-label flex items-center" onClick={handleNewsletter}>
                                                            <div
                                                                id="checkbox"
                                                                className={`w-checkbox-input w-checkbox-input--inputType-custom checkbox ${newsletterCheck ? "w--redirected-checked" : undefined}`}
                                                            ></div>
                                                            Subscribe to my newsletter
                                                        </label>
                                                    </div>
                                                    <button type="submit" className="col-span-2 md:col-span-1 btn-primary w-button">
                                                        {isLoading ? <Spinner radius maxHeight="40px" /> : formData.error ? "Oops! Something went wrong..." : "Send Message"}
                                                    </button>
                                                </div>
                                            </form>
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
