"use server";
import { hash } from "bcrypt";
import { SignupFormData } from "../types/sfn/auth";
import { getTokenExpiration } from "./constantes";
import { transporter } from "./nodemailer";
import { SanityServerClient as client } from "./sanity.clientServer";
import { getActivateToken, isStrongPassword, isValidEmail } from "./utils";

export const handleSignup = async (formData: SignupFormData) => {
    const email = formData.email.toLowerCase().trim();
    const password1 = formData.password1.trim();
    const password2 = formData.password2.trim();
    const name = formData.name.trim();

    if (!email || !password1 || !password2 || !name) {
        return { error: "Please fill in all fields", status: 400 };
    }

    const existingUser = await client.fetch(`*[_type == "user" && email == $email]`, {
        email: email,
    });

    if (existingUser.length > 0) {
        if (existingUser[0].isActive) return { error: "An account already using this e-mail address exists.", status: 400 };
        else {
            const updatedUser = await updateUserActivateToken(existingUser[0]._id);
            await sendActivationEmail(updatedUser);
            return { success: "An email has been sent to your inbox. Please click the link when you get it.", status: 200 };
        }
    }

    if (!isValidEmail(email)) {
        return { error: "Invalid email format.", status: 400 };
    }

    if (password1 !== password2) {
        return { error: "The passwords do not match.", status: 400 };
    }

    if (!isStrongPassword(password1)) {
        return { error: "Password must have at least 8 characters, including uppercase, lowercase, numbers, and special characters.", status: 400 };
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
        await sendActivationEmail(user);
    } catch (error: any) {
        return { error: "Oops, user creation error...", status: 500 };
    }

    return { success: "Account created. Please check your email to activate it.", status: 201 };
};

export const sendNewActivationLink = async (email: string) => {
    const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email: email.trim() });
    if (!user) return { error: "No user found with this email address.", status: 400 };

    try {
        const updatedUser = await updateUserActivateToken(user._id);
        await sendActivationEmail(updatedUser);
        return { success: "A new e-mail has been sent", status: 200 };
    } catch (error: any) {
        return { error: "Something went wrong, please contact us.", status: 500 };
    }
};

export const sendActivationEmail = async (user: any) =>
    await transporter.sendMail({
        from: "Start French Now <nicolas@startfrenchnow.com>",
        to: user.email,
        html: `<p>Bonjour ${user.name},</p> <br><p>Thank you for signing up to Start French Now.</p> <p>Please click <span><a href='${process.env.NEXTAUTH_URL}/api/auth/activate/${user.activateToken}'>here</a></span> to activate your account.</p><br> <p>Je vous souhaite un excellent apprentissage du français.</p><br> <p>Best regards,</p> <p>Nicolas</p>`,
        subject: "Please activate your account",
    });

export const updateUserActivateToken = async (id: string) => {
    const activateToken = getActivateToken();
    const tokenExpiration = getTokenExpiration();
    return client.patch(id).set({ activateToken, tokenExpiration }).commit();
};

export const sendNewPasswordLink = async (email: string) => {
    const user = await client.fetch(`*[_type == "user" && email == $email][0]`, { email: email.trim() });
    if (!user) return { error: "No user found with this email address.", status: 400 };

    try {
        const updatedUser = await updateUserPasswordToken(user._id);
        await sendPasswordEmail(updatedUser);
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

export const sendPasswordEmail = async (user: any) =>
    await transporter.sendMail({
        from: "Start French Now <nicolas@startfrenchnow.com>",
        to: user.email,
        html: `<p>Bonjour ${user.name},</p> <br><p>Please click <span><a href='${process.env.NEXTAUTH_URL}/auth/reset-password/new-password/${user.resetPasswordToken}'>here</a></span> to change your password.</p><br> <p>Je vous souhaite un excellent apprentissage du français.</p><br> <p>Best regards,</p> <p>Nicolas</p>`,
        subject: "Change your password",
    });

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
