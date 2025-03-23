'use client';

import * as React from 'react';
import { Settings2, Dog, BookmarkCheckIcon, Stethoscope } from 'lucide-react';

import { NavMenus } from '@/components/nav-menus';
import { NavUser } from '@/components/nav-user';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarRail,
} from '@/components/ui/sidebar';
import { useSession } from 'next-auth/react';

const data = {
	projects: [
		{
			name: 'My Pets',
			url: '/u/pets',
			icon: Dog,
		},
		{
			name: 'Settings',
			url: '/u/settings',
			icon: Settings2,
		},
		{
			name: 'My Booking',
			url: '/u/appointments',
			icon: BookmarkCheckIcon,
		},
	],
};

const userNavLinks = [
	{
		name: 'Settings',
		url: '/u/settings',
		icon: Settings2,
	},
	{
		name: 'My Pets',
		url: '/u/pets',
		icon: Dog,
	},
	{
		name: 'My Booking',
		url: '/u/appointments',
		icon: BookmarkCheckIcon,
	},
];

const vetNavLinks = [
	{
		name: 'My Pets',
		url: '/v/pets',
		icon: Dog,
	},
	{
		name: 'My Booking',
		url: '/v/appointments',
		icon: BookmarkCheckIcon,
	},
];

const clientNavLinks = [
	{
		name: 'Clinic Appointments',
		url: '/c/appointments',
		icon: BookmarkCheckIcon,
	},
	{
		name: 'Veterinaries',
		url: '/c/vets',
		icon: Stethoscope,
	},
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { data: session } = useSession();
	const userData = {
		name: session?.user?.name ?? '',
		email: session?.user?.email ?? '',
		role: session?.user?.role ?? '',
	};

	const getNavLinks = () => {
		if (session?.user?.role === 'user') {
			return userNavLinks;
		} else if (session?.user?.role === 'veterinarian') {
			return vetNavLinks;
		} else if (session?.user?.role === 'client') {
			return clientNavLinks;
		} else {
			return data.projects; // Fallback to default links
		}
	};

	return (
		<Sidebar
			collapsible='offcanvas'
			{...props}>
			<SidebarContent>
				<NavMenus projects={getNavLinks()} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={userData} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
