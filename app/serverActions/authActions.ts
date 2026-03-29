"use server";
import { hash } from "bcrypt";
import { SignupFormData } from "../types/sfn/auth";
import { getTokenExpiration } from "../lib/constantes";
import { transporterNico } from "../lib/nodemailer";
import { SanityServerClient as client } from "../lib/sanity.clientServerDev";
import { getActivateToken, isStrongPassword, isValidEmail, replaceInString } from "../lib/utils";

export const handleSignup = async (formData: SignupFormData, mailMessages: any, antiBot?: { website?: string; startedAt?: number }) => {
    const debugId = `signup-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const rawEmail = String(formData?.email || "");
    const email = rawEmail.toLowerCase().trim();
    console.info("[AuthSignup] Start", { debugId, email });

    // Anti-bot (best effort)
    if (antiBot?.website && antiBot.website.trim() !== "") {
        // On répond comme si c'était OK (évite de donner un signal)
        console.warn("[AuthSignup] Honeypot filled, blocking signup attempt", { debugId, email });
        return { success: "ok", status: 200 };
    }

    const deltaMs = Date.now() - Number(antiBot?.startedAt || 0);
    if (Number.isFinite(deltaMs) && deltaMs > 0 && deltaMs < 1500) {
        console.warn("[AuthSignup] Submission blocked: submittedTooFast", { debugId, email, deltaMs });
        return { error: "submittedTooFast", status: 429 };
    }

    const password1 = formData.password1.trim();
    const password2 = formData.password2.trim();
    const name = formData.name.trim();

    if (!email || !password1 || !password2 || !name) {
        return { error: "fillAllFields", status: 400 };
    }

    const existingUser = await client.fetch(`*[_type == "user" && email == $email]`, {
        email: email,
    });
    console.info("[AuthSignup] Signup request received", { debugId, email, hasExistingUser: existingUser.length > 0 });

    if (existingUser.length > 0) {
        if (existingUser[0].isActive) return { error: "emailExist", status: 400 };
        else {
            const updatedUser = await updateUserActivateToken(existingUser[0]._id);
            console.info("[AuthSignup] Existing inactive user, resending activation email", { debugId, email, userId: updatedUser?._id });
            await sendActivationEmail(updatedUser, mailMessages);
            return { success: "notActivated", status: 200 };
        }
    }

    if (!isValidEmail(email)) {
        return { error: "emailInvalid", status: 400 };
    }

    if (password1 !== password2) {
        return { error: "passwordMismatch", status: 400 };
    }

    if (!isStrongPassword(password1)) {
        return { error: "passwordNotConform", status: 400 };
    }

    try {
        const password = await hash(password1, 12);
        const activateToken = getActivateToken();
        const tokenExpiration = getTokenExpiration();

        const createdUser = await client.create({
            _type: "user",
            name: name,
            email: email,
            password,
            isActive: false,
            activateToken,
            tokenExpiration,
        });
        console.info("[AuthSignup] User created, sending activation email", { debugId, email, userId: createdUser?._id });
        await sendActivationEmail(createdUser, mailMessages);
        console.info("[AuthSignup] Activation email send request completed", { debugId, email, userId: createdUser?._id });
    } catch (error: any) {
        const err = error instanceof Error ? { message: error.message, stack: error.stack } : error;
        console.error("[AuthSignup] Signup failed", { debugId, email, error: err });
        return { error: "error500", status: 500 };
    }

    if (formData.subscribeNewsletter) {
        // NE BLOQUE PAS le signup si MailerLite échoue
        subscribeMailerLite(email).catch((err) => console.error("MailerLite subscribe error:", err));
    }

    return { success: "Account created. Please check your email to activate it.", status: 201 };
};

export const sendNewActivationLink = async (email: string, mailMessages: any) => {
    const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email: email.trim() });
    if (!user) return { error: "No user found with this email address.", status: 400 };

    try {
        const updatedUser = await updateUserActivateToken(user._id);
        await sendActivationEmail(updatedUser, mailMessages);
        return { success: "A new e-mail has been sent", status: 200 };
    } catch (error: any) {
        return { error: "Something went wrong, please contact us.", status: 500 };
    }
};

export const sendActivationEmail = async (user: any, mailMessages: any) => {
    const body = replaceInString(mailMessages.body, { USERNAME: user.name, DOMAIN: process.env.NEXTAUTH_URL, ACTIVATETOKEN: user.activateToken });
    console.info("[ActivationEmail] Sending", {
        to: user.email,
        hasSubject: Boolean(mailMessages?.subject),
        hasBody: Boolean(mailMessages?.body),
        domain: process.env.NEXTAUTH_URL,
    });
    const info = await transporterNico.sendMail({
        from: "Start French Now <nicolas@startfrenchnow.com>",
        to: user.email,
        html: `<html><div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">${body}<div style="display: flex; align-items: center; margin-top: 20px;">
    <img src="https://www.startfrenchnow.com/images/yoh-coussot-red-small.png" alt="Yohann Coussot" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; margin-right: 15px;" />

    <p style="margin: 0;">
      Yohann Coussot<br/>
      Professeur de français<br/>
      <a href="https://www.startfrenchnow.com" style="color: #1a73e8; text-decoration: none;">www.startfrenchnow.com</a>
    </p>
  </div></div></html>`,
        subject: mailMessages.subject,
    });
    console.info("[ActivationEmail] SMTP result", {
        to: user.email,
        messageId: (info as any)?.messageId,
        accepted: (info as any)?.accepted,
        rejected: (info as any)?.rejected,
        response: (info as any)?.response,
    });
};

export const sendWelcomeEmail = async (user: any, mailMessages: any) => {
    const body = replaceInString(mailMessages.body, { USERNAME: user.name, DOMAIN: process.env.NEXTAUTH_URL });
    await transporterNico.sendMail({
        from: "Start French Now <nicolas@startfrenchnow.com>",
        to: user.email,
        html: `<html><div style="font-family: Arial, sans-serif; font-size: 16px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto;">${body}<div style="display: flex; align-items: center; margin-top: 20px;">
    <img src="https://www.startfrenchnow.com/images/yoh-coussot.png" alt="Yohann Coussot" style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; margin-right: 12px;" />

    <p style="margin: 0;">
      Yohann Coussot
    </p>
  </div></div></html>`,
        subject: mailMessages.subject,
    });
};

export const updateUserActivateToken = async (id: string) => {
    const activateToken = getActivateToken();
    const tokenExpiration = getTokenExpiration();
    return client.patch(id).set({ activateToken, tokenExpiration }).commit();
};

export const sendNewPasswordLink = async (email: string, mailMessages: any) => {
    const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email: email.trim() });
    if (!user) return { error: "No user found with this email address.", status: 400 };

    try {
        const updatedUser = await updateUserPasswordToken(user._id);
        await sendPasswordEmail(updatedUser, mailMessages);
        return { success: "A new e-mail has been sent", status: 200 };
    } catch (error: any) {
        return { error: "Something went wrong, please contact us.", status: 500 };
    }
};

export const updateUserPasswordToken = async (id: string) => {
    const resetPasswordToken = getActivateToken();
    const resetPasswordExpiration = getTokenExpiration();
    return client.patch(id).set({ resetPasswordToken, resetPasswordExpiration }).commit();
};

export const sendPasswordEmail = async (user: any, mailMessages: any) => {
    const body = replaceInString(mailMessages.body, { USERNAME: user.name, DOMAIN: process.env.NEXTAUTH_URL, PASSWORDTOKEN: user.resetPasswordToken });
    await transporterNico.sendMail({
        from: "Start French Now <nicolas@startfrenchnow.com>",
        to: user.email,
        html: body,
        subject: mailMessages.subject,
    });
};

export const updateUserPassword = async (password: string, token: string) => {
    const user = await client.fetch(`*[_type == "user" && resetPasswordToken == $token && resetPasswordExpiration > $date][0]`, { token, date: new Date().toISOString() });

    if (!user) return { error: "Invalid or expired token.", status: 400 };
    if (!isStrongPassword(password)) {
        return { error: "Password must have at least 8 characters, including uppercase, lowercase, numbers, and special characters.", status: 400 };
    }

    try {
        const hashedPassword = await hash(password, 12);
        await client.patch(user._id).set({ resetPasswordToken: undefined, resetPasswordExpiration: undefined, password: hashedPassword }).commit();
        return { success: "Password updated.", status: 200 };
    } catch (error: any) {
        return { error: "Something went wrong, please contact us.", status: 500 };
    }
};

const mailerToken = process.env.MAILERLITE_API_ACCESS_TOKEN;
const MAILERLITE_GROUP_ID = "79392045100173113";

async function subscribeMailerLite(email: string) {
    if (!mailerToken) throw new Error("Missing MAILERLITE_API_ACCESS_TOKEN");

    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${mailerToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({ email, groups: [MAILERLITE_GROUP_ID] }),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "MailerLite subscribe failed");
    }
}
