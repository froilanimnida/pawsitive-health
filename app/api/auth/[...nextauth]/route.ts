import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
// import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '@/utils/security/password-check';

const prisma = new PrismaClient();
const handler = NextAuth({
	adapter: PrismaAdapter(prisma),
	session: { strategy: 'jwt' },
	pages: {
		signIn: '/auth/login',
	},
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

				// if (
				// 	!user ||
				// 	user.user_id ||
				// 	!(await verifyPassword(
				// 		credentials.password,
				// 		user.password_hash,
				// 	))
				// ) {
				// 	console.log('inside if');
				// 	return null;
				// }
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
					name: user.first_name
						? `${user.first_name} ${user.last_name || ''}`.trim()
						: null,
				};
			},
		}),
	],
	callbacks: {
		async session({ session, token }) {
			console.log('console log from session ');
			if (token && session && session.user)
				session.user.email = token.sub;
			console.log(token);
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
