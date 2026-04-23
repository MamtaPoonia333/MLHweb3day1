import { createKeyPairSignerFromBytes } from '@solana/kit';
import { readFile } from 'node:fs/promises';

const RPC_URL = 'https://api.devnet.solana.com';
const WALLET_FILE = './wallet.json';
const LAMPORTS_PER_SOL = 1_000_000_000n;

async function loadWalletSigner() {
  const raw = await readFile(WALLET_FILE, 'utf8');
  const parsed = JSON.parse(raw);
  const secretKey = Array.isArray(parsed) ? parsed : parsed?.secretKey;

  if (!Array.isArray(secretKey) || secretKey.length !== 64) {
    throw new Error('Invalid wallet.json format. Expected a 64-byte secret key array.');
  }

  return createKeyPairSignerFromBytes(Uint8Array.from(secretKey));
}

async function rpc(method, params) {
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`RPC error from ${method}: ${JSON.stringify(data.error)}`);
  }

  return data.result;
}

function lamportsToSolString(lamports) {
  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = lamports % LAMPORTS_PER_SOL;
  const fractionText = fraction.toString().padStart(9, '0').replace(/0+$/, '');
  return fractionText.length > 0 ? `${whole.toString()}.${fractionText}` : whole.toString();
}

async function main() {
  const wallet = await loadWalletSigner();
  const address = wallet.address;

  const balanceResult = await rpc('getBalance', [address, { commitment: 'confirmed' }]);
  const lamports = BigInt(balanceResult.value);
  const solText = lamportsToSolString(lamports);

  console.log('Day 3: SOL vs Lamports');
  console.log('-----------------------');
  console.log('Wallet:', address);

  console.log('\n1) Balance in SOL');
  console.log(`${solText} SOL`);

  console.log('\n2) Balance in lamports');
  console.log(`${lamports.toString()} lamports`);

  console.log('\n3) Verify conversion');
  console.log(`1 SOL = ${LAMPORTS_PER_SOL.toString()} lamports`);

  const whole = lamports / LAMPORTS_PER_SOL;
  const fraction = lamports % LAMPORTS_PER_SOL;
  const reconstructedLamports = whole * LAMPORTS_PER_SOL + fraction;
  console.log(
    `Conversion check passed: ${reconstructedLamports === lamports}`
  );

  console.log('\n4) Find a transaction fee (lamports)');
  const signatures = await rpc('getSignaturesForAddress', [address, { limit: 10 }]);

  if (!Array.isArray(signatures) || signatures.length === 0) {
    console.log('No transactions found for this wallet yet.');
    console.log('Create one (for example, an airdrop or transfer), then run this script again.');
    return;
  }

  let foundFee = false;

  for (const entry of signatures) {
    const signature = entry?.signature;

    if (!signature) {
      continue;
    }

    const tx = await rpc('getTransaction', [
      signature,
      {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      },
    ]);

    const fee = tx?.meta?.fee;

    if (typeof fee === 'number') {
      console.log(`Signature: ${signature}`);
      console.log(`Fee: ${fee} lamports`);
      foundFee = true;
      break;
    }
  }

  if (!foundFee) {
    console.log('Could not find a confirmed transaction with fee metadata in recent history.');
    console.log('Try again after a new confirmed transaction.');
  }
}

main().catch((error) => {
  console.error('Day 3 script failed:', error.message || error);
  process.exitCode = 1;
});
