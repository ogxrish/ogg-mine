import test from "./test.json";
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";

export const programId = new PublicKey(test.address);
export const TOKEN_DECIMALS = 9;
const mint: PublicKey = process.env.NEXT_PUBLIC_NETWORK === "devnet" ?
    new PublicKey("A27kk6wucoGXJdEG9HYURnk9HxByGnAMQDEQuDNUY9BC") :
    new PublicKey("5gJg5ci3T7Kn5DLW4AQButdacHJtvADp7jJfNsLbRc1k");
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
export async function getTotalRewardAmount(globalAccount: any): Promise<number> {
    const [account] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_account")],
        programId
    );
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const acc = await getAccount(connection, account);
    return Number(acc.amount.toString()) / 100 * globalAccount.epochRewardPercent.toNumber();
}
async function reward(epoch: number, program: any): Promise<number> {
    const [epochAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from("epoch"), new BN(epoch).toArrayLike(Buffer, "le", 8)],
        programId,
    );
    const data = await program.account.epochAccount.fetch(epochAccountAddress);
    console.log(data);
    console.log(data.reward.toNumber());
    return data.reward.toNumber() / data.totalMiners.toNumber();
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
    const [prevEpochAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("epoch"), new BN(0).toArrayLike(Buffer, "le", 8)],
        programId,
    );
    const i0 = await program.methods.initializeEpoch(new BN(0)).accounts({
        signer: wallet,
    }).transaction();
    const i1 = await program.methods.initialize().accounts({
        signer: wallet,
        mint,
    }).transaction();
    const i2 = await program.methods.newEpoch(new BN(1)).accounts({
        signer: wallet,
        prevEpochAccount,
    }).transaction();
    const tx = new Transaction();
    tx.add(i0, i1, i2);
    tx.feePayer = wallet;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    await provider.sendAndConfirm(tx);
}
export async function fund(wallet: PublicKey, amount: number) {
    const program = getProgram();
    const signerTokenAccount = getAssociatedTokenAddressSync(mint, wallet);
    await program.methods.fundProgramToken(new BN(amount).mul(new BN(10 ** TOKEN_DECIMALS))).accounts({
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
    const [prevEpochAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from("epoch"), new BN(epoch - 1).toArrayLike(Buffer, "le", 8)],
        programId
    );
    await program.methods.newEpoch(new BN(epoch)).accounts({
        signer: wallet,
        prevEpochAccount
    }).rpc();
}
export async function mine(wallet: PublicKey, epoch: number, timeLeft: number) {
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(test as any, provider) as any;
    if (timeLeft < 0) {
        const [prevEpochAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("epoch"), new BN(epoch).toArrayLike(Buffer, "le", 8)],
            programId
        );
        const i1 = await program.methods.newEpoch(new BN(epoch + 1)).accounts({ signer: wallet, prevEpochAccount }).transaction();
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
    for (let i = 0; i < accounts.length; i += 5) {
        const tx = new Transaction();
        for (let ii = i; ii < i + 5 && accounts[ii]; ii++) {
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
export async function changeData(wallet: PublicKey, epochRewardPercent: number, epochLength: number, feeAmount: number) {
    const program = getProgram();
    await program.methods.changeGlobalParameters(new BN(epochRewardPercent), new BN(epochLength), new BN(feeAmount)).accounts({
        signer: wallet
    }).rpc();
}
export function toHexString(number: number) {
    return number.toString(16);
}

export function calculateMiningPrice(miners: number, globalAccount: any) {
    return (globalAccount.feeLamports * miners ** 2) / LAMPORTS_PER_SOL;
}

export function commas(number: string): string {
    return number.split("").reverse().map((s: string, i: number) => {
        if (i % 3 === 0 && i != 0) {
            return `${s},`;
        } else {
            return s;
        }
    }).reduce((prev, curr) => curr + prev, "");
}