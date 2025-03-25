'use server';

import { PrismaClient } from '@prisma/client';

const getUserId = async (email: string) => {
	const prisma = new PrismaClient();
	const user = await prisma.users.findUnique({
		where: {
			email: email,
		},
	});
	if (!user) {
		throw new Error('User not found');
	}
	return user.user_id;
};

export { getUserId };
