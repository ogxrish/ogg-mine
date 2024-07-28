import { shortenAddress } from "./WalletButton";


export default function LeaderboardRow({ row }: { row: any; }) {
    return (
        <div className="grid grid-cols-3 w-full">
            <p>{shortenAddress(row.owner.toString())}</p>
            <p>{row.claimed}</p>
            <p>{row.epochs}</p>
        </div>
    );
}