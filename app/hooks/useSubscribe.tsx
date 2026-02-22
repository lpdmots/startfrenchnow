import React, { FormEvent, useState } from "react";
import { subscribeNewsletter } from "@/app/lib/apiNavigation";

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
    const [startedAt] = useState(() => Date.now());

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus((state) => ({ ...state, pending: true }));

        const formData = new FormData(e.currentTarget);
        const website = String(formData.get("website") ?? "");
        const startedAtFromForm = Number(formData.get("startedAt") ?? startedAt);

        try {
            await subscribeNewsletter({
                email,
                website,
                startedAt: startedAtFromForm,
            });
            setStatus((state) => ({ ...state, success: true }));
        } catch (error: any) {
            setStatus((state) => ({ ...state, error: true }));
        }
    };

    return { handleChange, handleSubmit, pending, error, success, email, startedAt };
}

export default useSubscribe;
