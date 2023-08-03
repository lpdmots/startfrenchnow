import nodemailer from "nodemailer";

const emailYoh = process.env.EMAILYOH;
const emailNico = process.env.EMAILNICO;
const pass = process.env.EMAIL_PASS;
const email = process.env.EMAIL;

export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: email,
        pass,
    },
});

export const getMailOptions = (mailTo) => {
    const emailPro = mailTo === "yohann" ? emailYoh : emailNico;
    return { from: email, to: emailPro };
};
