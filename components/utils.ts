import test from "./test.json";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";

export const programId = new PublicKey(test.address);
const mint: PublicKey = process.env.NEXT_PUBLIC_NETWORK === "devnet" ? new PublicKey("C6DBjjvSSseqgd4akx1CtGmjLMDZv4ZXAoGt3yjkL14m") : new PublicKey("2sP9bY51NdqHGtHQfRduxUTnuPvugPAoPqtfrBR2VRCL");
function getProgram() {
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    return new Program(test as any, provider) as any;
}
export async function getLeaderboard() {
    const program = getProgram();
    try {
        const accounts = await program.account.mineData.all();
        return accounts;
    } catch (e) {
        console.error(e);
        return [];
    }
}
export async function getGlobalAccount() {
    const program = getProgram();
    try {
        const [globalAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("global")],
            program.programId
        );
        const account = await program.account.globalDataAccount.fetch(globalAccount);
        return account;
    } catch (e) {
        return null;
    }
}
const STARTING_REWARD = 1000;
async function reward(epoch: number, program: any): Promise<number> {
    const [epochAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from("epoch"), new BN(epoch).toArrayLike(Buffer, "le", 8)],
        programId,
    );
    const data = await program.account.epochAccount.fetch(epochAccountAddress);
    console.log(data);
    console.log(data.reward.toNumber());
    return data.reward.toNumber();
}
export async function getClaimableAmount(wallet: PublicKey, current: number) {
    const program = getProgram();
    const accounts: any[] = await program.account.mineAccount.all([
        {
            memcmp: {
                offset: 8,
                bytes: wallet.toBase58()
            }
        }
    ]);
    let total = 0;
    for (const account of accounts) {
        if (account.account.epoch.toNumber() === current) continue;
        const amount = await reward(account.account.epoch, program);
        total += amount;
    }
    return total;
}
export async function getEpochAccount(epoch: number) {
    const program = getProgram();
    const num = new BN(epoch);
    const [account] = PublicKey.findProgramAddressSync(
        [Buffer.from("epoch"), num.toArrayLike(Buffer, "le", 8)],
        program.programId
    );
    const data = await program.account.epochAccount.fetch(account);
    return data;
}
export async function getProgramBalance() {
    const [account] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_account")],
        programId
    );
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const acc = await getAccount(connection, account);
    return acc.amount;
}
export async function getProgramSolBalance() {
    const [account] = PublicKey.findProgramAddressSync(
        [Buffer.from("auth")],
        programId,
    );
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    return await connection.getBalance(account) / LAMPORTS_PER_SOL;
}
export async function isUserMining(wallet: PublicKey, epoch: number): Promise<boolean> {
    try {
        const program = getProgram();
        const num = new BN(epoch);
        const [account] = PublicKey.findProgramAddressSync(
            [Buffer.from("mine"), wallet.toBuffer(), num.toArrayLike(Buffer, "le", 8)],
            program.programId,
        );
        const data = await program.account.mineAccount.fetch(account);
        return !!data;
    } catch (e) {
        return false;
    }
}
export async function initialize(wallet: PublicKey) {
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(test as any, provider) as any;
    console.log(mint.toString());
    const i1 = await program.methods.initialize().accounts({
        signer: wallet,
        mint,
    }).transaction();
    const i2 = await program.methods.newEpoch(new BN(1)).accounts({
        signer: wallet
    }).transaction();
    const tx = new Transaction();
    tx.add(i1, i2);
    tx.feePayer = wallet;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    await provider.sendAndConfirm(tx);
}
export async function fund(wallet: PublicKey, amount: number) {
    const program = getProgram();
    const signerTokenAccount = getAssociatedTokenAddressSync(mint, wallet);
    await program.methods.fundProgramToken(new BN(amount)).accounts({
        signer: wallet,
        signerTokenAccount,
    }).rpc();
}
export async function withdraw(wallet: PublicKey, amount: number) {
    const program = getProgram();
    await program.methods.withdrawFees(new BN(amount)).accounts({
        signer: wallet,
    });
}
export async function newEpoch(wallet: PublicKey, epoch: number) {
    const program = getProgram();
    await program.methods.newEpoch(new BN(epoch)).accounts({
        signer: wallet,
    }).rpc();
}
export async function mine(wallet: PublicKey, epoch: number, timeLeft: number) {
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(test as any, provider) as any;
    if (timeLeft < 0) {
        const i1 = await program.methods.newEpoch(new BN(epoch + 1)).accounts({ signer: wallet }).transaction();
        const i2 = await program.methods.mine(new BN(epoch + 1)).accounts({ signer: wallet }).transaction();
        const transaction = new Transaction().add(i1, i2);
        await provider.sendAndConfirm(transaction);
    } else {
        await program.methods.mine(new BN(epoch)).accounts({
            signer: wallet
        }).rpc();
    }
}
export async function claim(wallet: PublicKey, current: number) {
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(test as any, provider) as any;
    const accounts: any[] = await program.account.mineAccount.all([
        {
            memcmp: {
                offset: 8,
                bytes: wallet.toBase58()
            }
        }
    ]);
    const signerTokenAccount = getAssociatedTokenAddressSync(mint, wallet);
    for (let i = 0; i < accounts.length; i += 10) {
        const tx = new Transaction();
        for (let ii = i; ii < i + 10 && accounts[ii]; ii++) {
            if (accounts[ii].account.epoch.toNumber() === current) continue;
            const ix = await program.methods.claim(accounts[ii].account.epoch).accounts({
                signer: wallet,
                signerTokenAccount,
                mint,
            }).transaction();
            tx.add(ix);
        }
        await provider.sendAndConfirm(tx);
    }
}
export function toHexString(number: number) {
    return number.toString(16);
}

export function calculateMiningPrice(miners: number) {
    return (LAMPORTS_PER_SOL * 0.005 * miners ** 2) / LAMPORTS_PER_SOL;
}