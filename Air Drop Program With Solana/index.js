const { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, Transaction, Account } = require("@solana/web3.js");

const newPair = new Keypair();
console.log(newPair);
const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
const secretKey = newPair._keypair.secretKey

const getWalletBalance = async () => {
    try {
        const connection = new Connection(clusterApiUrl("devnet"),"confirmed");
        const myWallet = await Keypair.fromSecretKey(secretKey);
        const walletBalance = await connection.getBalance(new PublicKey(myWallet.publicKey));
        console.log(`=> For wallet address ${publicKey}`);

        console.log(`   Wallet balance: ${parseInt(walletBalance)/LAMPORTS_PER_SOL}SOL`);

    } catch (error) {
        console.log(error);
    }
}

const airDropSol = async() => {
    try {
        const conn = new Connection(clusterApiUrl("devnet"),"confirmed");
        const wallet = await Keypair.fromSecretKey(secretKey);

        console.log(`     Airdropping 5 Sol to ${new PublicKey(wallet.publicKey)}`);
        const fromAirdropSignature = await conn.requestAirdrop(
            new PublicKey(wallet.publicKey), 5 * LAMPORTS_PER_SOL);
        await conn.confirmTransaction(fromAirdropSignature);
    } catch (error) {
        console.log(error);
    }
}



const driverFunction = async () => {
    await getWalletBalance();
    await airDropSol();
    await getWalletBalance();
}
driverFunction();

