import fs from "fs";
import path from "path";
import Papa from "papaparse";

/**
 * Normalizes a free‑form string so it is easier to compare:
 * - lowercases
 * - trims
 * - strips punctuation (keeps only a–z, 0–9 and spaces)
 */
function normalize(stringValue) {
  return stringValue.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "");
}

/**
 * Splits a string into simple word tokens after normalization.
 * Used both on AI output (build description) and CSV fields
 * so that matching happens in the same token space.
 */
function extractTokens(stringValue) {
  return normalize(stringValue)
    .split(" ")
    .filter(Boolean);
}

/**
 * Joins an array of optional string parts into a single display string,
 * skipping any falsy entries so callers can pass in `null` freely.
 */
function joinParts(parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Parses the RAM `speed` CSV column which is stored as "generation,freq":
 * e.g. "5,6000" -> { ddr: "DDR5", mhz: "6000 MHz" }.
 * Returns nulls if data is missing so callers can drop those pieces.
 */
function parseRamSpeed(speed) {
  if (!speed) return { ddr: null, mhz: null };
  const [gen, freq] = String(speed).split(",");
  const trimmedGen = (gen ?? "").trim();
  const trimmedFreq = (freq ?? "").trim();

  const ddr = trimmedGen === "4" ? "DDR4" : trimmedGen === "5" ? "DDR5" : null;
  const mhz = trimmedFreq ? `${trimmedFreq} MHz` : null;
  return { ddr, mhz };
}

/**
 * Generic token‑overlap matcher.
 *
 * - `input` is a free‑form part string produced by the AI (e.g. "Ryzen 7 7800X3D").
 * - `dataset` is the parsed CSV for one component type.
 * - `key` is which string field to match against (e.g. "name" or "combinedName").
 * - Scores each row by how many tokens it shares with the input and returns the top N.
 *
 * NOTE: rows with missing / empty price are skipped up‑front so all matches are buyable.
 */
function findTopMatches(input, dataset, key, limit) {
  const inputTokens = extractTokens(input);

  const scored = [];

  function calculateTokenScoreOnMatches(inputTokens, itemTokens) {
    return inputTokens.filter(t => itemTokens.includes(t)).length;
  }

  for (const item of dataset) {
    if (
      !item ||
      typeof item[key] !== "string" ||
      !item.price ||
      String(item.price).trim() === ""
    ) {
      // Ignore badly‑formed rows or items without a price
      continue;
    }
  
    const nameTokens = extractTokens(item[key]);
  
    const score = calculateTokenScoreOnMatches(inputTokens, nameTokens);
    scored.push({ item, score });
  }

  let candidates = scored
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  // At this point every item has a valid numeric price
  return candidates.slice(0, limit).map(({ item }) => ({
    name: item[key],
    price: Number(item.price)
  }));
}

/**
 * Loads a CSV file from `src/data` using PapaParse and returns
 * an array of row objects (one per component option).
 */
function readCSV(filename) {
  const filePath = path.join(process.cwd(), "src/data", filename);
  const file = fs.readFileSync(filePath, "utf8");

  const results = Papa.parse(file, { header: true, skipEmptyLines: true });
  return results.data;
}

/**
 * Given an initial AI build (strings for CPU/GPU/etc.), find the top
 * N matching real parts for each category from the CSV datasets.
 *
 * Some categories (GPU / RAM / Storage) expose a `combinedName` field
 * that merges important attributes into a single human‑readable string
 * while still being token‑friendly for matching.
 */
export function getTopMatchesForBuild(build, limit) {
  const cpuData = readCSV("cpu.csv");
  const gpuData = readCSV("video-card.csv").map(item => ({
    ...item,
    combinedName: joinParts([
      item.name,
      item.chipset ? `(${item.chipset})` : null,
      item.memory ? `${item.memory} GB` : null
    ])
  }));

  const ramData = readCSV("memory.csv").map(item => {
    const { ddr, mhz } = parseRamSpeed(item.speed);
    return {
      ...item,
      combinedName: joinParts([item.name, ddr, mhz])
    };
  });

  const storageData = readCSV("internal-hard-drive.csv").map(item => ({
    ...item,
    combinedName: joinParts([item.name, item.capacity ? `${item.capacity} GB` : null])
  }));
  const motherboardData = readCSV("motherboard.csv");
  const psuData = readCSV("power-supply.csv");

  return {
    CPU: findTopMatches(build.CPU, cpuData, "name", limit),
    GPU: findTopMatches(build.GPU, gpuData, "combinedName", limit),
    RAM: findTopMatches(build.RAM, ramData, "combinedName", limit),
    Storage: findTopMatches(build.Storage, storageData, "combinedName", limit),
    Motherboard: findTopMatches(build.Motherboard, motherboardData, "name", limit),
    PSU: findTopMatches(build.PSU, psuData, "name", limit)
  };
}
