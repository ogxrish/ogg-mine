import { useWallet } from '@solana/wallet-adapter-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';

export const WalletMultiButton = dynamic(
    async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
    { ssr: false }
);
export default function WalletButton() {
    const { connected, disconnect, publicKey } = useWallet();
    const [hover, setHover] = useState<boolean>(false);
    const handleMouseEnter = () => setHover(true);
    const handleMouseLeave = () => setHover(false);
    const action = () => {
        if (connected) {
            disconnect();
        } else {
            const button = document.querySelector("#click button") as HTMLButtonElement;
            button.click();
            console.log("connecting");
        }
    };
    return (
        <>
            <div id="click" style={{ display: "none" }}>
                <WalletMultiButton />
            </div>
            <button className="bg-black" onClick={action} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className=" items-center flex gap-2 p-1 pl-3">
                    <div className="text-xs md:text-base shadow-inner shadow-yellow-300 flex items-center border px-6 py-4 gap-2 border-yellow-500 text-yellow-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3" />
                        </svg>

                        {connected ? `${hover ? "Disconnect" : shortenAddress(publicKey?.toString() || "")}` : "Connect Wallet"}
                    </div>
                </div>
            </button>
        </>
    );
}
export function shortenAddress(address: string): string {
    if (!address) return "So11...1111";
    return `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;
}