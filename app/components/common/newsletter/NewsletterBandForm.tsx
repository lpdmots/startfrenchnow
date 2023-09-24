"use client";
import { BsCheckCircle } from "react-icons/bs";
import useSubscribe from "../../../hooks/useSubscribe";
import Spinner from "../Spinner";

export const NewsletterBandForm = ({ formMessages }: { formMessages: any }) => {
    const { handleChange, handleSubmit, pending, error, success, email } = useSubscribe();

    return (
        <>
            {success ? (
                <div className="success-message color-neutral-100 w-form-done">
                    <div className="flex-horizontal success-message-horizontal">
                        <BsCheckCircle className="mr-2" style={{ fontSize: 28 }} />
                        <div>{formMessages["successMessage"]}</div>
                    </div>
                </div>
            ) : error ? (
                <div className="error-message w-form-fail !mt-0">
                    <div>{formMessages["errorMessage"]}</div>
                </div>
            ) : (
                <form className="form-3" onSubmit={handleSubmit}>
                    <label className="field-label">Label</label>
                    <div className="position-relative">
                        <input type="email" className="input small button-inside w-input" value={email} placeholder={formMessages["placeholder"]} onChange={handleChange} />
                        <button className="btn-primary inside-input variant small w-button min-w-36">{pending ? <Spinner radius maxHeight="40px" /> : formMessages["button"]}</button>
                    </div>
                </form>
            )}
        </>
    );
};
