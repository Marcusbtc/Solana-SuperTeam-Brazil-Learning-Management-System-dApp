import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "sanity";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const DEFAULT_SEED_FILE = path.resolve(ROOT_DIR, "seed", "sample-courses-5.json");
const SEED_PREFIX = "seed-2026-";

function parseEnvLine(line) {
  const clean = line.trim();
  if (!clean || clean.startsWith("#")) {
    return null;
  }

  const eqIndex = clean.indexOf("=");
  if (eqIndex <= 0) {
    return null;
  }

  const key = clean.slice(0, eqIndex).trim();
  let value = clean.slice(eqIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

async function loadEnvFile(envPath) {
  try {
    const content = await fs.readFile(envPath, "utf8");
    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }

      if (!process.env[parsed.key]) {
        process.env[parsed.key] = parsed.value;
      }
    }
  } catch {
    // Local .env is optional.
  }
}

function getRequiredEnv() {
  const projectId =
    process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.SANITY_PROJECT_ID ?? "";
  const dataset =
    process.env.SANITY_STUDIO_DATASET ??
    process.env.SANITY_DATASET ??
    "production";
  const token =
    process.env.SANITY_API_TOKEN ??
    process.env.SANITY_STUDIO_API_TOKEN ??
    process.env.SANITY_TOKEN ??
    "";

  if (!projectId) {
    throw new Error("Missing SANITY_STUDIO_PROJECT_ID or SANITY_PROJECT_ID");
  }

  if (!token) {
    throw new Error(
      "Missing SANITY_API_TOKEN (or SANITY_STUDIO_API_TOKEN / SANITY_TOKEN) for Content API mutations",
    );
  }

  return { projectId, dataset, token };
}

function parseArgs(argv) {
  const args = new Set(argv.slice(2));
  const replace = args.has("--replace");

  const fileArg = argv.slice(2).find((arg) => arg.startsWith("--file="));
  const filePath = fileArg ? fileArg.slice("--file=".length).trim() : "";

  return {
    replace,
    filePath: filePath ? path.resolve(process.cwd(), filePath) : DEFAULT_SEED_FILE,
  };
}

function chunk(array, size) {
  const output = [];
  for (let index = 0; index < array.length; index += size) {
    output.push(array.slice(index, index + size));
  }
  return output;
}

function countByType(documents) {
  const counts = {};
  for (const doc of documents) {
    const type = typeof doc._type === "string" ? doc._type : "unknown";
    counts[type] = (counts[type] ?? 0) + 1;
  }
  return counts;
}

async function readSeedDocuments(filePath) {
  const file = await fs.readFile(filePath, "utf8");
  const parsed = JSON.parse(file);

  if (!Array.isArray(parsed.documents)) {
    throw new Error(`Seed file must contain { documents: [] }: ${filePath}`);
  }

  for (const doc of parsed.documents) {
    if (!doc || typeof doc !== "object" || typeof doc._id !== "string") {
      throw new Error("Each document must include a string _id");
    }
    if (!doc._id.startsWith(SEED_PREFIX)) {
      throw new Error(`Seed document ID must start with ${SEED_PREFIX}: ${doc._id}`);
    }
    if (typeof doc._type !== "string") {
      throw new Error(`Seed document missing _type: ${doc._id}`);
    }
  }

  return parsed.documents;
}

async function deleteSeedDocuments(client, prefix) {
  const typeOrder = ["course", "module", "lesson", "challenge", "track"];
  const pattern = `${prefix}*`;
  let totalDeleted = 0;

  for (const type of typeOrder) {
    const ids = await client.fetch(
      `*[_type == $type && _id match $pattern]._id`,
      { type, pattern },
    );

    for (const group of chunk(ids, 100)) {
      let tx = client.transaction();
      for (const id of group) {
        tx = tx.delete(id);
      }
      await tx.commit();
      totalDeleted += group.length;
    }
  }

  return totalDeleted;
}

async function importDocuments(client, documents) {
  let imported = 0;

  for (const group of chunk(documents, 50)) {
    let tx = client.transaction();
    for (const doc of group) {
      tx = tx.createOrReplace(doc);
    }
    await tx.commit();
    imported += group.length;
  }

  return imported;
}

async function main() {
  await loadEnvFile(path.resolve(ROOT_DIR, ".env"));

  const { replace, filePath } = parseArgs(process.argv);
  const documents = await readSeedDocuments(filePath);
  const { projectId, dataset, token } = getRequiredEnv();

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2025-01-01",
    token,
    useCdn: false,
  });

  console.log(`Import source: ${filePath}`);
  console.log(`Target dataset: ${projectId}/${dataset}`);

  let deleted = 0;
  if (replace) {
    deleted = await deleteSeedDocuments(client, SEED_PREFIX);
  }

  const imported = await importDocuments(client, documents);
  const counts = countByType(documents);

  console.log("Import summary:");
  console.log(`- replace mode: ${replace ? "enabled" : "disabled"}`);
  console.log(`- deleted docs: ${deleted}`);
  console.log(`- imported docs: ${imported}`);
  console.log(`- type counts: ${JSON.stringify(counts)}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error("CMS API import failed:", message);
  process.exit(1);
});
