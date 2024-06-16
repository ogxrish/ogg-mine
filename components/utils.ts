import { AnchorProvider, BN, Program } from "@project-serum/anchor";
import mycelium2 from "./mycelium_2.json";
import { Connection, Keypair, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { findMasterEditionPda, findMetadataPda, MPL_TOKEN_METADATA_PROGRAM_ID, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";

export const programId = new PublicKey("CMLBhrxJKPXr8GEJznTvgj9yiEskNH1anA2UUpQ5kV4G");
const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
const [globalAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("global")],
    programId,
);
const [programAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("auth")],
    programId
);
const [mint] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint")],
    programId
);
export async function getGlobalAccount() {
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(mycelium2 as any, programId, provider);
    try {
        const account = await program.account.globalAccount.fetch(globalAccount);
        return account;
    } catch (e) {
        return null;
    }
}
export async function isUserMining(wallet: PublicKey): Promise<boolean> {
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(mycelium2 as any, programId, provider);
    try {
        const [mineAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("mine"), wallet.toBuffer()],
            programId
        );
        await program.account.mineAccount.fetch(mineAccount);
        return true;
    } catch (e) {
        return false;
    }
}
export async function initialize(wallet: PublicKey) {
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(mycelium2 as any, programId, provider);
    await program.methods.initialize().accounts({
        signer: wallet,
        mint,
        globalAccount,
        programAuthority,
    }).rpc();
}
export async function updateState(wallet: PublicKey) {
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(mycelium2 as any, programId, provider);
    await program.methods.updateState().accounts({
        signer: wallet,
        globalAccount
    }).rpc();
}
export async function mine(wallet: PublicKey) {
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(mycelium2 as any, programId, provider);
    const [mineAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("mine"), wallet.toBuffer()],
        programId
    );
    await program.methods.mine().accounts({
        signer: wallet,
        mineAccount,
        globalAccount,
    }).rpc();
}
export async function claim(wallet: PublicKey) {
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(mycelium2 as any, programId, provider);
    const [mineAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("mine"), wallet.toBuffer()],
        programId
    );
    const userTokenAccount = getAssociatedTokenAddressSync(mint, wallet);
    await program.methods.claim().accounts({
        signer: wallet,
        mineAccount,
        globalAccount,
        mint,
        userTokenAccount,
        programAuthority
    }).rpc();
}
// const connection = new Connection("https://devnet.helius-rpc.com/?api-key=7676ad08-d009-4d7b-ad36-2df7214b03c1");
// export const umi = createUmi(connection).use(mplTokenMetadata());
// export const [programAuthority] = PublicKey.findProgramAddressSync(
//     [Buffer.from("auth")],
//     programId,
// );
// export const [bank] = PublicKey.findProgramAddressSync(
//     [Buffer.from("bank")],
//     programId
// );
// const [stakeData] = PublicKey.findProgramAddressSync(
//     [Buffer.from("stake_data")],
//     programId
// );
// const [mintData] = PublicKey.findProgramAddressSync(
//     [Buffer.from("mint_data")],
//     programId
// );
// const tokenMint = new PublicKey("4XfDHku4j8BngaD7xrkmWGtGvcVcJXLuJZNNtqNp7vHF");
// export async function getData(wallet: PublicKey) {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     try {
//         const [stakeInfo] = PublicKey.findProgramAddressSync(
//             [Buffer.from("stake"), wallet.toBuffer()],
//             programId,
//         );
//         const account: any = await program.account.stakeInfo.fetch(stakeInfo);
//         let claimable = 0;
//         const now = Date.now();
//         for (const time of account.stakedTimes) {
//             claimable += now - Number(time.toString());
//         }
//         console.log(account);
//         return {
//             staked: account.mints,
//             stakedAmount: account.mints.length,
//             earning: account.mints.length * 10,
//             claimable,
//         };
//     } catch (e) {
//         console.error(e);
//         return {
//             staked: [],
//             stakedAmount: 0,
//             earning: 0,
//             claimable: 0,
//         };
//     }
// }
// export async function getGlobalData() {
//     try {
//         return {
//             minted: 0,
//             burned: 0,
//             circulation: 0,
//             staked: 0,
//             mintPrice: 0,
//             stakeReward: 0
//         };
//     } catch (e) {
//         console.error(e);
//         return {
//             minted: 0,
//             burned: 0,
//             circulation: 0,
//             staked: 0,
//             mintPrice: 0,
//             stakeReward: 0,
//         };
//     }
// }
// export async function checkUserInitialized(wallet: PublicKey) {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     try {
//         const [stakeInfo] = PublicKey.findProgramAddressSync(
//             [Buffer.from("stake"), wallet.toBuffer()],
//             programId
//         );
//         const data = await program.account.stakeInfo.fetch(stakeInfo);
//         console.log(data);
//         return !!data;
//     } catch (e) {
//         console.error(e);
//         return false;
//     }
// }
// export async function initialize(wallet: PublicKey) {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     await program.methods.initialize().accounts({
//         mint: tokenMint,
//         bank,
//         programAuthority,
//         user: wallet,
//     }).rpc();
//     await program.methods.initialize2().accounts({
//         stakeData,
//         mintData,
//         user: wallet,
//     }).rpc();
// }
// export async function createUserAccount(wallet: PublicKey) {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     const [stakeInfo] = PublicKey.findProgramAddressSync(
//         [Buffer.from("stake"), wallet.toBuffer()],
//         program.programId,
//     );
//     const [userStorageAccount] = PublicKey.findProgramAddressSync(
//         [Buffer.from("account"), wallet.toBuffer()],
//         programId
//     );
//     await program.methods.initializeUser().accounts({
//         user: wallet,
//         userStorageAccount,
//         bank,
//         mint: tokenMint,
//         programAuthority,
//         stakeInfo
//     }).rpc();
// }
// export async function fund(wallet: PublicKey, amount: number) {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, wallet);
//     await program.methods.fund(new BN(amount * 10 ** 9)).accounts({
//         user: wallet,
//         bank,
//         userTokenAccount,
//     }).rpc();
// }
// export async function mint(wallet: PublicKey): Promise<PublicKey> {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     const mint = Keypair.generate();
//     const associatedTokenAccount = getAssociatedTokenAddressSync(mint.publicKey, wallet);
//     const [metadataAccount] = findMetadataPda(umi, { mint: publicKey(mint.publicKey) });
//     const [masterEditionAccount] = findMasterEditionPda(umi, { mint: publicKey(mint.publicKey) });
//     await program.methods.mintNft().accounts({
//         signer: wallet,
//         mint: mint.publicKey,
//         associatedTokenAccount,
//         metadataAccount,
//         masterEditionAccount,
//         programAuthority,
//         tokenProgram: TOKEN_PROGRAM_ID,
//         associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
//         tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
//         systemProgram: SystemProgram.programId,
//         rent: SYSVAR_RENT_PUBKEY,
//     }).signers([mint]).rpc();
//     return mint.publicKey;
// }
// export async function stake(wallet: PublicKey, nftMint: PublicKey) {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     const nftAddress = getAssociatedTokenAddressSync(nftMint, wallet);
//     const [stakeInfo] = PublicKey.findProgramAddressSync(
//         [Buffer.from("stake"), wallet.toBuffer()],
//         program.programId,
//     );
//     const [stakeAccount] = PublicKey.findProgramAddressSync(
//         [Buffer.from("stake_account"), wallet.toBuffer(), nftAddress.toBuffer()],
//         program.programId,
//     );
//     const [metadataAccount] = findMetadataPda(umi, { mint: publicKey(nftMint) });
//     await program.methods.stake().accounts({
//         user: wallet,
//         stakeInfo,
//         stakeAccount,
//         nftAccount: nftAddress,
//         nftMetadataAccount: metadataAccount,
//         nftMint,
//         programAuthority,
//         tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID
//     }).rpc();
// }
// export async function unstake(wallet: PublicKey, nftMint: PublicKey) {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     const nftAddress = getAssociatedTokenAddressSync(nftMint, wallet);
//     const [stakeInfo] = PublicKey.findProgramAddressSync(
//         [Buffer.from("stake"), wallet.toBuffer()],
//         program.programId,
//     );
//     const [stakeAccount] = PublicKey.findProgramAddressSync(
//         [Buffer.from("stake_account"), wallet.toBuffer(), nftAddress.toBuffer()],
//         program.programId,
//     );
//     await program.methods.unstake().accounts({
//         user: wallet,
//         stakeInfo,
//         stakeAccount,
//         nftAccount: nftAddress,
//         programAuthority
//     }).rpc();
// }
// export async function claim(wallet: PublicKey) {
//     // @ts-ignore
//     const provider = new AnchorProvider(connection, window.solana, AnchorProvider.defaultOptions());
//     const program = new Program(mycelium as any, programId, provider);
//     const [stakeInfo] = PublicKey.findProgramAddressSync(
//         [Buffer.from("stake"), wallet.toBuffer()],
//         program.programId,
//     );
//     const [userStorageAccount] = PublicKey.findProgramAddressSync(
//         [Buffer.from("account"), wallet.toBuffer()],
//         program.programId,
//     );
//     const crank = await program.methods.crank().accounts({
//         signer: wallet,
//         user: wallet,
//         userStorageAccount,
//         bank,
//         stakeInfo,
//     }).transaction();
//     const userTokenAccount = getAssociatedTokenAddressSync(tokenMint, wallet);
//     const claim = await program.methods.claim().accounts({
//         user: wallet,
//         programAuthority,
//         userStorageAccount,
//         userTokenAccount,
//     }).transaction();
//     const transaction = new Transaction().add(crank).add(claim);
//     await provider.sendAndConfirm(transaction);
// }