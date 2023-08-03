import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServer";
import { UserProps } from "@/app/types/sfn/auth";
import { getActivateToken } from "@/app/lib/utils";
import { getTokenExpiration } from "@/app/lib/constantes";
import { sendActivationEmail } from "@/app/lib/serverActions";

interface Props {
    params: {
        token: string;
    };
}

export async function GET(_request: NextRequest, { params }: Props) {
    const { token } = params;

    const user: UserProps = await client.fetch('*[_type == "user" && activateToken == $token][0]', { token });

    if (!user) {
        return redirect("/auth/error/no-user");
    }

    if (user.isActive) {
        return redirect("/auth/error/already-active");
    }

    if (user.tokenExpiration < new Date(Date.now()).toISOString()) {
        console.log("Périmé");
        const updatedUser = await client.patch(user._id).set({ activateToken: getActivateToken(), tokenExpiration: getTokenExpiration() }).commit();
        await sendActivationEmail(updatedUser);
        return redirect("/auth/error/expired");
    }

    await client.patch(user._id).set({ isActive: true }).commit();
    redirect("/auth/activated");
}
