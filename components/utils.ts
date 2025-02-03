import test from "./test.json";
import { LAMPORTS_PER_SOL, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import { AnchorProvider, BN, Program } from "@coral-xyz/anchor";
import {
    BlockhashWithExpiryBlockHeight,
    Connection,
    TransactionExpiredBlockheightExceededError,
    VersionedTransactionResponse,
} from "@solana/web3.js";
import promiseRetry from "promise-retry";

export const programId = new PublicKey(test.address);
export const TOKEN_DECIMALS = 9;
const mint: PublicKey = process.env.NEXT_PUBLIC_NETWORK === "devnet" ?
    new PublicKey("A27kk6wucoGXJdEG9HYURnk9HxByGnAMQDEQuDNUY9BC") :
    new PublicKey("5gJg5ci3T7Kn5DLW4AQButdacHJtvADp7jJfNsLbRc1k");
const ogcMint: PublicKey = new PublicKey("DH5JRsRyu3RJnxXYBiZUJcwQ9Fkb562ebwUsufpZhy45");
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
export async function getTotalRewardAmount(epochRewardPercent: number): Promise<number> {
    const [account] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_account")],
        programId
    );
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const acc = await getAccount(connection, account);
    return Number(acc.amount.toString()) / 100 * epochRewardPercent;
}
async function reward(epoch: number, program: any): Promise<number> {
    const [epochAccountAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from("epoch"), new BN(epoch).toArrayLike(Buffer, "le", 8)],
        programId,
    );
    const data = await program.account.epochAccount.fetch(epochAccountAddress);
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
export async function mine(wallet: PublicKey, epoch: number, timeLeft: number, swap: boolean, amount: number) {
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    const provider = new AnchorProvider(connection, (window as any).solana, AnchorProvider.defaultOptions());
    const program = new Program(test as any, provider) as any;
    const transaction = new Transaction();
    if (swap) {
        const transaction = await jupiterSwapTx(amount, wallet);
        const latestBlockHash = await connection.getLatestBlockhash();
        console.log("here");
        // Execute the transaction
        const tx = await provider.wallet.signTransaction(transaction);
        const rawTransaction = tx.serialize();
        const result = await transactionSenderAndConfirmationWaiter({
            connection,
            serializedTransaction: rawTransaction as any,
            blockhashWithExpiryBlockHeight: latestBlockHash
        });
        console.log(result?.transaction.signatures);
        // const txid = await connection.sendRawTransaction(rawTransaction, {
        //     skipPreflight: true,
        //     maxRetries: 2
        // });

        // const sig = await connection.confirmTransaction({
        //     blockhash: latestBlockHash.blockhash,
        //     lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        //     signature: txid
        // });
    }
    if (timeLeft < 0) {
        const [prevEpochAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("epoch"), new BN(epoch).toArrayLike(Buffer, "le", 8)],
            programId
        );
        const i1 = await program.methods.newEpoch(new BN(epoch + 1)).accounts({ signer: wallet, prevEpochAccount }).transaction();
        const i2 = await program.methods.mine(new BN(epoch + 1)).accounts({ signer: wallet }).transaction();
        transaction.add(i1, i2);
    } else {
        const tx = await program.methods.mine(new BN(epoch)).accounts({
            signer: wallet
        }).transaction();
        transaction.add(tx);
    }
    await provider.sendAndConfirm(transaction);
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
export async function jupQuote(from: string, to: string, amount: number) {
    const quoteResponse = await (
        await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${from}&outputMint=${to}&amount=${amount}&slippageBps=50`)
    ).json();
    return quoteResponse;
}

export async function jupiterSwapTx(amount: number, publicKey: PublicKey) {
    const quoteResponse = await (
        await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${ogcMint.toString()}&outputMint=So11111111111111111111111111111111111111112&amount=${amount}&slippageBps=50`)
    ).json();
    const { swapTransaction } = await (
        await fetch('https://quote-api.jup.ag/v6/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                // quoteResponse from /quote api
                quoteResponse,
                // user public key to be used for the swap
                userPublicKey: publicKey.toString(),
                // auto wrap and unwrap SOL. default is true
                wrapAndUnwrapSol: true,
                // Optional, use if you want to charge a fee.  feeBps must have been passed in /quote API.
                // feeAccount: "fee_account_public_key"
            })
        })
    ).json();
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    let transaction = VersionedTransaction.deserialize(swapTransactionBuf as any);
    return transaction;
}

type TransactionSenderAndConfirmationWaiterArgs = {
    connection: Connection;
    serializedTransaction: Buffer;
    blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight;
};

const SEND_OPTIONS = {
    skipPreflight: true,
};
function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export async function transactionSenderAndConfirmationWaiter({
    connection,
    serializedTransaction,
    blockhashWithExpiryBlockHeight,
}: TransactionSenderAndConfirmationWaiterArgs): Promise<VersionedTransactionResponse | null> {
    const txid = await connection.sendRawTransaction(
        serializedTransaction,
        SEND_OPTIONS
    );

    const controller = new AbortController();
    const abortSignal = controller.signal;

    const abortableResender = async () => {
        while (true) {
            await wait(2_000);
            if (abortSignal.aborted) return;
            try {
                await connection.sendRawTransaction(
                    serializedTransaction,
                    SEND_OPTIONS
                );
            } catch (e) {
                console.warn(`Failed to resend transaction: ${e}`);
            }
        }
    };

    try {
        abortableResender();
        const lastValidBlockHeight =
            blockhashWithExpiryBlockHeight.lastValidBlockHeight;

        // this would throw TransactionExpiredBlockheightExceededError
        await Promise.race([
            connection.confirmTransaction(
                {
                    ...blockhashWithExpiryBlockHeight,
                    lastValidBlockHeight,
                    signature: txid,
                    abortSignal,
                },
                "confirmed"
            ),
            new Promise(async (resolve) => {
                // in case ws socket died
                while (!abortSignal.aborted) {
                    await wait(2_000);
                    const tx = await connection.getSignatureStatus(txid, {
                        searchTransactionHistory: false,
                    });
                    if (tx?.value?.confirmationStatus === "confirmed") {
                        resolve(tx);
                    }
                }
            }),
        ]);
    } catch (e) {
        if (e instanceof TransactionExpiredBlockheightExceededError) {
            // we consume this error and getTransaction would return null
            return null;
        } else {
            // invalid state from web3.js
            throw e;
        }
    } finally {
        controller.abort();
    }

    // in case rpc is not synced yet, we add some retries
    const response = promiseRetry(
        async (retry: any) => {
            const response = await connection.getTransaction(txid, {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
            });
            if (!response) {
                retry(response);
            }
            return response;
        },
        {
            retries: 5,
            minTimeout: 1e3,
        }
    );

    return response;
}