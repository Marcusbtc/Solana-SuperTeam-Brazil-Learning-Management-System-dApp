import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function deriveLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

async function main() {
  const users = [
    {
      username: "marcus",
      displayName: "Marcus",
      wallet: "7xPfakeWallet1111111111111111111111111111111",
      xp: 2450,
      streak: 6,
    },
    {
      username: "ana",
      displayName: "Ana Dev",
      wallet: "8yQfakeWallet1111111111111111111111111111111",
      xp: 7300,
      streak: 22,
    },
    {
      username: "diego",
      displayName: "Diego Builder",
      wallet: "9zRfakeWallet1111111111111111111111111111111",
      xp: 5200,
      streak: 11,
    },
  ];

  for (const entry of users) {
    const user = await prisma.user.upsert({
      where: { username: entry.username },
      update: { displayName: entry.displayName },
      create: {
        username: entry.username,
        displayName: entry.displayName,
        language: "en",
        theme: "dark",
      },
    });

    await prisma.walletLink.upsert({
      where: { address: entry.wallet },
      update: { userId: user.id, isPrimary: true },
      create: { userId: user.id, address: entry.wallet, isPrimary: true },
    });

    await prisma.streakEvent.create({
      data: {
        userId: user.id,
        activityDate: new Date(),
        type: "daily-login",
        xpAwarded: 10,
      },
    });

    await prisma.leaderboardSnapshot.create({
      data: {
        timeframe: "all-time",
        walletAddress: entry.wallet,
        displayName: entry.displayName,
        xp: entry.xp,
        level: deriveLevel(entry.xp),
        streak: entry.streak,
      },
    });
  }

  const seedCredentials = [
    {
      walletAddress: users[0].wallet,
      credentialId: "cred-bootcamp-marcus",
      title: "Solana Bootcamp Graduate",
      track: "Solana Core Engineering",
      level: 3,
      mintAddress: "BtCamp1111111111111111111111111111111111111",
      metadataUri: "https://arweave.net/solana-bootcamp-credential-metadata-v1",
      verified: true,
    },
    {
      walletAddress: users[0].wallet,
      credentialId: "cred-anchor-marcus",
      title: "Anchor Builder",
      track: "Solana Core Engineering",
      level: 5,
      mintAddress: "AnchrB1111111111111111111111111111111111111",
      metadataUri: "https://arweave.net/anchor-builder-credential-metadata-v1",
      verified: true,
    },
    {
      walletAddress: users[1].wallet,
      credentialId: "cred-security-ana",
      title: "Security Defender",
      track: "Solana Core Engineering",
      level: 8,
      mintAddress: "SecDef1111111111111111111111111111111111111",
      metadataUri:
        "https://arweave.net/security-defender-credential-metadata-v1",
      verified: true,
    },
  ];

  for (const cred of seedCredentials) {
    await prisma.credentialCache.upsert({
      where: {
        walletAddress_credentialId: {
          walletAddress: cred.walletAddress,
          credentialId: cred.credentialId,
        },
      },
      update: {},
      create: cred,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
