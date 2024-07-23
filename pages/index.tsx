import BasicButton from "@/components/BasicButton";
import Window from "@/components/Window";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import TransactionPending from "@/components/TransactionPending";
import TransactionFailure from "@/components/TransactionFailure";
import TransactionSuccess from "@/components/TransactionSuccess";
import WalletButton from "@/components/WalletButton";
import { calculateMiningPrice, claim, getClaimableAmount, getEpochAccount, getGlobalAccount, getLeaderboard, isUserMining, mine, newEpoch, toHexString } from "@/components/utils";
import LoadedText from "@/components/LoadedText";
import Countdown from "@/components/Countdown";
import { BN } from "@coral-xyz/anchor";
import LeaderboardRow from "@/components/LeaderboardRow";

type GlobalAccount = {
  miners: number,
  epochEnd: number,
  epoch: number,
  reward: number,
};
type LeaderboardEntry = {
  owner: string;
  claimed: string;
  epochs: string;
};
export default function Home() {
  const { publicKey } = useWallet();
  const [succeededTransaction, setSucceededTransaction] = useState<boolean>(false);
  const [failedTransaction, setFailedTransaction] = useState<boolean>(false);
  const [sendingTransaction, setSendingTransaction] = useState<boolean>(false);
  const [globalAccount, setGlobalAccount] = useState<GlobalAccount>();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [state, setState] = useState<number>(0);
  const [miningCost, setMiningCost] = useState<number>();
  const [isMining, setIsMining] = useState<boolean>(false);
  const [claimable, setClaimable] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>();
  useEffect(() => {
    (async () => {
      const globalAccount: any = await getGlobalAccount();
      if (globalAccount) {
        const diff = globalAccount.epochEnd.toNumber() - Date.now() / 1000;
        setTimeLeft(diff);
        const epochAccount: any = await getEpochAccount(globalAccount.epoch.toNumber());
        setGlobalAccount({
          miners: epochAccount.totalMiners.toNumber(),
          epochEnd: globalAccount.epochEnd.toNumber(),
          epoch: globalAccount.epoch.toNumber(),
          reward: globalAccount.reward.toNumber(),
        });
        console.log(globalAccount.reward.toNumber());
        setMiningCost(calculateMiningPrice(epochAccount.totalMiners.toNumber()));
        getLeaderboard().then((leaderboard: any[]) => {

          const l = leaderboard.sort((a, b) => a.account.claimed.cmp(b.account.claimed)).slice(0, 15);
          setLeaderboard(l.map((item: any) => {
            return {
              owner: item.account.owner,
              claimed: item.account.claimed.toString(10),
              epochs: item.account.claimed.toString(10),
            };
          }));
        });
      }
    })();
  }, []);
  useEffect(() => {
    if (!publicKey || !globalAccount) return;
    (async () => {
      const amount = await getClaimableAmount(publicKey, globalAccount.epoch);
      setClaimable(amount);
    })();
  }, [publicKey, globalAccount]);
  useEffect(() => {
    if (publicKey && globalAccount && !isMining) {
      (async () => {
        setIsMining(await isUserMining(publicKey, globalAccount.epoch));
      })();
    }
  }, [publicKey, globalAccount, isMining]);
  const onMine = async () => {
    if (!publicKey || !globalAccount) return;
    try {
      await mine(publicKey, globalAccount.epoch, timeLeft);
      if (timeLeft < 0) {
        setTimeLeft(86400);
        setGlobalAccount(globalAccount => {
          return {
            miners: 1,
            epochEnd: Date.now() + 86400,
            epoch: globalAccount!.epoch + 1,
            reward: globalAccount!.reward * 7 / 8
          };
        });
        setMiningCost(calculateMiningPrice(1));
      } else {
        setGlobalAccount((globalAccount: any) => {
          return {
            ...globalAccount,
            miners: globalAccount.miners + 1
          };
        });
        setMiningCost(calculateMiningPrice(globalAccount.miners + 1));
      }
      setIsMining(true);
      setSucceededTransaction(true);
    } catch (e) {
      console.error(e);
      setFailedTransaction(true);
    } finally {
      setSendingTransaction(false);
      setTimeout(() => {
        setFailedTransaction(false);
        setSucceededTransaction(false);
      }, 5000);
    }
  };
  const onClaim = async () => {
    if (!publicKey || !globalAccount) return;
    try {
      await claim(publicKey, globalAccount.epoch);
      setClaimable(0);
      setSucceededTransaction(true);
    } catch (e) {
      console.error(e);
      setFailedTransaction(true);
    } finally {
      setSendingTransaction(false);
      setTimeout(() => {
        setFailedTransaction(false);
        setSucceededTransaction(false);
      }, 1000);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center gap-2 md:gap-3 xl:gap-6 px-3 md:px-6 mt-6 w-full h-full relative">
      {!publicKey &&
        <div className="flex justify-center items-start w-full h-full absolute top-0 left-0 bg-black/80">
          <div className="flex flex-col p-10 gap-5 justify-center items-center bg-black border-white border-2 rounded-lg mt-10">
            <p>Connect Wallet</p>
            <WalletButton />
          </div>
        </div>
      }
      {succeededTransaction &&
        <div className="fixed bottom-0 right-0 mr-6 mb-6">
          <TransactionSuccess />
        </div>
      }
      {failedTransaction &&
        <div className="fixed bottom-0 right-0 mr-6 mb-6">
          <TransactionFailure />
        </div>
      }
      {sendingTransaction &&
        <div className="fixed bottom-0 right-0 mr-6 mb-6">
          <TransactionPending />
        </div>
      }
      <div className="flex flex-row justify-center items-center gap-4">
        <BasicButton onClick={() => setState(0)} text="Mine" disabled={state === 0} />
        <BasicButton onClick={() => setState(1)} text="Claim" disabled={state === 1} />
        <BasicButton onClick={() => setState(2)} text="Leaderboard" disabled={state === 2} />
      </div>
      <div className="w-full h-full">
        <Window>
          <div className="w-full h-full flex flex-col justify-center items-center gap-3 md:gap-6">

            {state == 0 ?
              <>
                <div className="flex flex-col justify-center items-center gap-1 md:gap-2 mb-4 md:mb-6 lg:mb-10">
                  <p className="uppercase text-4xl lg:text-6xl font-extrabold">MINE</p>
                  <p className="text-xs md:text-sm lg:text-base font-extrabold">{`EPOCH 0x${toHexString(globalAccount?.epoch || 0)}`}</p>
                </div>
                <LoadedText start="Miners " value={globalAccount?.miners} />
                <LoadedText start="Mining Reward" text="&%%& $SPORE" value={globalAccount?.reward} />
                <LoadedText start="Mining Cost" text="&%%& SOL" value={miningCost} />
                <div className="flex flex-col justify-center items-center gap-1 md:gap-2">
                  {timeLeft < 0 ?
                    <BasicButton onClick={onMine} text="Mine in new epoch" />
                    :
                    <BasicButton onClick={onMine} text="Mine" disabled={isMining} />
                  }
                  {isMining && <p>You are already mining!</p>}
                </div>
              </>
              :
              state === 1 ?
                <>
                  <p className="uppercase text-4xl lg:text-6xl font-extrabold mb-10">CLAIM</p>
                  <p className="text-4xl font-bold">{`${claimable} $SPORE`}</p>
                  <BasicButton onClick={onClaim} text="Claim" />
                </>
                :
                <>
                  <p className="uppercase text-4xl lg:text-6xl font-extrabold mb-10">LEADERBOARD</p>
                  <div className="grid grid-cols-3 w-full">
                    <p>Owner</p>
                    <p>$OGG Claimed</p>
                    <p>Epochs participated in</p>
                  </div>
                  {leaderboard?.map((l: any, i: number) => <LeaderboardRow key={i} row={l} />)}
                </>
            }
            <Countdown timeLeft={timeLeft} />
          </div>
        </Window>
      </div>
    </div>
  );
}