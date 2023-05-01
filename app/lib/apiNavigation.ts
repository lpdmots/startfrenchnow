import { ContactForm } from "@/app/types/sfn/contact";

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
    fetch("/api/subscribers", {
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

export const getSubscriber = async (email: string) =>
    fetch(`/api/subscribers/${email}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    }).then((res) => {
        if (!res.ok) throw new Error("Failed to subscribe");
        return res.json();
    });

export const updateSubscriber = async (data: any, subscriberId: string) =>
    fetch(`/api/subscribers/${subscriberId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify(data),
    }).then((res) => {
        if (!res.ok) throw new Error("Failed to update subscriber");
        return res.json();
    });
