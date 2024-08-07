import { ethers, WebSocketProvider } from "ethers";
import { exec } from "child_process";
import BigNumber from "bignumber.js";

const INFURA_API_KEY = process.env.INFURA_API_KEY;

if (!INFURA_API_KEY) {
  throw new Error("INFURA_API_KEY is required");
}

const nonces = {};

// Subscribe to mainnet to get pending transaction
console.log("Starting MEV bot");
const provider: WebSocketProvider = new ethers.WebSocketProvider(
  `wss://mainnet.infura.io/ws/v3/${INFURA_API_KEY}`
);

const waitForHardhatNode = async (url, retries = 10, interval = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      await provider.getNetwork();
      return provider;
    } catch (error) {
      console.log(`Waiting for Hardhat node... (${i + 1}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
  throw new Error("Failed to connect to Hardhat node");
};

provider.on("pending", async (blockHash) => {
  const transaction = await provider.getTransaction(blockHash);

  // Fork mainnet to Hardhat & start Hardhat node
  const hardhatProcess = exec(
    `npx hardhat node --fork https://mainnet.infura.io/v3/${INFURA_API_KEY}`
  );

  // Connect to the Hardhat node and wait for it to be ready
  const hardhatProvider = await waitForHardhatNode("http://127.0.0.1:8545");

  try {
    const accounts = await hardhatProvider.listAccounts();
    const defaultAccount = accounts[0];

    const balance = BigNumber(
      (await hardhatProvider.getBalance(defaultAccount)).toString()
    );

    console.log(
      `Account[0] - ${defaultAccount.address} Balance: ${balance.toString()}`
    );

    // // Copy the transaction to the Hardhat node
    await defaultAccount.sendTransaction({
      to: transaction.to,
      value: transaction.value,
      data: transaction.data,
      nonce: nonces[`${transaction.to}-${transaction.nonce}`],
      gasPrice: BigNumber(transaction.gasPrice.toString())
        .multipliedBy(2)
        .toString(),
    });

    const newBalance = BigNumber(
      (await hardhatProvider.getBalance(defaultAccount)).toString()
    );

    if (newBalance.gt(balance)) {
      console.log("✅ Profitable transaction", blockHash);
      console.log(
        "Profit: ",
        ethers.formatEther(newBalance.minus(balance).toString())
      );
    } else {
      console.log("Unprofitable transaction", blockHash);
      console.log(
        "Loss: ",
        ethers.formatEther(newBalance.minus(balance).toString())
      );
    }
  } catch (error) {
    // This throws way too many errors, so we'll just log them for now
    // console.error("Error", error);
  } finally {
    hardhatProcess.kill();
  }
});
