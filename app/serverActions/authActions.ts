"use server";
import { hash } from "bcrypt";
import { SignupFormData } from "../types/sfn/auth";
import { getTokenExpiration } from "../lib/constantes";
import { transporter } from "../lib/nodemailer";
import { SanityServerClient as client } from "../lib/sanity.clientServer";
import { getActivateToken, isStrongPassword, isValidEmail, replaceInString } from "../lib/utils";

export const handleSignup = async (formData: SignupFormData, mailMessages: any) => {
    const email = formData.email.toLowerCase().trim();
    const password1 = formData.password1.trim();
    const password2 = formData.password2.trim();
    const name = formData.name.trim();

    if (!email || !password1 || !password2 || !name) {
        return { error: "fillAllFields", status: 400 };
    }

    const existingUser = await client.fetch(`*[_type == "user" && email == $email]`, {
        email: email,
    });

    if (existingUser.length > 0) {
        if (existingUser[0].isActive) return { error: "emailExist", status: 400 };
        else {
            const updatedUser = await updateUserActivateToken(existingUser[0]._id);
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

        const user = await client.create({
            _type: "user",
            name: name,
            email: email,
            password,
            isActive: false,
            activateToken,
            tokenExpiration,
        });
        await sendActivationEmail(user, mailMessages);
    } catch (error: any) {
        return { error: "error500", status: 500 };
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
    const message = await transporter.sendMail({
        from: "Start French Now <nicolas@startfrenchnow.com>",
        to: user.email,
        html: body,
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
    await transporter.sendMail({
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
