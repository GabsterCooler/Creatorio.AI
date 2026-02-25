import fs from "fs";
import path from "path";
import Papa from "papaparse";

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

function findTopMatches(input, dataset, key, limit) {
  const inputTokens = extractTokens(input);

  const scored = [];

  function calculateTokenScoreOnMatches(inputTokens, itemTokens) {
    return inputTokens.filter(t => itemTokens.includes(t)).length;
  }

  for (const item of dataset) {
    if (!item || typeof item[key] !== "string") continue;
  
    const nameTokens = extractTokens(item[key]);
  
    const extraTokensForRAM = [];
    if (item.speed) {
      const [gen, freq] = String(item.speed).split(",");

      const trimmed = gen.trim();
  
      if (trimmed === "4") extraTokensForRAM.push("ddr4");
      else if (trimmed === "5") extraTokensForRAM.push("ddr5");
  
      if (freq) extraTokensForRAM.push(freq.trim());
    }
  
    const currentItemTokens = [...new Set([...nameTokens, ...extraTokensForRAM])];
  
    const score = calculateTokenScoreOnMatches(inputTokens, currentItemTokens);
    scored.push({ item, score });
  }

  let candidates = scored.filter(entry => entry.score > 0).sort((a, b) => b.score - a.score);

  return candidates.slice(0, limit).map(({ item }) => ({
    name: item[key],
    price: item.price ? Number(item.price) : "Unknown"
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
  const gpuData = readCSV("video-card.csv");
  const ramData = readCSV("memory.csv");
  const storageData = readCSV("internal-hard-drive.csv");
  const motherboardData = readCSV("motherboard.csv");
  const psuData = readCSV("power-supply.csv");

  return {
    CPU: findTopMatches(build.CPU, cpuData, "name", limit),
    GPU: findTopMatches(build.GPU, gpuData, "chipset", limit),
    RAM: findTopMatches(build.RAM, ramData, "name", limit),
    Storage: findTopMatches(build.Storage, storageData, "name", limit),
    Motherboard: findTopMatches(build.Motherboard, motherboardData, "name", limit),
    PSU: findTopMatches(build.PSU, psuData, "name", limit)
  };
}
