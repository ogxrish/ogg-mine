import BasicButton from "@/components/BasicButton";
import Window from "@/components/Window";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import TransactionPending from "@/components/TransactionPending";
import TransactionFailure from "@/components/TransactionFailure";
import TransactionSuccess from "@/components/TransactionSuccess";
import WalletButton from "@/components/WalletButton";
import { calculateMiningPrice, claim, commas, getClaimableAmount, getEpochAccount, getGlobalAccount, getLeaderboard, getTotalRewardAmount, isUserMining, jupQuote, mine, newEpoch, toHexString, TOKEN_DECIMALS } from "@/components/utils";
import LoadedText from "@/components/LoadedText";
import Countdown from "@/components/Countdown";
import LeaderboardRow from "@/components/LeaderboardRow";
import { useRouter } from "next/router";
import GradientBorder from "@/components/GradientBorder";
import { BN } from "@coral-xyz/anchor";
import Chart from "@/components/Chart";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

type GlobalAccount = {
  miners: number,
  epochEnd: number,
  epoch: number,
  reward: number,
  epochsPerDay: number;
  epochRewardPercent: number;
  feeLamports: number;
};
type LeaderboardEntry = {
  owner: string;
  claimed: string;
  epochs: string;
};
export default function Home() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [succeededTransaction, setSucceededTransaction] = useState<boolean>(false);
  const [failedTransaction, setFailedTransaction] = useState<boolean>(false);
  const [sendingTransaction, setSendingTransaction] = useState<boolean>(false);
  const [globalAccount, setGlobalAccount] = useState<GlobalAccount>();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [state, setState] = useState<number | undefined>(undefined);
  const [miningCost, setMiningCost] = useState<string>("");
  const [isMining, setIsMining] = useState<boolean>(false);
  const [claimable, setClaimable] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>();
  const [chartData, setChartData] = useState<any>();
  const [infoData, setInfoData] = useState<any>();
  const [miningReward, setMiningReward] = useState<string>("");
  useEffect(() => {
    if (globalAccount) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data?start=${Math.max(globalAccount.epoch - 251, 0)}&end=${globalAccount.epoch - 1}`).then(async (data) => {
        const json = await data.json();
        json.incremental = json.incremental.map((i: any) => {
          return {
            id: Number(i.id),
            purchasedOgg: Number((BigInt(i.purchasedOgg) / BigInt(10 ** TOKEN_DECIMALS)).toString()),
            reward: Number((BigInt(i.reward) / BigInt(10 ** TOKEN_DECIMALS)).toString()),
            totalMiners: Number(i.totalMiners),
            unclaimedOgg: Number((BigInt(i.unclaimedOgg) / BigInt(10 ** TOKEN_DECIMALS)).toString()),
          };
        }).sort((a: any, b: any) => a.id - b.id);
        setChartData(json.incremental);
        setInfoData(json.single);
        console.log(json);
      }).catch(console.error);
    }
  }, [globalAccount]);
  useEffect(() => {
    (async () => {
      const globalAccount: any = await getGlobalAccount();
      if (globalAccount) {
        const diff = globalAccount.epochEnd.toNumber() - Date.now() / 1000;
        setTimeLeft(diff);
        const epochAccount: any = await getEpochAccount(globalAccount.epoch.toNumber());
        const totalRewardAmount = await getTotalRewardAmount(globalAccount);
        const totalMiners = epochAccount.totalMiners.toNumber();
        setGlobalAccount({
          miners: totalMiners,
          epochEnd: globalAccount.epochEnd.toNumber(),
          epoch: globalAccount.epoch.toNumber(),
          reward: totalRewardAmount,
          epochsPerDay: globalAccount.epochsPerDay.toNumber(),
          epochRewardPercent: globalAccount.epochRewardPercent.toNumber(),
          feeLamports: globalAccount.feeLamports.toNumber()
        });
        // const miningCost = calculateMiningPrice(epochAccount.totalMiners.toNumber(), globalAccount);
        // const quote = await jupQuote("So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", miningCost * LAMPORTS_PER_SOL);
        // setMiningCost(`${miningCost} SOL | $${Math.round(quote.outAmount * 100 / 10 ** 6) / 100}`);
        // const miningReward = Math.round(totalRewardAmount / totalMiners / 10 ** TOKEN_DECIMALS * 1000) / 1000;
        // const quote2 = await jupQuote("5gJg5ci3T7Kn5DLW4AQButdacHJtvADp7jJfNsLbRc1k", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", miningReward * 10 ** TOKEN_DECIMALS);
        // setMiningReward(`${miningReward} $OGG | $${Math.round(quote2.outAmount * 100 / 10 ** 6) / 100}`);
        getLeaderboard().then((leaderboard: any[]) => {
          const l = leaderboard.sort((a, b) => b.account.claimed.cmp(a.account.claimed)).slice(0, 10);
          setLeaderboard(l.map((item: any) => {
            return {
              owner: item.account.owner,
              claimed: commas(item.account.claimed.div(new BN(10 ** TOKEN_DECIMALS)).toString(10)),
              epochs: item.account.epochs.toString(10),
            };
          }));
        });
      }
    })();
  }, []);
  useEffect(() => {
    if (globalAccount) {
      (async () => {
        const miningCost = calculateMiningPrice(globalAccount.miners, globalAccount);
        const totalRewardAmount = await getTotalRewardAmount(globalAccount.epochRewardPercent);
        const quote = await jupQuote("So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", miningCost * LAMPORTS_PER_SOL);
        setMiningCost(`${miningCost} SOL | $${(quote.outAmount / 10 ** 6).toFixed(2)}`);
        const miningReward = Math.round(totalRewardAmount / globalAccount.miners / 10 ** TOKEN_DECIMALS * 1000) / 1000;
        const quote2 = await jupQuote("5gJg5ci3T7Kn5DLW4AQButdacHJtvADp7jJfNsLbRc1k", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", miningReward * 10 ** TOKEN_DECIMALS);
        setMiningReward(`${miningReward} $OGG | $${(quote2.outAmount / 10 ** 6).toFixed(2)}`);
      })();
    }
  }, [globalAccount]);
  useEffect(() => {
    if (router && router.isReady) {
      const { state } = router.query;
      if (state && !Number.isNaN(Number(state))) {
        console.log(state);
        setState(Number(state));
      }
    }
  }, [router, router.isReady]);
  useEffect(() => {
    if (state === undefined) return;
    const params = new URLSearchParams(window.location.search);
    params.set('state', state.toString());
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }, [state]);
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
  useEffect(() => {

  }, [globalAccount]);
  const onMine = async () => {
    if (!publicKey || !globalAccount) return;
    try {
      setSendingTransaction(true);
      await mine(publicKey, globalAccount.epoch, timeLeft);
      if (timeLeft < 0) {
        setTimeLeft(86400);
        setGlobalAccount((globalAccount: any) => {
          return {
            miners: 1,
            epochEnd: Date.now() + 86400,
            epoch: globalAccount.epoch + 1,
            reward: globalAccount.reward,
            epochsPerDay: globalAccount.epochsPerDay,
            epochRewardPercent: globalAccount.epochRewardPercent,
            feeLamports: globalAccount.feeLamports
          };
        });
        // const miningCost = calculateMiningPrice(1, globalAccount);
        // const quote = await jupQuote("So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", miningCost * LAMPORTS_PER_SOL);
        // setMiningCost(`${miningCost} SOL | $${Math.round(quote.outAmount * 100 / 10 ** 6) / 100}`);
      } else {
        setGlobalAccount((globalAccount: any) => {
          return {
            ...globalAccount,
            miners: globalAccount.miners + 1
          };
        });
        // const miningCost = calculateMiningPrice(globalAccount.miners + 1, globalAccount);
        // const quote = await jupQuote("So11111111111111111111111111111111111111112", "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", miningCost * LAMPORTS_PER_SOL);
        // setMiningCost(`${miningCost} SOL | $${Math.round(quote.outAmount * 100 / 10 ** 6) / 100}`);
      }
      setIsMining(true);
      setSucceededTransaction(true);
    } catch (e) {
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
      setSendingTransaction(true);
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
      <div className="grid grid-cols-4 place-items-center items-center w-[90%] lg:w-[70%] xl:w-[60%] gap-4">
        <BasicButton onClick={() => setState(3)} text="Info" disabled={state === 3} />
        <BasicButton onClick={() => setState(0)} text="Mine" disabled={state === 0} />
        <BasicButton onClick={() => setState(1)} text="Claim" disabled={state === 1} />
        <BasicButton onClick={() => setState(2)} text="Stats" disabled={state === 2} />
      </div>
      <div className="w-full h-full flex justify-center items-center">
        <GradientBorder>
          <div className="w-full h-full flex flex-col justify-center items-center gap-3 md:gap-6">
            {state == 0 ?
              <>
                <div className="flex flex-col justify-center items-center gap-1 md:gap-2 mb-4 md:mb-6 lg:mb-10">
                  <p className="uppercase text-4xl lg:text-6xl font-extrabold">MINE</p>
                  <p className="text-xs md:text-sm lg:text-base font-extrabold">{`EPOCH 0x${toHexString(globalAccount?.epoch || 0)}`}</p>
                </div>
                <LoadedText start="Miners" value={globalAccount?.miners} />
                <LoadedText start="Mining Reward" value={miningReward} />
                <LoadedText start="Mining Cost" value={miningCost} />
                <div className="flex flex-col w-[150px] lg:w-[200px] xl:w-[250px] justify-center items-center gap-1 md:gap-2">
                  {timeLeft < 0 ?
                    <BasicButton onClick={onMine} text="Mine in new epoch" />
                    :
                    <BasicButton onClick={onMine} text="Mine" disabled={isMining} />
                  }
                  {isMining && <p>You are already mining!</p>}
                </div>
              </>
              :
              state === 1 || state === undefined ?
                <>
                  <p className="uppercase text-4xl lg:text-6xl font-extrabold mb-10">CLAIM</p>
                  <p className="text-4xl font-bold">{`${Math.round(claimable / (10 ** TOKEN_DECIMALS) * 1000) / 1000} $OGG`}</p>
                  <div className="w-[150px] lg:w-[200px] xl:w-[250px]">
                    <BasicButton onClick={onClaim} text="Claim" />
                  </div>
                </>
                :
                state === 3 ?
                  <>
                    <p className="uppercase text-4xl lg:text-6xl font-extrabold mb-10">INFO</p>
                    <p>Welcome to the OG Mine. The mine <ImportantSpan>emits $OGG</ImportantSpan>, the scarce reserves of the Realm of OGs.</p>
                    <p> <ImportantSpan>60% (600M)</ImportantSpan> of $OGG is forever allocated to the mine.</p>
                    <p>Emissions equal <ImportantSpan>1% of the mine&apos;s $OGG balance</ImportantSpan> each epoch. Epochs <ImportantSpan>last for 24 hours</ImportantSpan>  beginning at 00:00 UTC.</p>
                    <p>Wallets can mine each epoch for their equal proportion of $OGG. <ImportantSpan>Mining cost increases with each new miner during an epoch.</ImportantSpan>  Difficulty resets each epoch.</p>
                    <p>Mining fees <ImportantSpan>are currently paid in $SOL</ImportantSpan>.  $OGG and $OGC will soon be allowed.</p>
                    <p>100% of mining fees collected go towards repurchasing $OGG from the open market to replenish the mine. $OGG mined but <ImportantSpan>unclaimed after 10 epochs is returned to the mine.</ImportantSpan> </p>
                    <p>Those with $OGG reserves will fare well in the Realm of OGs</p>
                  </>
                  :
                  <>
                    <p className="uppercase text-4xl lg:text-6xl font-extrabold mb-10">STATS</p>
                    <div className="flex flex-col justify-start items-center overflow-y-auto max-h-[300px] lg:max-h-[400px] xl:max-h-[500px] gap-2 w-full">
                      <p>Total Epochs Completed: {globalAccount?.epoch}</p>
                      <p>Longest mining streak: {infoData?.longestStreak}</p>
                      <p>Unique wallets: {infoData?.uniqueWallets}</p>
                      <Chart data={chartData} />
                      <p className="lg:text-2xl text-xl font-bold">Leaderboard</p>
                      <div className="grid grid-cols-3 w-full">
                        <p>Owner</p>
                        <p>$OGG Claimed</p>
                        <p>Epochs participated in</p>
                      </div>
                      {leaderboard?.map((l: any, i: number) => <LeaderboardRow key={i} row={l} />)}
                    </div>
                  </>
            }
            <Countdown timeLeft={timeLeft} />
          </div>
        </GradientBorder>
      </div>
    </div>
  );
}

function ImportantSpan({ children }: { children: React.ReactNode; }) {
  return (
    <span className="text-yellow-400 font-bold">
      {children}
    </span>
  );
}