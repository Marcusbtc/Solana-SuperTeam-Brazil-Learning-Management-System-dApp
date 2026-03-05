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

  await prisma.credentialCache.upsert({
    where: {
      walletAddress_credentialId: {
        walletAddress: users[0].wallet,
        credentialId: "anchor-track",
      },
    },
    update: {},
    create: {
      walletAddress: users[0].wallet,
      credentialId: "anchor-track",
      title: "Anchor Track Credential",
      track: "Anchor",
      level: 2,
      mintAddress: "Fakemint11111111111111111111111111111111111",
      metadataUri: "https://arweave.net/anchor-track",
    },
  });
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
