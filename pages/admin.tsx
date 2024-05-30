import { useWallet } from "@solana/wallet-adapter-react";


export default function Admin() {
    const { publicKey } = useWallet();
    return (
        <div>

        </div>
    );
}