'use server';
import { auth } from '@/auth';
import { PrismaClient } from '@prisma/client';

// const getUserAppointments = async () => {
//     const session = await auth();
//     if (!session || !session.user || !session.user.email) {
//         throw new Error('User not found');
//     }
//     const prisma = new PrismaClient();
//     const appointments = await prisma.appointments.findMany({
//         where: {

//         },
//     });
//     return appointments;
// }
