import { runCrawl } from "../src/lib/crawler";

async function main() {
  const limit = Number(process.argv[2]) || 5;
  console.log(`Starting crawl (limit: ${limit})...`);
  const result = await runCrawl({ limit });
  console.log("Crawl complete:", result);
}

main().catch((err) => {
  console.error("Crawl failed:", err);
  process.exit(1);
});
