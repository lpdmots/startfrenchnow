// app/lib/claimPendingPurchases.ts
import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";

type PendingBenefit = {
    benefitType: "lessons" | "credits" | "permission";
    referenceKey: string;
    creditAmount?: number;
    accessDuration?: number | null;
};

type PendingItem = {
    quantity?: number;
    referenceKey?: string;
    benefitsSnapshot?: PendingBenefit[];
};

type PendingPurchase = {
    _id: string;
    stripeCustomerId?: string;
    purchasedAt?: string;
    items?: PendingItem[];
};

type UserDoc = {
    _id: string;
    email: string;
    isActive?: boolean;
    stripeCustomerId?: string;
    permissions?: Array<{ _key: string; referenceKey: string; grantedAt?: string; expiresAt?: string | null }>;
    credits?: Array<{ _key: string; referenceKey: string; totalCredits?: number; remainingCredits?: number }>;
    lessons?: Array<{ _key: string; eventType: string; totalPurchasedMinutes?: number }>;
};

function toLowerEmail(email: string) {
    return email.trim().toLowerCase();
}

function addDaysIso(baseIso: string, days: number) {
    const d = new Date(baseIso);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString();
}

function maxIso(a?: string | null, b?: string | null) {
    if (!a) return b || null;
    if (!b) return a || null;
    return new Date(a).getTime() >= new Date(b).getTime() ? a : b;
}

