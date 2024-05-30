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
            <button className="hover:opacity-80" onClick={action} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                <div className=" items-center flex gap-2 p-1 pl-3">
                    <div className="text-xs md:text-base shadow-inner shadow-gray-100 flex items-center border px-6 py-4 gap-2 border-white">
                        <img
                            src="/wallet.png"
                            alt=""
                            className="!opacity-100"
                            width={24}
                            height={24}
                        />
                        {connected ? `${hover ? "Disconnect" : shortenAddress(publicKey?.toString() || "")}` : "Connect Wallet"}
                    </div>
                </div>
            </button>
        </>
    );
}
export function shortenAddress(address: string): string {
    return `${address.substring(0, 4)}...${address.substring(address.length - 4, address.length)}`;
}