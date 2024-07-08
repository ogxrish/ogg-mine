import BasicButton from "@/components/BasicButton";
import { fund, getGlobalAccount, getProgramBalance, initialize, newEpoch } from "@/components/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";


export default function Admin() {
    const { publicKey } = useWallet();
    const [initialized, setInitialized] = useState<boolean>(false);
    const [epochOver, setEpochOver] = useState<boolean>(false);
    const [fundAmount, setFundAmount] = useState<number>(0);
    const [balance, setBalance] = useState<bigint>(BigInt(0));
    const [globalAccount, setGlobalAccount] = useState<any>();
    useEffect(() => {
        (async () => {
            const globalAccount: any = await getGlobalAccount();
            if (globalAccount) {
                setInitialized(true);
                let endTime = globalAccount.epochEnd.toNumber();
                if (globalAccount.epoch.toNumber() === 0 || Date.now() / 1000 > endTime) {
                    setEpochOver(true);
                }
                setGlobalAccount(globalAccount);
                getProgramBalance().then((amount) => setBalance(amount));
            }
        })();
    }, []);
    const onInitialize = async () => {
        if (!publicKey) return;
        await initialize(publicKey);
    };
    const onNewEpoch = async () => {
        if (!publicKey || !globalAccount) return;
        await newEpoch(publicKey, globalAccount.epoch.toNumber() + 1);
    };
    const onFund = async () => {
        if (!publicKey || !fundAmount) return;
        await fund(publicKey, fundAmount);
        setBalance(balance => balance + BigInt(fundAmount));
    };
    return (
        <div className="flex flex-col justify-center items-center gap-2 mt-10">
            <div className="flex flex-row justify-center items-center gap-2">
                <BasicButton text="Initialize" onClick={onInitialize} disabled={initialized} />
                <BasicButton text="New Epoch" onClick={onNewEpoch} disabled={!epochOver} />
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
                <p>Epoch: {globalAccount?.epoch.toNumber()}</p>
                <p>Time till epoch end: {Math.floor(globalAccount?.epochEnd.toNumber() - Date.now() / 1000)} seconds</p>
                <p>Program account balance: {balance.toString()}</p>
                <input
                    placeholder="Fund amount"
                    value={fundAmount}
                    type="number"
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFundAmount(Number(event.target.value))}
                    className="bg-black"
                />
                <BasicButton onClick={onFund} text="Fund" />
            </div>
        </div>
    );
}