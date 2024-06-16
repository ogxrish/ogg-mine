import BasicButton from "@/components/BasicButton";
import Window from "@/components/Window";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import TransactionPending from "@/components/TransactionPending";
import TransactionFailure from "@/components/TransactionFailure";
import TransactionSuccess from "@/components/TransactionSuccess";
import WalletButton from "@/components/WalletButton";
import { getGlobalAccount } from "@/components/utils";
import LoadedText from "@/components/LoadedText";

type GlobalAccount = {
  miners: number,
  epochEnd: number,
  state: number,
};
export default function Home() {
  const { publicKey } = useWallet();
  const [succeededTransaction, setSucceededTransaction] = useState<boolean>(false);
  const [failedTransaction, setFailedTransaction] = useState<boolean>(false);
  const [sendingTransaction, setSendingTransaction] = useState<boolean>(false);
  const [globalAccount, setGlobalAccount] = useState<GlobalAccount>();
  useEffect(() => {
    (async () => {
      const globalAccount: any = await getGlobalAccount();
      if (globalAccount) {
        setGlobalAccount({
          miners: globalAccount.miners.toNumber(),
          epochEnd: globalAccount.epochEnd.toNumber(),
          state: globalAccount.state
        });
      }
    })();
  }, []);
  const onMine = async () => {
    try {
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
  const onClaim = async () => {
    try {

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
    <div className="flex flex-col justify-center items-center gap-6 px-6 mt-6 w-full relative">
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
      <div className="grid grid-cols-2 gap-6 w-full">
        <Window>
          <div className="w-full h-full flex flex-col justify-between items-start gap-2">
            <LoadedText start="Miners " value={globalAccount?.miners} />
            <LoadedText start="Mining Reward" value={0} />
            <LoadedText start="Mining Epoch Remaining" value={0} />
            <div className="w-full flex flex-row justify-center items-center">
              <BasicButton onClick={onMine} text="Mine" disabled={globalAccount?.state !== 1} />
            </div>
          </div>
        </Window>
        <Window>
          <div className="w-full h-full flex flex-col justify-between items-start gap-2">
            <LoadedText start="Claiming Epoch Starts" value={0} />
            <LoadedText start="$SPORE to claim" value={0} />
            <div className="w-full flex flex-row justify-center items-center">
              <BasicButton onClick={onClaim} text="Claim" disabled={globalAccount?.state !== 2} />
            </div>
          </div>
        </Window>
      </div>
    </div>
  );
}
// type NFT = {
//   mint: PublicKey;
//   name: string;
//   image: string;
//   selected: boolean;
//   staked: boolean;
// };
// export default function Home() {
//   const { publicKey, connected } = useWallet();
//   const [sendingTransaction, setSendingTransaction] = useState<boolean>(false);
//   const [failedTransaction, setFailedTransaction] = useState<boolean>(false);
//   const [succeededTransaction, setSucceededTransaction] = useState<boolean>(false);
//   const [nfts, setNfts] = useState<NFT[]>([]);
//   const [loadedNfts, setLoadedNfts] = useState<boolean>(false);
//   const [globalData, setGlobalData] = useState<Awaited<ReturnType<typeof getGlobalData>>>();
//   const [userData, setUserData] = useState<Awaited<ReturnType<typeof getData>>>();
//   const [hasUserAccount, setHasUserAccount] = useState<boolean>(false);
//   useEffect(() => {
//     updateGlobalData();
//     const interval = setInterval(updateGlobalData, 5000);
//     return () => {
//       clearInterval(interval);
//     };
//   }, []);
//   useEffect(() => {
//     if (!publicKey) return;
//     (async () => {
//       setHasUserAccount(await checkUserInitialized(publicKey));
//     })();
//   }, [publicKey]);
//   const updateGlobalData = () => {
//     getGlobalData().then((value) => {
//       setGlobalData(value);
//     });
//   };
//   useEffect(() => {
//     if (!connected || !publicKey) return;
//     (async () => {
//       const connection = new Connection(network);
//       const metaplex = Metaplex.make(connection);
//       const all = await metaplex.nfts().findAllByOwner({ owner: publicKey });
//       const nfts: any = all.filter((nft) => {
//         for (const creator of nft.creators) {
//           if (creator.verified) {
//             if (creator.address.equals(programAuthority)) {
//               return true;
//             }
//           }
//           return false;
//         }
//       });
//       const data = await getData(publicKey);
//       setUserData(data);
//       setNfts([...nfts, ...data.staked].map((nft: any) => {
//         return {
//           mint: nft.mintAddress || nft,
//           image: "/placeholder-square.jpg",
//           name: nft.name || "Spore",
//           selected: false,
//           staked: !Boolean(nft.mintAddress),
//         };
//       }));
//       console.log("loaded nfts");
//       setLoadedNfts(true);
//     })();

//   }, [connected, publicKey]);
//   const select = async (mint: PublicKey) => {
//     setNfts((prevNfts) =>
//       prevNfts.map((nft) =>
//         nft.mint.equals(mint) ? { ...nft, selected: !nft.selected } : nft
//       )
//     );
//   };
//   const onStake = async () => {
//     if (!publicKey) return;
//     const toStake = nfts.filter((nft) => nft.selected);
//     for (const nft of toStake) {
//       if (!nft.staked) {
//         try {
//           setSendingTransaction(true);
//           await stake(publicKey, nft.mint);
//           setSucceededTransaction(true);
//           setNfts(prevNfts =>
//             prevNfts.map(n => n.mint.equals(nft.mint) ? { ...n, staked: true } : { ...n })
//           );
//         } catch (e) {
//           console.error(e);
//           setFailedTransaction(true);
//         } finally {
//           setSendingTransaction(false);
//           setTimeout(() => {
//             setFailedTransaction(false);
//             setSucceededTransaction(false);
//           }, 1000);
//         }
//       }
//     }
//   };
//   const onUnstake = async () => {
//     if (!publicKey) return;
//     const toUnstake = nfts.filter((nft) => nft.selected);
//     for (const nft of toUnstake) {
//       if (nft.staked) {
//         try {
//           setSendingTransaction(true);
//           await unstake(publicKey, nft.mint);
//           setSucceededTransaction(true);
//           setNfts(prevNfts =>
//             prevNfts.map(n => n.mint.equals(nft.mint) ? { ...n, staked: false } : { ...n })
//           );

//         } catch (e) {
//           console.error(e);
//           setFailedTransaction(true);
//         } finally {
//           setSendingTransaction(false);
//           setTimeout(() => {
//             setFailedTransaction(false);
//             setSucceededTransaction(false);
//           }, 1000);
//         }
//       }
//     }
//   };
//   const onClaim = async () => {
//     if (!publicKey) return;
//     try {
//       setSendingTransaction(true);
//       await claim(publicKey);
//       setSucceededTransaction(true);
//     } catch (e) {
//       console.error(e);
//       setFailedTransaction(true);
//     } finally {
//       setSendingTransaction(false);
//       setTimeout(() => {
//         setFailedTransaction(false);
//         setSucceededTransaction(false);
//       }, 1000);
//     }
//   };
//   const onMint = async () => {
//     if (!publicKey) return;
//     try {
//       setSendingTransaction(true);
//       const minted = await mint(publicKey);
//       console.log(minted);
//       setSucceededTransaction(true);
//     } catch (e) {
//       console.error(e);
//       setFailedTransaction(true);
//     } finally {
//       setSendingTransaction(false);
//       setTimeout(() => {
//         setFailedTransaction(false);
//         setSucceededTransaction(false);
//       }, 1000);
//     }
//   };
//   const onCreateUserAccount = async () => {
//     if (!publicKey) return;
//     try {
//       await createUserAccount(publicKey);
//       setSucceededTransaction(true);
//       setHasUserAccount(true);
//     } catch (e) {
//       console.error(e);
//       setFailedTransaction(true);
//     } finally {
//       setSendingTransaction(false);
//       setTimeout(() => {
//         setFailedTransaction(false);
//         setSucceededTransaction(false);
//       }, 1000);
//     }
//   };
//   return (
//     <div className="flex flex-col justify-center items-center gap-6 px-6 mt-6 w-full relative">
//       {!publicKey &&
//         <div className="flex justify-center items-start w-full h-full absolute top-0 left-0 bg-black/80">
//           <div className="flex flex-col p-10 gap-5 justify-center items-center bg-black border-white border-2 rounded-lg mt-10">
//             <p>Connect Wallet</p>
//             <WalletButton />
//           </div>
//         </div>
//       }
//       {publicKey && !hasUserAccount &&
//         <div className="flex justify-center items-start w-full h-full absolute top-0 left-0 bg-black/80">
//           <div className="flex flex-col p-10 gap-5 justify-center items-center bg-black border-white border-2 rounded-lg mt-10">
//             <BasicButton text="Create User Account" onClick={onCreateUserAccount} />
//           </div>
//         </div>
//       }
//       {succeededTransaction &&
//         <div className="fixed bottom-0 right-0 mr-6 mb-6">
//           <TransactionSuccess />
//         </div>
//       }
//       {failedTransaction &&
//         <div className="fixed bottom-0 right-0 mr-6 mb-6">
//           <TransactionFailure />
//         </div>
//       }
//       {sendingTransaction &&
//         <div className="fixed bottom-0 right-0 mr-6 mb-6">
//           <TransactionPending />
//         </div>
//       }
//       <div className="grid grid-cols-2 gap-6 w-full">
//         <Window>
//           <div className="flex flex-col justify-between gap-2 w-full h-full">
//             <LoadedText start="NFTs Minted" value={globalData?.minted} />
//             <LoadedText start="NFTs in Circulation" value={globalData?.circulation} />
//             <TextInfo text="Mint curve progress" info="" />
//             <MintGraph pos={globalData?.minted ?? 0} />
//             <LoadedText start="Current Mint Price" text="&%%& $SPORE" value={globalData?.mintPrice} />
//             <div className="flex items-center justify-center w-full">
//               <BasicButton onClick={onMint} text="Mint" />
//             </div>
//           </div>
//         </Window>
//         <Window>
//           <div className="w-full h-full flex flex-col justify-between gap-2">
//             <LoadedText start="NFTs Staked" value={globalData?.staked} />
//             <TextInfo text="Stake curve progress" info="" />
//             <StakeGraph pos={globalData?.staked ?? 0} />
//             <LoadedText start="Current Reward" text="&%%& / nft / day" value={globalData?.stakeReward} />
//             {loadedNfts && nfts.length === 0 ?
//               <div className="flex flex-col justify-center items-center gap-2">
//                 <p className="w-full text-center underline">
//                   {`You don't have any NFTs`}
//                 </p>
//                 <div className="flex flex-row justify-center items-center gap-2">
//                   <MagicEdenLink />
//                   <TensorLink />
//                 </div>
//               </div>
//               :
//               <div className="flex gap-4 overflow-x-auto">
//                 {loadedNfts ?
//                   nfts.map((nft, i) => <NFTWidget key={i} {...nft} onSelect={() => select(nft.mint)} />)
//                   :
//                   Array.from({ length: 4 }).map((_, i: number) =>
//                     <div key={i} className="inline-block w-[240px]">
//                       <SkeletonSquare key={i} />
//                     </div>
//                   )
//                 }
//               </div>
//             }
//             <div className="flex flex-row justify-center items-center w-full gap-2">
//               <BasicButton onClick={onStake} text="Stake" />
//               <BasicButton onClick={onUnstake} text="Unstake" />
//             </div>
//           </div>
//         </Window>
//       </div>
//       <div className="flex flex-row justify-center items-center w-full">
//         <div className="w-[800px]">
//           <Window>
//             <div className="flex flex-col justify-between items-center h-full w-full gap-2">
//               <BigLoading amount={userData?.claimable} />
//               <p className="italic text-center">{`Earning ${userData?.earning || "0"} $SPORE / day`}</p>
//               <BasicButton onClick={onClaim} text="Claim" />
//             </div>
//           </Window>
//         </div>
//       </div>
//     </div>
//   );
// }

// function TextInfo({ text, info }: { text: string, info: string; }) {
//   return (
//     <div className="flex flex-row gap-2 hover:scale-105 transition-all duration-200 text-xl">
//       <p className="underline font-bold">{text}</p>
//       <p>{info}</p>
//     </div>
//   );
// }
