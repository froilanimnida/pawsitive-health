import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "PawsitiveHealth | User Dashboard",
    description: "User dashboard for PawsitiveHealth.",
};

const UserDashboard = () => {
    return (
        <div>
            {/* <h1>Welcome, {session?.user?.name || 'Guest'}!</h1>
			<p>Your role: {session?.user?.role || 'No role assigned'}</p> */}
        </div>
    );
};

export default UserDashboard;
