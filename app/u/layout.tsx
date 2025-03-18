import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
async function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='flex h-screen'>
			<SidebarProvider>
				<AppSidebar />
			</SidebarProvider>
			{children}
		</div>
	);
}

export default UserLayout;
