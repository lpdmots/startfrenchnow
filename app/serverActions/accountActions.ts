"use server";

import { authOptions } from "@/app/lib/authOptions";
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { getServerSession } from "next-auth";

export const updateAccountProfile = async (payload: { firstName?: string; lastName?: string; name?: string }) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?._id;

    if (!userId) {
        return { error: "unauthorized", status: 401 };
    }

    const firstName = String(payload?.firstName || "").trim();
    const lastName = String(payload?.lastName || "").trim();
    const name = String(payload?.name || "").trim();

    if (!name) {
        return { error: "usernameRequired", status: 400 };
    }

    try {
        await client
            .patch(userId)
            .set({
                firstName,
                lastName,
                name,
            })
            .commit();

        return { success: "updated", status: 200 };
    } catch (error: any) {
        return { error: "error500", status: 500 };
    }
};
