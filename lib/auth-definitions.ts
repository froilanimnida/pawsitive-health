import { z } from 'zod';

export const SignUpSchema = z.object({
	first_name: z.string().nonempty().max(255),
	last_name: z.string().nonempty().max(255),
	email: z.string().email().max(255),
	password: z.string().nonempty().max(255),
	confirm_password: z.string().nonempty().max(255),
});

export const LoginSchema = z.object({
	email: z
		.string()
		.email({ message: 'Please enter a valid email.' })
		.nonempty()
		.max(255),
	password: z
		.string()
		.min(8, { message: 'Password must be 8 characters long.' })
		.max(255)
		.nonempty(),
});
