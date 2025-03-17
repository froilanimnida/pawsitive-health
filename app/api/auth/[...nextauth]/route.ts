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
			async authorize(credentials, req) {
				console.log(req);
				if (!credentials) {
					throw new Error('Missing credentials');
				}
				if (
					!credentials.email ||
					!credentials.password ||
					!credentials
				) {
					throw new Error('Missing credentials');
				}
				console.log('credentials: ', credentials);

				const user = await prisma.users.findUnique({
					where: { email: credentials.email },
				});
				console.log(user);
				console.log('after finding user');

				if (
					!user ||
					!(await verifyPassword(
						credentials.password,
						user.password_hash,
					))
				) {
					return null;
				}
				console.log("after checking user's password");

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
			if (token && session && session.user)
				session.user.email = token.sub;
			console.log(token);
			return session;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
