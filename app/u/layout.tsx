import React from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import SessionProviderWrapper from '@/context/session-provider-context';

async function UserLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<div className='flex h-screen'>
			<SessionProviderWrapper>
				<SidebarProvider>
					<AppSidebar />
				</SidebarProvider>
				{children}
			</SessionProviderWrapper>
		</div>
	);
}

export default UserLayout;
