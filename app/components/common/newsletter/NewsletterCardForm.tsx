"use client";
import { BsCheckCircle } from "react-icons/bs";
import useSubscribe from "../../../hooks/useSubscribe";
import Spinner from "../Spinner";

export const NewsletterCardForm = ({ formMessages }: { formMessages: any }) => {
    const { handleChange, handleSubmit, pending, error, success, email } = useSubscribe();

    return (
        <>
            {success ? (
                <div className="success-message w-form-done">
                    <div className="flex-horizontal success-message-vertical">
                        <BsCheckCircle style={{ fontSize: 28 }} />
                        <div className="ml-2">{formMessages["successMessage"]}</div>
                    </div>
                </div>
            ) : error ? (
                <div className="error-message w-form-fail">
                    <div>{formMessages["errorMessage"]}</div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label className="field-label-3">Email Address</label>
                    <input type="email" className="input small mg-bottom-16px w-input" value={email} onChange={handleChange} placeholder={formMessages["placeholder"]} id="email" />
                    <button type="submit" className="btn-primary full-width w-button  min-w-36">
                        {pending ? <Spinner radius maxHeight="40px" /> : formMessages["button"]}
                    </button>
                </form>
            )}
        </>
    );
};
