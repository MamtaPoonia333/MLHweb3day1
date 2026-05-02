import { createSolanaRpc, devnet, address } from "@solana/kit";

// Connect to Solana devnet
const rpc = createSolanaRpc(
  devnet("https://api.devnet.solana.com")
);

// Your wallet address
const targetAddress = address(
  "CxoZExq7kpNfvx5H56DUey3AjcgztB3zWpwtpwpL4gti"
);

// Fetch balance
const { value: balanceInLamports } = await rpc
  .getBalance(targetAddress)
  .send();

// Convert lamports → SOL
const balanceInSol =
  Number(balanceInLamports) / 1_000_000_000;

console.log(`Address: ${targetAddress}`);
console.log(`Balance: ${balanceInSol} SOL`);
