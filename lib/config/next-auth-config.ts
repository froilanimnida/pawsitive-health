import { nextAuthLogin } from "@/actions/auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { role_type } from "@prisma/client";

export const config = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials) {
                if (!credentials || !credentials.email || !credentials.password) {
                    return null;
                }
                const data = await nextAuthLogin(credentials?.email, credentials?.password);
                const userData = data.success ? data.data : null;
                if (userData === null || userData === undefined) {
                    return null;
                }
                return {
                    id: userData.user.user_id.toString(),
                    email: userData.user.email,
                    role: userData.user.role as role_type,
                    name: userData.user.first_name
                        ? `${userData.user.first_name} ${userData.user.last_name || ""}`.trim()
                        : null,
                };
            },
        }),
    ],
} satisfies NextAuthOptions;
