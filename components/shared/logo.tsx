import { PawPrint } from "lucide-react";
function Logo() {
    return (
        <>
            <PawPrint className="h-6 w-6 text-yellow-950" />
            <span className="font-bold text-yellow-950 text-xl hidden sm:inline-block">PawsitiveHealth</span>
        </>
    );
}

export default Logo;
