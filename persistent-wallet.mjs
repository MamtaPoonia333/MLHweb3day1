import {
  createSolanaRpc,
  devnet,
  generateKeyPair,
  createKeyPairSignerFromBytes,
  createSignerFromKeyPair,
} from "@solana/kit";
import { readFile, writeFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";

const WALLET_FILE = "wallet.json";
const rpc = createSolanaRpc(devnet("https://api.devnet.solana.com"));
const cryptoApi = globalThis.crypto ?? webcrypto;

async function loadOrCreateWallet() {
  try {
    // Try to load an existing wallet (supports Day 1 and Day 2 formats).
    const parsed = JSON.parse(await readFile(WALLET_FILE, "utf-8"));
    const secretKey = Array.isArray(parsed) ? parsed : parsed?.secretKey;
    const secretBytes = Uint8Array.from(secretKey ?? []);

    if (secretBytes.length !== 64) {
      throw new Error("Invalid wallet file format: expected 64-byte secret key");
    }

    const wallet = await createKeyPairSignerFromBytes(secretBytes);
    console.log("Loaded existing wallet:", wallet.address);
    return wallet;
  } catch {
    // No wallet file found, or invalid file: create a new one.
    // Pass true so keys are extractable for persistence.
    const keyPair = await generateKeyPair(true);

    // Export public key bytes.
    const publicKeyBytes = new Uint8Array(
      await cryptoApi.subtle.exportKey("raw", keyPair.publicKey)
    );

    // Export private key in pkcs8; last 32 bytes are Ed25519 secret key.
    const pkcs8 = await cryptoApi.subtle.exportKey("pkcs8", keyPair.privateKey);
    const privateKeyBytes = new Uint8Array(pkcs8).slice(-32);

    // Solana keypair format: 64 bytes (32 private + 32 public).
    const keypairBytes = new Uint8Array(64);
    keypairBytes.set(privateKeyBytes, 0);
    keypairBytes.set(publicKeyBytes, 32);

    await writeFile(
      WALLET_FILE,
      JSON.stringify({ secretKey: Array.from(keypairBytes) }, null, 2)
    );

    const wallet = await createSignerFromKeyPair(keyPair);
    console.log("Created new wallet:", wallet.address);
    console.log(`Saved to ${WALLET_FILE}`);
    return wallet;
  }
}

const wallet = await loadOrCreateWallet();

// Check balance.
const { value: balance } = await rpc.getBalance(wallet.address).send();
const balanceInSol = Number(balance) / 1_000_000_000;

console.log(`\nAddress: ${wallet.address}`);
console.log(`Balance: ${balanceInSol} SOL`);

if (balanceInSol === 0) {
  console.log(
    "\nThis wallet has no SOL. Visit https://faucet.solana.com/ and airdrop some to:"
  );
  console.log(wallet.address);
}
