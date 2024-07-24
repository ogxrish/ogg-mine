import BasicButton from "@/components/BasicButton";
import { fund, getGlobalAccount, getProgramBalance, getProgramSolBalance, initialize, newEpoch } from "@/components/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

const verifiedWallets = []; // use this to kick non admin users off the page. 
// this is not strictly necessary as only admin can call the withdraw functions in the contract
export default function Admin() {
    const { publicKey } = useWallet();
    const [initialized, setInitialized] = useState<boolean>(false);
    const [epochOver, setEpochOver] = useState<boolean>(false);
    const [fundAmount, setFundAmount] = useState<number>(0);
    const [balance, setBalance] = useState<bigint>(BigInt(0));
    const [solBalance, setSolBalance] = useState<any>(0);
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
                getProgramSolBalance().then((balance) => setSolBalance(balance));
            }
        })();
    }, []);
    const onInitialize = async () => {
        if (!publicKey) return;
        try {
            await initialize(publicKey);
        } catch (e) {
            console.error(e);
        }
    };
    const onNewEpoch = async () => {
        if (!publicKey || !globalAccount) return;
        try {
            await newEpoch(publicKey, globalAccount.epoch.toNumber() + 1);
        } catch (e) {
            console.error(e);
        }
    };
    const onFund = async () => {
        if (!publicKey || !fundAmount) return;
        try {
            await fund(publicKey, fundAmount);
            setBalance(balance => balance + BigInt(fundAmount));
        } catch (e) {
            console.error(e);
        }
    };
    return (
        <div className="flex flex-col justify-center items-center gap-2 mt-10">
            <div className="flex flex-row justify-center items-center gap-2">
                <BasicButton text="Initialize" onClick={onInitialize} disabled={initialized} />
                <BasicButton text="New Epoch" onClick={onNewEpoch} disabled={!epochOver} />
            </div>
            <div className="flex flex-col justify-center items-center gap-2">
                <p>Epoch: {globalAccount?.epoch.toNumber()}</p>
                <p>Epoch Reward Percent: {globalAccount?.epochRewardPercent.toNumber()}</p>
                <p>Epoch Length (secs): {globalAccount?.epochLength.toNumber()}</p>
                <p>Time till epoch end: {Math.floor(globalAccount?.epochEnd.toNumber() - Date.now() / 1000)} seconds {`${Math.floor(globalAccount?.epochEnd.toNumber() - Date.now() / 1000) < 0 ? "(Epoch is over...)" : ""}`}</p>
                <p>Current program $OGG balance: {balance.toString()}</p>
                <p>Current program $SOL balance: {solBalance.toString()}</p>
                <div className="flex flex-col justify-center items-center gap-2 border border-white rounded-lg p-4">
                    <p className="italic"> Fund amount</p>
                    <input
                        placeholder="Fund amount"
                        value={fundAmount}
                        type="number"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFundAmount(Number(event.target.value))}
                        className="bg-transparent"
                    />
                    <BasicButton onClick={onFund} text="Fund" />
                </div>
            </div>
        </div>
    );
}