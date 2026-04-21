import { generateKeyPairSigner, writeKeyPairSigner } from '@solana/kit';

async function main() {
  const signer = await generateKeyPairSigner(true);
  const outputPath = './wallet.json';

  await writeKeyPairSigner(signer, outputPath, {
    unsafelyOverwriteExistingKeyPair: false,
  });

  console.log('Wallet created successfully.');
  console.log('Address:', signer.address);
  console.log('Keypair file:', outputPath);
}

main().catch((error) => {
  console.error('Failed to create wallet:', error);
  process.exitCode = 1;
});
