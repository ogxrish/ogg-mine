import BasicButton from "@/components/BasicButton";
import { getGlobalAccount, initialize, updateState } from "@/components/utils";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";


export default function Admin() {
    const { publicKey } = useWallet();
    const [initialized, setInitialized] = useState<boolean>(false);
    const [canUpdateState, setCanUpdateState] = useState<boolean>(false);
    const [globalAccount, setGlobalAccount] = useState<any>();
    useEffect(() => {
        (async () => {
            const globalAccount: any = await getGlobalAccount();
            if (globalAccount) {
                setInitialized(true);
                let endTime = globalAccount.epochEnd.toNumber();
                if (globalAccount.state === 0 || Date.now() / 1000 > endTime) {
                    setCanUpdateState(true);
                }
                setGlobalAccount(globalAccount);
            }
        })();
    }, []);
    const onInitialize = async () => {
        if (!publicKey) return;
        await initialize(publicKey);
    };
    const onUpdateState = async () => {
        if (!publicKey) return;
        await updateState(publicKey);
    };
    return (
        <div className="flex flex-col justify-center items-center gap-2 mt-10">
            <div className="flex flex-row justify-center items-center gap-2">
                <BasicButton text="Initialize" onClick={onInitialize} disabled={initialized} />
                <BasicButton text="Update State" onClick={onUpdateState} disabled={!canUpdateState} />
            </div>
            <div className="flex flex-row justify-center items-center gap-2">
                <p>State: {globalAccount?.state}</p>
                <p>Time till epoch end: {globalAccount?.epochEnd.toNumber() - Date.now() / 1000}</p>
            </div>
        </div>
    );
}