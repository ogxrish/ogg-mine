import BasicButton from "./BasicButton";
import WalletButton from "./WalletButton";

export default function NavBar() {
    return (
        <div className="flex flex-row justify-between items-center w-full border-b-4 border-white p-4">
            <div>
                {/* LOGO */}
                <p className="text-lg">Mycelium</p>
            </div>
            <div></div>
            <div className="flex flex-row justify-center items-center gap-2">
                <BasicButton text="$SPORE" onClick={() => null} />
                <WalletButton />
            </div>
        </div>
    );
}   