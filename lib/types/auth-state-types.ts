export interface AuthState {
	user: {
		email: string;
		role: string;
		isLoggedIn: boolean;
	};
	login: (state: {
		email: string;
		role: string;
		isLoggedIn: boolean;
	}) => void;
	logout: () => void;
}
