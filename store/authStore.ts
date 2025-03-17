import { create } from 'zustand';

export const useAuthStore = create((set) => ({
	auth: {
		user: { email: '', user_uuid: '', role: '' },
		login: (user: { email: string; user_uuid: string; role: '' }) =>
			set({ auth: { user } }),
		logout: () => set({ auth: { user: null } }),
	},
}));
