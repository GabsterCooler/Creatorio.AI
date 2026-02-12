import fs from "fs";
import path from "path";
import Papa from "papaparse";
import Fuse from "fuse.js";

function normalize(stringValue) {
  return stringValue.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "");
}

function extractTokens(stringValue) {
  return normalize(stringValue)
    .split(" ")
    .filter(Boolean)
    .filter(
      w =>
        ![
          "xt",
          "ti",
          "super",
          "w",
          "plus",
          "gold",
          "bronze",
          "platinum",
          "pcie5",
          "mhz"
        ].includes(w)
    );
}

function calculateTokenScoreOnMatches(inputTokens, itemTokens) {
  return inputTokens.filter(t => itemTokens.includes(t)).length;
}

function lastResortMatch(input, dataset, key) {
  const fuse = new Fuse(dataset, {
    keys: [key],
    threshold: 0.4,
    ignoreLocation: true,
    tokenize: true
  });

  const fuseResult = fuse.search(input);
  return fuseResult[0]?.item || null;
}

function findBestMatch(input, dataset, key = "name") {
  if (!input) return null;

  const inputTokens = extractTokens(input);

  let bestItem = null;
  let bestScore = 0;

  for (const item of dataset) {
    const currentItemTokens = extractTokens(item[key]);
    const score = calculateTokenScoreOnMatches(inputTokens, currentItemTokens);

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  if (bestScore === 0)
    bestItem = lastResortMatch(input, dataset, key);

  if (bestItem === null) return null;

  return {
      name: bestItem[key],
      price: bestItem.price ? Number(bestItem.price) : "Unknown",
    };
}

function readCSV(filename) {
  const filePath = path.join(process.cwd(), "src/data", filename);
  const file = fs.readFileSync(filePath, "utf8");

  const results = Papa.parse(file, { header: true, skipEmptyLines: true });
  return results.data;
}

export function filterDataInJSON(build) {
  const cpuData = readCSV("cpu.csv");
  const gpuData = readCSV("video-card.csv");
  const ramData = readCSV("memory.csv");
  const storageData = readCSV("internal-hard-drive.csv");
  const motherboardData = readCSV("motherboard.csv");
  const psuData = readCSV("power-supply.csv");

  return {
    CPU: findBestMatch(build.CPU, cpuData),
    GPU: findBestMatch(build.GPU, gpuData, "chipset"),
    RAM: findBestMatch(build.RAM, ramData),
    Storage: findBestMatch(build.Storage, storageData),
    Motherboard: findBestMatch(build.Motherboard, motherboardData),
    PSU: findBestMatch(build.PSU, psuData),
  };
}
