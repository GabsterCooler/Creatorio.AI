import fs from "fs";
import path from "path";
import Papa from "papaparse";

function normalize(stringValue) {
  return stringValue.toLowerCase().trim().replace(/[^a-z0-9 ]/g, "");
}

function extractTokens(stringValue) {
  return normalize(stringValue)
    .split(" ")
    .filter(Boolean);
}

function joinParts(parts) {
  return parts.filter(Boolean).join(" ");
}

function parseRamSpeed(speed) {
  if (!speed) return { ddr: null, mhz: null };
  const [gen, freq] = String(speed).split(",");
  const trimmedGen = (gen ?? "").trim();
  const trimmedFreq = (freq ?? "").trim();

  const ddr = trimmedGen === "4" ? "DDR4" : trimmedGen === "5" ? "DDR5" : null;
  const mhz = trimmedFreq ? `${trimmedFreq} MHz` : null;
  return { ddr, mhz };
}

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
      continue;
    }
  
    const nameTokens = extractTokens(item[key]);
  
    const score = calculateTokenScoreOnMatches(inputTokens, nameTokens);
    scored.push({ item, score });
  }

  let candidates = scored.filter(entry => entry.score > 0).sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit).map(({ item }) => ({
    name: item[key],
    price: Number(item.price)
  }));
}

function readCSV(filename) {
  const filePath = path.join(process.cwd(), "src/data", filename);
  const file = fs.readFileSync(filePath, "utf8");

  const results = Papa.parse(file, { header: true, skipEmptyLines: true });
  return results.data;
}

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
