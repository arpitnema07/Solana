const {PublicKey,Connection,clusterApiUrl,Keypair} = require("@solana/web3.js");
const {getWalletBalance,airDropSol,transferSOL} = require("./solana")
const { getReturnAmount, totalAmtToBePaid, randomNumber } = require('./helper');
const inquirer = require("inquirer");

console.log("New project");
const connection=new Connection(clusterApiUrl("devnet"),"confirmed");
//For checking whether the connection is successfully made

const userWallet = Keypair.generate();

//Treasury
const secretKey=[
    51,  18,   4, 174, 103,  89,  40, 190,  47,  23, 222,
    79,  82, 193, 207, 160,  89, 166, 165, 163,  82, 185,
    175, 125,  98,  11, 209,  43, 105,  81,  60, 102, 131,
    172,  95, 211, 116, 108,  95,  65,  33,  87,  44, 105,
    93, 222,  63, 245, 111, 188, 108,  27,  32,  49,  60,
    38,  49, 216,  12,  90,  18,   4, 253, 196
]

const treasuryWallet=Keypair.fromSecretKey(Uint8Array.from(secretKey));


const publicKey = new PublicKey(userWallet.publicKey).toString();

const askQuestions = () => {
    const questions = [
        {
            name: "SOL",
            type: "number",
            message: "What is the amount of SOL you want to stake?",
        },
        {
            type: "rawlist",
            name: "RATIO",
            message: "What is the ratio of your staking?",
            choices: ["1:1.25", "1:1.5", "1.75", "1:2"],
            filter: function(val) {
                const stakeFactor=val.split(":")[1];
                return stakeFactor;
            },
        },
        {
            type:"number",
            name:"RANDOM",
            message:"Guess a random number from 1 to 5 (both 1, 5 included)",
            when:async (val)=>{
                if(parseFloat(totalAmtToBePaid(val.SOL))>5){
                    console.log(`You have violated the max stake limit. Stake with smaller amount.`)
                    return false;
                }else{
                    console.log(`You need to pay ${totalAmtToBePaid(val.SOL)} to move forward`)
                    const userBalance=await getWalletBalance(userWallet.publicKey.toString())
                    if(userBalance<totalAmtToBePaid(val.SOL)){
                        console.log(`You don't have enough balance in your wallet`);
                        return false;
                    }else{
                        console.log(`You will get ${getReturnAmount(val.SOL,parseFloat(val.RATIO))} if guessing the number correctly`)
                        return true;    
                    }
                }
            },
        }
    ];
    return inquirer.prompt(questions);
};

const gameExecution = async()=>{
    
    const generateRandomNumber=randomNumber(1,5);
    console.log("Generated number",generateRandomNumber);
    const answers=await askQuestions();
    if(answers.RANDOM){
        const paymentSignature=await transferSOL(userWallet,treasuryWallet,totalAmtToBePaid(answers.SOL))
        console.log(`Signature of payment for playing the game`,`${paymentSignature}`);
        if(answers.RANDOM===generateRandomNumber){
            //AirDrop Winning Amount
            await airDropSol(treasuryWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)));
            //guess is successfull
            const prizeSignature=await transferSOL(treasuryWallet,userWallet,getReturnAmount(answers.SOL,parseFloat(answers.RATIO)))
            console.log(`Your guess is absolutely correct`);
            console.log(`Here is the price signature `,`${prizeSignature}`);
        }else{
            //better luck next time
            console.log(`Better luck next time`)
        }
    }
}


const driverFunction = async () => {
    await airDropSol(userWallet,2);
    await getWalletBalance(new PublicKey(userWallet.publicKey));
    gameExecution();
}
driverFunction();