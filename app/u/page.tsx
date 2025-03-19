import React from 'react';
import { getServerSession } from 'next-auth';

const UserDashboard = async () => {
	const session = await getServerSession();
	console.log(session);
	return <div></div>;
};

export default UserDashboard;
