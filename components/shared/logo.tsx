import { PawPrint } from "lucide-react";
function Logo() {
    return (
        <>
            <PawPrint className="h-6 w-6" />
            <span className="font-bold text-xl hidden sm:inline-block">PawsitiveHealth</span>
        </>
    );
}

export default Logo;
