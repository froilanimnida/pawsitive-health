import NextAuth, { type AuthOptions, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@/utils/security/password-check';

const prisma = new PrismaClient();

const config = {
	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
					placeholder: 'yourmail@example.com',
				},
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				console.log('I am running on route.ts');
				if (!credentials) {
					return null;
				}
				if (
					!credentials.email ||
					!credentials.password ||
					!credentials
				) {
					return null;
				}

				const user = await prisma.users.findUnique({
					where: { email: credentials.email },
				});
				if (user === null) {
					return null;
				}
				if (
					!(await verifyPassword(
						credentials.password,
						user.password_hash,
					))
				) {
					throw new Error(
						JSON.stringify({
							status: 401,
							errors: 'Invalid password',
						}),
					);
				}
				return {
					id: user.user_id.toString(),
					email: user.email,
					role: user.role,
					name: user.first_name
						? `${user.first_name} ${user.last_name || ''}`.trim()
						: null,
				};
			},
		}),
	],
} satisfies NextAuthOptions;

const authOptions: AuthOptions = {
	adapter: PrismaAdapter(prisma),
	pages: {
		signIn: '/auth/login',
	},
	providers: config.providers,
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.sub = user.id;
				// token.role = user.role;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session && session.user) {
				session.user.email = token.sub;
				// session.user.role = token.role as string;
			}
			return session;
		},
		signIn() {
			return true;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

// const auth = (
// 	...args:
// 		| [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
// 		| [NextApiRequest, NextApiResponse]
// 		| []
// ) => {
// 	return getServerSession(...args, config);
// };
export { handler as GET, handler as POST };
