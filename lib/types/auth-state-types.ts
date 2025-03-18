export interface AuthState {
	user: {
		email: string;
		user_uuid: string;
		role: string;
		isLoggedIn: boolean;
	};
	login: (state: {
		email: string;
		user_uuid: string;
		role: string;
		isLoggedIn: boolean;
	}) => void;
	logout: () => void;
}
