'use client';
import ResponsiveContainer from '@/components/shared/layout/responsive-container';
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
} from '@/components/ui/select';
import React, { useState } from 'react';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
} from '@/components/ui/form';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
// import { AppointmentType } from '@/lib/types/appointment-types';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentSchema } from '@/lib/appointment-definition';
import { Input } from '@/components/ui/input';

function NewAppointment() {
	const form = useForm({
		defaultValues: {
			pet_id: '',
			vet_id: '',
			appointment_date: new Date(),
			appointment_type: '',
			notes: '',
		},
		resolver: zodResolver(AppointmentSchema),
	});
	// const appointmentTypes = Object.values(AppointmentType);
	const [date, setDate] = useState(new Date());
	const samplePetsToAppoint = [
		{
			id: 1,
			name: 'Buddy',
			species: 'Dog',
			breed: 'Golden Retriever',
		},
		{
			id: 2,
			name: 'Milo',
			species: 'Dog',
			breed: 'Beagle',
		},
		{
			id: 3,
			name: 'Charlie',
			species: 'Dog',
			breed: 'Poodle',
		},
		{
			id: 4,
			name: 'Max',
			species: 'Dog',
			breed: 'Labrador',
		},
	];
	const sampleVeterinarians = [
		{
			id: 1,
			name: 'Dr. John Doe',
			specialty: 'General Medicine',
		},
		{
			id: 2,
			name: 'Dr. Jane Doe',
			specialty: 'Dentistry',
		},
		{
			id: 3,
			name: 'Dr. Alex Smith',
			specialty: 'Surgery',
		},
		{
			id: 4,
			name: 'Dr. Sarah Johnson',
			specialty: 'Dermatology',
		},
	];
	const onSubmit = (values: z.infer<typeof AppointmentSchema>) => {
		console.log(values);
	};
	return (
		<ResponsiveContainer>
			<Card>
				<CardHeader>
					<CardTitle>Add New Appointment</CardTitle>
					<CardDescription>
						Add new clinic appointment
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							className='space-y-4'
							onSubmit={form.handleSubmit(onSubmit)}>
							<FormControl>
								<FormItem>
									<FormLabel>Pet</FormLabel>
									<FormField
										control={form.control}
										name='pet_id'
										render={({ field }) => (
											<Select
												required
												{...field}>
												<SelectTrigger>
													Select a pet
												</SelectTrigger>
												<SelectContent>
													{samplePetsToAppoint.map(
														(pet) => (
															<SelectItem
																key={pet.id}
																value={String(
																	pet.id,
																)}>
																{pet.name}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
										)}
									/>
								</FormItem>
							</FormControl>
							<FormControl>
								<FormItem>
									<FormLabel>Veterinarian</FormLabel>
									<FormField
										control={form.control}
										name='vet_id'
										render={({ field }) => (
											<Select
												required
												{...field}>
												<SelectTrigger>
													Select a veterinarian
												</SelectTrigger>
												<SelectContent>
													{sampleVeterinarians.map(
														(vet) => (
															<SelectItem
																key={vet.id}
																value={String(
																	vet.id,
																)}>
																{vet.name}
															</SelectItem>
														),
													)}
												</SelectContent>
											</Select>
										)}
									/>
								</FormItem>
							</FormControl>
							<FormControl>
								<FormItem>
									<FormLabel>Date of Appointment</FormLabel>
									<FormField
										control={form.control}
										name='appointment_date'
										render={({ field }) => (
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant={'outline'}
														className={cn(
															'w-[280px] justify-start text-left font-normal',
															!date &&
																'text-muted-foreground',
														)}>
														<CalendarIcon className='mr-2 h-4 w-4' />
														{date ?
															format(date, 'PPP')
														:	<span>
																Pick a date
															</span>
														}
													</Button>
												</PopoverTrigger>
												<PopoverContent className='w-auto p-0'>
													<Calendar
														{...field}
														className='bg-white'
														mode='single'
														selected={date}
														required
														onSelect={(day) => {
															setDate(
																day ? day : (
																	new Date()
																),
															);
														}}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										)}
									/>
								</FormItem>
							</FormControl>
							<FormControl>
								<FormItem>
									<FormLabel>Notes</FormLabel>
									<FormField
										name='notes'
										control={form.control}
										render={({ field }) => (
											<Input
												{...field}
												placeholder='Notes'
												type='text'
											/>
										)}
									/>
								</FormItem>
							</FormControl>
							<FormControl>
								<FormItem>
									<FormLabel>Date of Appointment</FormLabel>
									<FormField
										name='appointment_date'
										control={form.control}
										render={({ field }) => (
											<Popover>
												<PopoverTrigger asChild>
													<Button
														variant={'outline'}
														className={cn(
															'w-[280px] justify-start text-left font-normal',
															!date &&
																'text-muted-foreground',
														)}>
														<CalendarIcon className='mr-2 h-4 w-4' />
														{date ?
															format(date, 'PPP')
														:	<span>
																Pick a date
															</span>
														}
													</Button>
												</PopoverTrigger>
												<PopoverContent className='w-auto p-0'>
													<Calendar
														{...field}
														className='bg-white'
														mode='single'
														selected={date}
														required
														onSelect={(day) => {
															setDate(
																day ? day : (
																	new Date()
																),
															);
														}}
														initialFocus
													/>
												</PopoverContent>
											</Popover>
										)}
									/>
								</FormItem>
							</FormControl>
						</form>
					</Form>
				</CardContent>
				<CardFooter>
					<Button>Create appointment</Button>
				</CardFooter>
			</Card>
		</ResponsiveContainer>
	);
}

export default NewAppointment;
