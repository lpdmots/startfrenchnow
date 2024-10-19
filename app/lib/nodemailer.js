import nodemailer from "nodemailer";

const emailYoh = process.env.EMAILYOH;
const emailNico = process.env.EMAILNICO;
const pass = process.env.EMAIL_PASS;

export const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465, // Utilise 465 pour SSL ou 587 pour TLS
    secure: true, // true pour SSL (port 465), false pour TLS (port 587)
    auth: {
        user: emailYoh,
        pass,
    },
});

export const getMailOptions = (mailTo) => {
    const emailPro = mailTo === "yohann" ? emailYoh : emailNico;
    return { from: emailYoh, to: emailPro };
};
