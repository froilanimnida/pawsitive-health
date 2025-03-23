// nextauth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';
import { Role } from '@/lib/types/constants';

interface IUser extends DefaultUser {
	/**
	 * Role of user
	 */
	role?: Role;
	/**
	 * Field to check whether a user has a subscription
	 */
}
declare module 'next-auth' {
	interface User extends IUser {}
	interface Session {
		user?: User;
	}
}
declare module 'next-auth/jwt' {
	interface JWT extends IUser {}
}
