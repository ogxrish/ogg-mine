import BasicButton from "./BasicButton";
import WalletButton from "./WalletButton";

export default function NavBar() {
    return (
        <div className="flex flex-row justify-between text-xs md:text-base items-center w-full border-b-4 border-white p-4">
            <div>
                {/* LOGO */}
                <p className="text-lg">Mycelium</p>
            </div>
            <div></div>
            <div className="flex flex-row justify-center items-center md:gap-2">
                <WalletButton />
            </div>
        </div>
    );
}   