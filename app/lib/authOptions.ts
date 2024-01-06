import { SanityServerClient as client } from "@/app/lib/sanity.clientServerDev";
import { UserProps } from "@/app/types/sfn/auth";
import { compare } from "bcrypt";
import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

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
        async signIn({ account, profile }) {
            if (["google", "facebook"].includes(account?.provider || "")) {
                const email = profile?.email;

                let user = await client.fetch('*[_type == "user" && email == $email][0]', { email });
                if (!user) {
                    const newUser = { _type: "user", email: email, name: profile?.name, isActive: true, oAuth: account?.provider };
                    user = await client.create(newUser);
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            const u = (user as unknown as any) || ((await client.fetch('*[_type == "user" && email == $email][0]', { email: token.email })) as UserProps);
            if (!u) {
                return token;
            }

            return {
                ...token,
                _id: u._id,
            };
        },
        session: ({ session, token }) => {
            return {
                ...session,
                user: {
                    ...session.user,
                    _id: token._id,
                },
            };
        },
    },
};
