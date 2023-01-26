import { ContactForm } from "../app/types/contact";

export const sendContactForm = async (data: ContactForm) =>
    fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    }).then((res) => {
        if (!res.ok) throw new Error("Failed to send message");
        return res.json();
    });

export const subscribeNewsletter = async (data: string) =>
    fetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    }).then((res) => {
        console.log({ res });
        if (!res.ok) throw new Error("Failed to subscribe");
        return res.json();
    });
