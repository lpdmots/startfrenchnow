import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServer";
import { UserProps } from "@/app/types/sfn/auth";
import { getActivateToken } from "@/app/lib/utils";
import { getTokenExpiration } from "@/app/lib/constantes";
import { sendActivationEmail } from "@/app/serverActions/authActions";

interface Props {
    params: { args: string[] };
}

const mailMessages = {
    subject: "Please activate your account and Start French Now",
    body: "<p>Bonjour USERNAME,</p> <br><p>Thank you for signing up to Start French Now.</p> <p>Please click <span><a href='DOMAINE/api/auth/activate/ACTIVATETOKEN/en'>here</a></span> to activate your account.</p><br> <p>Nous vous souhaitons un excellent apprentissage du français.</p><br> <p>Best regards,</p> <p>Yohann et Nicolas</p>",
};

export async function GET(_request: NextRequest, { params }: Props) {
    const { args } = params;
    const token = args.at(0);
    const locale = args.at(1);

    const user: UserProps = await client.fetch('*[_type == "user" && activateToken == $token][0]', { token });

    if (!user) {
        return redirect(`/${locale}/auth/error/no-user`);
    }

    if (user.isActive) {
        return redirect(`/${locale}/auth/error/already-active`);
    }

    if (user.tokenExpiration < new Date(Date.now()).toISOString()) {
        const updatedUser = await client.patch(user._id).set({ activateToken: getActivateToken(), tokenExpiration: getTokenExpiration() }).commit();
        await sendActivationEmail(updatedUser, mailMessages);
        return redirect(`/${locale}/auth/error/expired`);
    }

    await client.patch(user._id).set({ isActive: true }).commit();
    redirect(`/${locale}/auth/activated`);
}
