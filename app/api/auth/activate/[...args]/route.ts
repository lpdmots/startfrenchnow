import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { UserProps } from "@/app/types/sfn/auth";
import { getActivateToken } from "@/app/lib/utils";
import { getTokenExpiration } from "@/app/lib/constantes";
import { sendActivationEmail, sendWelcomeEmail } from "@/app/serverActions/authActions";
import { claimPendingPurchases } from "@/app/lib/claimPendingPurchases";
import { activationMailMessagesByLocale, buildWelcomeSystemNotification, resolveAuthLocale, welcomeMailMessagesByLocale } from "@/app/lib/authMailMessages";
import { appendSystemNotification } from "@/app/lib/systemNotifications";

export const dynamic = "force-dynamic";


interface Props {
    params: { args: string[] };
}

export async function GET(_request: NextRequest, { params }: Props) {
    const { args } = params;
    const token = args.at(0);
    const localeFromUrl = args.at(1);
    const locale = resolveAuthLocale(localeFromUrl);
    if (!token) {
        return redirect(`/${locale}/auth/error/no-user`);
    }

    const userQuery: string = '*[_type == "user" && activateToken == $token][0]';
    const user = (await (client as any).fetch(userQuery, { token })) as UserProps | null;

    if (!user) {
        return redirect(`/${locale}/auth/error/no-user`);
    }

    if (user.isActive) {
        return redirect(`/${locale}/auth/error/already-active`);
    }

    if (user.tokenExpiration < new Date(Date.now()).toISOString()) {
        const updatedUser = await client.patch(user._id).set({ activateToken: getActivateToken(), tokenExpiration: getTokenExpiration() }).commit();
        await sendActivationEmail(updatedUser, activationMailMessagesByLocale[locale]);
        return redirect(`/${locale}/auth/error/expired`);
    }

    await client.patch(user._id).set({ isActive: true }).commit();

    try {
        await claimPendingPurchases({ email: user.email, userId: user._id });
    } catch (e) {
        console.error("claimPendingPurchases (activate) failed:", e);
    }

    try {
        await sendWelcomeEmail(user, welcomeMailMessagesByLocale[locale]);
    } catch (e) {
        console.error("sendWelcomeEmail (activate) failed:", e);
    }
    try {
        await appendSystemNotification(user._id, buildWelcomeSystemNotification(locale, user.name));
    } catch (e) {
        console.error("appendSystemNotification (activate) failed:", e);
    }

    return redirect(`/${locale}/auth/activated`);
}
