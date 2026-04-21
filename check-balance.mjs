import { createKeyPairSignerFromBytes, createSolanaRpc, devnet } from '@solana/kit';
import { readFile } from 'node:fs/promises';

async function main() {
  const keypairJson = await readFile('./wallet.json', 'utf8');
  const keypairBytes = Uint8Array.from(JSON.parse(keypairJson));
  const wallet = await createKeyPairSignerFromBytes(keypairBytes);

  const rpc = createSolanaRpc(devnet('https://api.devnet.solana.com'));
  const { value: balance } = await rpc.getBalance(wallet.address).send();
  const balanceInSol = Number(balance) / 1_000_000_000;

  console.log('Wallet address:', wallet.address);
  console.log('Balance:', `${balanceInSol} SOL`);
}

main().catch((error) => {
  console.error('Failed to check wallet balance:', error);
  process.exitCode = 1;
});
