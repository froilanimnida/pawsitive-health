'use server';
import { PrismaClient } from '@prisma/client';
import { SignUpSchema } from '@/lib/auth-definitions';
import bcrypt from 'bcryptjs';
import type { z } from 'zod';
import { UserRoleType } from '@/lib/types/constants';
import { redirect } from 'next/navigation';

export const createAccount = async (values: z.infer<typeof SignUpSchema>) => {
	const formData = await SignUpSchema.parseAsync(values);
	const prisma = new PrismaClient();
	const user = await prisma.users.findFirst({
		where: {
			OR: [
				{ email: values.email },
				{ phone_number: values.phone_number },
			],
		},
	});
	if (user !== null) {
		return Promise.reject('User already exists');
	}
	const hashedPassword = await bcrypt.hash(
		values.password,
		bcrypt.genSaltSync(),
	);
	const result = await prisma.users.create({
		data: {
			email: formData.email,
			password_hash: hashedPassword,
			first_name: formData.first_name,
			last_name: formData.last_name,
			phone_number: formData.phone_number,
			role: UserRoleType.User,
		},
	});
	if (result.user_id === null) {
		return Promise.reject('Failed to create account');
	}
	return Promise.resolve(result);
};
