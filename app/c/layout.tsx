import { ReactNode } from 'react';
import { AppSidebar } from '@/components/app-sidebar';

async function ClientLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<div className='min-h-screen flex'>
			<AppSidebar variant='floating' />
			{children}
		</div>
	);
}

export default ClientLayout;
