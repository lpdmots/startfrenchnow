import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { Lesson, Permission, UserProps } from "@/app/types/sfn/auth";
import { compare } from "bcrypt";
import { DefaultSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { claimPendingPurchases } from "@/app/lib/claimPendingPurchases";

declare module "next-auth" {
    interface Session {
        user: {
            alias: string[];
            _id: string;
            name: string;
            email: string;
            permissions?: Permission[];
            lessons?: Lesson[];
            hasMockExamAccess?: boolean;
            isAdmin?: boolean;
            notificationsLength: number;
        };
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        _id?: string;
        permissions?: Permission[];
        hasMockExamAccess?: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Sign in",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "hello@example.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Record<"email" | "password", string> | undefined): Promise<any | null> {
                if (!credentials?.email || !credentials.password) {
                    return null;
                }
                const user = await client.fetch('*[_type == "user" && (email == $email || name == $email)][0]', { email: credentials.email });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                // User is not active, tell them to activate
                if (!user.isActive) {
                    throw new Error("User is not active");
                }

                return {
                    _id: user._id + "",
                    email: user.email,
                    name: user.name,
                    alias: user.alias,
                    permissions: user.permissions || [],
                    lessons: user.lessons || [],
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: "/auth/signIn",
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            // --- OAuth (Google/Facebook)
            if (["google", "facebook"].includes(account?.provider || "")) {
                const email = profile?.email;

                let dbUser = await client.fetch('*[_type == "user" && email == $email][0]', { email });
                if (!dbUser) {
                    const newUser = {
                        _type: "user",
                        email: email,
                        name: profile?.name,
                        isActive: true,
                        oAuth: account?.provider,
                    };
                    dbUser = await client.create(newUser);
                }

                // Claim achats pending (safe: ta fonction refuse si isActive !== true)
                if (dbUser?.email && dbUser?._id) {
                    try {
                        await claimPendingPurchases({ email: dbUser.email, userId: dbUser._id });
                    } catch (e) {
                        console.error("claimPendingPurchases (oauth) failed:", e);
                    }
                }

                return true;
            }

            // --- Credentials
            if (account?.provider === "credentials") {
                const u = user as any; // vient de authorize()
                if (u?.email && u?._id) {
                    try {
                        await claimPendingPurchases({ email: u.email, userId: u._id });
                    } catch (e) {
                        console.error("claimPendingPurchases (credentials) failed:", e);
                    }
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            const email = (user as any)?.email || token.email;
            if (!email) return token;

            const u = (await client.fetch('*[_type == "user" && email == $email][0]', { email })) as UserProps | null;
            if (!u) return token;

            const now = Date.now();
            const perms = Array.isArray(u.permissions) ? u.permissions.filter((p) => !p.expiresAt || new Date(p.expiresAt).getTime() > now) : [];
            const hasPackFidePermission = perms.some((permission) => permission.referenceKey === "pack_fide");
            const credits = Array.isArray((u as any).credits) ? (u as any).credits : [];
            const mockExamCredit = credits.find((credit: any) => credit?.referenceKey === "mock_exam");
            const totalCredits = Number(mockExamCredit?.totalCredits || 0);
            const remainingCredits = Number(mockExamCredit?.remainingCredits || 0);
            const hasMockExamCompilation = Array.isArray((u as any).examCompilations) && (u as any).examCompilations.length > 0;
            const hasMockExamAccess = hasPackFidePermission || totalCredits > 0 || remainingCredits > 0 || hasMockExamCompilation;

            return {
                ...token,
                _id: (u as any)._id,
                name: u.name,
                email: u.email,
                alias: u.alias ?? [],
                permissions: perms,
                lessons: Array.isArray(u.lessons) ? u.lessons : [],
                hasMockExamAccess,
                isAdmin: (u as any).isAdmin === true,
                notificationsLength: Array.isArray((u as any).notifications) ? (u as any).notifications.length : 0,
            };
        },
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    // on ne spread PAS session.user en premier,
                    // car il contient le mauvais `name`
                    _id: token._id as string,
                    name: token.name as string, // <- Sanity
                    email: token.email as string,
                    alias: (token as any).alias ?? [],
                    permissions: (token.permissions as Permission[]) || [],
                    lessons: (token.lessons as Lesson[]) || [],
                    hasMockExamAccess: (token as any).hasMockExamAccess === true,
                    isAdmin: (token as any).isAdmin === true,
                    notificationsLength: (token as any).notificationsLength || 0,
                },
            };
        },
    },
};
