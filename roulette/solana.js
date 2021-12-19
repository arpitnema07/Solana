const {LAMPORTS_PER_SOL,PublicKey,Connection,clusterApiUrl,Keypair,Transaction,SystemProgram,sendAndConfirmTransaction} = require("@solana/web3.js");


const getWalletBalance = async (publicKey) => {

    const connection=new Connection(clusterApiUrl("devnet"),"confirmed");
    try {
        const walletBalance = await connection.getBalance(new PublicKey(publicKey));
        console.log(`=> For wallet address ${publicKey}`);
        console.log(`   Wallet balance: ${parseInt(walletBalance)/LAMPORTS_PER_SOL}SOL`);

    } catch (error) {
        console.log(error);
    }
}
const transferSOL=async (from,to,transferAmt)=>{

    const connection=new Connection(clusterApiUrl("devnet"),"confirmed");
    try{
        const transaction=new Transaction().add(
            SystemProgram.transfer({
                fromPubkey:new PublicKey(from.publicKey.toString()),
                toPubkey:new PublicKey(to.publicKey.toString()),
                lamports:transferAmt*LAMPORTS_PER_SOL
            })
        )
        const signature=await sendAndConfirmTransaction(
            connection,
            transaction,
            [from]
        );
        console.log('Signature is ',signature);
        return signature;
    }catch(err){
        console.log(err);
    }
}

const airDropSol = async(wallet,amount) => {
    try {
        const conn = new Connection(clusterApiUrl("devnet"),"confirmed");

        console.log(`     Airdropping ${amount} Sol to ${new PublicKey(wallet.publicKey)}`);
        const fromAirdropSignature = await conn.requestAirdrop(
            new PublicKey(wallet.publicKey), amount * LAMPORTS_PER_SOL);
        await conn.confirmTransaction(fromAirdropSignature);
        
    } catch (error) {
        console.log(error);
    }
}
module.exports={getWalletBalance, airDropSol, transferSOL};
