import NavBar from "@/components/NavBar";
import "@/styles/globals.css";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import type { AppProps } from "next/app";
import { useMemo } from "react";
require('@solana/wallet-adapter-react-ui/styles.css');

const devnet = "https://devnet.helius-rpc.com/?api-key=7676ad08-d009-4d7b-ad36-2df7214b03c1";
export default function App({ Component, pageProps }: AppProps) {
  const endpoint = useMemo(() => devnet, []);
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect={true}>
        <WalletModalProvider>
          <div className="flex flex-col justify-start items-center w-full h-screen bg-cover" style={{ backgroundImage: `url("/giphy3.gif")` }}>
            <NavBar />
            <Component {...pageProps} />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
