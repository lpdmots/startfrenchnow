import React, { FormEvent, useState } from "react";
import { subscribeNewsletter } from "../../lib/apiNavigation";

interface StatusProps {
    pending: boolean;
    error: boolean;
    success: boolean;
}

const initialStatus: StatusProps = { pending: false, error: false, success: false };

function useSubscribe() {
    const [email, setEmail] = useState<string>("");
    const [status, setStatus] = useState(initialStatus);
    const { pending, error, success } = status;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus((state) => ({ ...state, pending: true }));
        try {
            await subscribeNewsletter(email);
            setStatus((state) => ({ ...state, success: true }));
        } catch (error: any) {
            setStatus((state) => ({ ...state, error: true }));
        }
    };

    return { handleChange, handleSubmit, pending, error, success, email };
}

export default useSubscribe;
