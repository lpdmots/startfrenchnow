"use client";
import { BsCheckCircle } from "react-icons/bs";
import useSubscribe from "../../../hooks/useSubscribe";
import Spinner from "../Spinner";

export const NewsLetterForm = ({ formMessages }: { formMessages: any }) => {
    const { handleChange, handleSubmit, pending, error, success, email } = useSubscribe();

    return (
        <>
            {success ? (
                <div className="success-message text-left w-form-done">
                    <div className="flex-horizontal success-message-horizontal items-center">
                        <BsCheckCircle className="mr-2" style={{ fontSize: 28 }} />
                        <div>{formMessages["successMessage"]}</div>
                    </div>
                </div>
            ) : error ? (
                <div className="error-message w-form-fail">
                    <div>{formMessages["errorMessage"]}</div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label className="field-label">Label</label>
                    <div className="position-relative">
                        <input type="email" className="input button-inside w-input" value={email} placeholder={formMessages["placeholder"]} id="Email" onChange={handleChange} />
                        <button type="submit" className="btn-primary inside-input default w-button" style={{ minWidth: 145 }}>
                            {pending ? <Spinner radius maxHeight="40px" /> : formMessages["button"]}
                        </button>
                    </div>
                </form>
            )}
        </>
    );
};
