export const calculateAge = (dateOfBirth: Date): number => {
	const today = new Date();
	let age = today.getFullYear() - dateOfBirth.getFullYear();

	// Adjust age if birthday hasn't occurred yet this year
	if (
		today.getMonth() < dateOfBirth.getMonth() ||
		(today.getMonth() === dateOfBirth.getMonth() &&
			today.getDate() < dateOfBirth.getDate())
	) {
		age--;
	}

	return age;
};
