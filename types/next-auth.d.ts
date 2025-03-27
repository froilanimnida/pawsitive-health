// nextauth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';
import { Role } from '@/types/constants';

interface IUser extends DefaultUser {
	/**
	 * Role of user
	 */
	role?: Role;
	id: string;
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