export async function claimPendingPurchases(params: { email: string; userId: string }) {
    const email = toLowerEmail(params.email);
    const userId = params.userId;

    // 1) Récup user (avec _key des arrays)
    const user = (await client.fetch(
        `*[_type=="user" && _id==$userId][0]{
    _id, email, isActive, stripeCustomerId,
    permissions[]{_key, referenceKey, grantedAt, expiresAt},
    credits[]{_key, referenceKey, totalCredits, remainingCredits},
    lessons[]{_key, eventType, totalPurchasedMinutes}
    }`,
        { userId },
    )) as UserDoc | null;

    if (!user?.email) {
        return { claimed: false, reason: "user_not_found" as const, assignedPurchases: 0 };
    }

    if ((user as any).isActive !== true) {
        return { claimed: false, reason: "user_not_active" as const, assignedPurchases: 0 };
    }

    // 2) Récup pending purchases “paid” pour cet email
    const pendings = (await client.fetch(
        `*[_type=="pendingPurchase"
        && status=="paid"
        && email==$email
        && !defined(assignedTo)
      ]{
        _id, stripeCustomerId, purchasedAt,
        items[]{
          quantity, referenceKey,
          benefitsSnapshot[]{benefitType, referenceKey, creditAmount, accessDuration}
        }
      }`,
        { email },
    )) as PendingPurchase[];

    if (!pendings?.length) {
        return { claimed: false, reason: "nothing_to_claim" as const, assignedPurchases: 0 };
    }

    // 3) Prépare agrégations (1 patch user max)
    const existingPerms = user.permissions || [];
    const existingCredits = user.credits || [];
    const existingLessons = user.lessons || [];

    const permByRef = new Map(existingPerms.map((p) => [p.referenceKey, p]));
    const creditByRef = new Map(existingCredits.map((c) => [c.referenceKey, c]));
    const lessonByType = new Map(existingLessons.map((l) => [l.eventType, l]));

    const creditsToAdd = new Map<string, number>();
    const lessonsToAdd = new Map<string, number>();

    // pour permissions : on veut soit permanent (expiresAt=null), soit une date max
    const permsDesired = new Map<string, { grantedAt: string; expiresAt: string | null }>();

    // pick stripeCustomerId (si user en a pas encore)
    const pendingStripeCustomerId = pendings.find((p) => p.stripeCustomerId)?.stripeCustomerId;

    for (const p of pendings) {
        const purchasedAt = p.purchasedAt && !isNaN(Date.parse(p.purchasedAt)) ? p.purchasedAt : new Date().toISOString();
        for (const item of p.items || []) {
            const qty = Number(item.quantity || 1) || 1;
            for (const b of item.benefitsSnapshot || []) {
                const refKey = b.referenceKey;
                if (!refKey) continue;

                if (b.benefitType === "credits") {
                    const amount = Number(b.creditAmount || 0) * qty;
                    if (amount > 0) creditsToAdd.set(refKey, (creditsToAdd.get(refKey) || 0) + amount);
                }

                if (b.benefitType === "lessons") {
                    const minutes = Number(b.creditAmount || 0) * qty;
                    if (minutes > 0) lessonsToAdd.set(refKey, (lessonsToAdd.get(refKey) || 0) + minutes);
                }

                if (b.benefitType === "permission") {
                    const durationDays = b.accessDuration; // null => permanent
                    const existing = permsDesired.get(refKey);

                    // permanent gagne toujours
                    if (durationDays == null) {
                        permsDesired.set(refKey, { grantedAt: existing?.grantedAt || purchasedAt, expiresAt: null });
                        continue;
                    }

                    const addedDays = Number(durationDays || 0) * qty;
                    if (addedDays <= 0) continue;

                    const candidateExpiry = addDaysIso(purchasedAt, addedDays);

                    // si déjà permanent désiré, on ne touche pas
                    if (existing?.expiresAt === null) continue;

                    const mergedExpiry = maxIso(existing?.expiresAt || null, candidateExpiry);
                    permsDesired.set(refKey, { grantedAt: existing?.grantedAt || purchasedAt, expiresAt: mergedExpiry });
                }
            }
        }
    }

    // 4) Prépare patch user (set / append)
    const setObj: Record<string, any> = {};
    const appendCredits: any[] = [];
    const appendLessons: any[] = [];
    const appendPerms: any[] = [];

    // credits
    for (const [refKey, add] of creditsToAdd.entries()) {
        const existing = creditByRef.get(refKey);
        if (existing) {
            const k = existing._key;
            const total = Number(existing.totalCredits || 0) + add;
            const remaining = Number(existing.remainingCredits || 0) + add;
            setObj[`credits[_key=="${k}"].totalCredits`] = total;
            setObj[`credits[_key=="${k}"].remainingCredits`] = remaining;
        } else {
            appendCredits.push({ referenceKey: refKey, totalCredits: add, remainingCredits: add });
        }
    }

    // lessons
    for (const [eventType, addMin] of lessonsToAdd.entries()) {
        const existing = lessonByType.get(eventType);
        if (existing) {
            const k = existing._key;
            const total = Number(existing.totalPurchasedMinutes || 0) + addMin;
            setObj[`lessons[_key=="${k}"].totalPurchasedMinutes`] = total;
        } else {
            appendLessons.push({ eventType, totalPurchasedMinutes: addMin });
        }
    }

    // permissions
    for (const [refKey, desired] of permsDesired.entries()) {
        const existing = permByRef.get(refKey);

        // si déjà permanent dans user, rien à faire
        if (existing && !existing.expiresAt) {
            continue;
        }

        if (existing) {
            const k = existing._key;
            // si desired permanent => on écrase l’expiration
            if (desired.expiresAt === null) {
                setObj[`permissions[_key=="${k}"].grantedAt`] = existing.grantedAt || desired.grantedAt;
                setObj[`permissions[_key=="${k}"].expiresAt`] = null;
            } else {
                // prolonge : max(existing, desired)
                const merged = maxIso(existing.expiresAt || null, desired.expiresAt);
                setObj[`permissions[_key=="${k}"].grantedAt`] = existing.grantedAt || desired.grantedAt;
                setObj[`permissions[_key=="${k}"].expiresAt`] = merged;
            }
        } else {
            appendPerms.push({
                referenceKey: refKey,
                grantedAt: desired.grantedAt,
                expiresAt: desired.expiresAt, // null => permanent
            });
        }
    }

    const nowIso = new Date().toISOString();

    // 5) Transaction : patch user + patch chaque pendingPurchase
    let tx = client.transaction();

    tx = tx.patch(userId, (p) => {
        let patch = p;

        // arrays exist
        patch = patch.setIfMissing({ credits: [], lessons: [], permissions: [] });

        // stripeCustomerId
        if (!user.stripeCustomerId && pendingStripeCustomerId) {
            patch = patch.set({ stripeCustomerId: pendingStripeCustomerId });
        }

        if (Object.keys(setObj).length) patch = patch.set(setObj);
        if (appendCredits.length) patch = patch.append("credits", appendCredits);
        if (appendLessons.length) patch = patch.append("lessons", appendLessons);
        if (appendPerms.length) patch = patch.append("permissions", appendPerms);

        return patch;
    });

    for (const p of pendings) {
        tx = tx.patch(p._id, (pp) =>
            pp.set({
                status: "assigned",
                assignedTo: { _type: "reference", _ref: userId },
                assignedAt: nowIso,
            }),
        );
    }

    await tx.commit({ autoGenerateArrayKeys: true });

    return {
        claimed: true,
        assignedPurchases: pendings.length,
        added: {
            creditsKeys: Array.from(creditsToAdd.keys()),
            lessonsKeys: Array.from(lessonsToAdd.keys()),
            permissionKeys: Array.from(permsDesired.keys()),
        },
    };
}
