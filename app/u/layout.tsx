import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';

async function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='flex h-screen justify-start'>
			<AppSidebar variant='floating' />
			{children}
		</div>
	);
}

export default UserLayout;
