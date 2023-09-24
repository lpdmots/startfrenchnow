import { ContactForm } from "@/app/types/sfn/contact";

const NEXTAUTH_URL = process.env.NEXTAUTH_URL;

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

export const getSubscriber = async (email: string) => {
    return fetch(`/api/subscribers/${email}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    }).then((res) => {
        if (!res.ok) throw new Error("Failed to get subscriber");
        return res.json();
    });
};

export const getSubscriberFromServer = async (email: string) => {
    return fetch(`${NEXTAUTH_URL}/api/subscribers/${email}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    }).then((res) => {
        if (!res.ok) throw new Error("Failed to get subscriber");
        return res.json();
    });
};

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
