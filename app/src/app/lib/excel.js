import fs from "fs";
import path from "path";
import Papa from "papaparse";

function splitPercentages(usage) {
    let split = {
        CPU: 0.25,
        GPU: 0.35,
        RAM: 0.1,
        storage: 0.1,
        motherboard: 0.1,
        PSU: 0.1,
    };

    switch (usage) {
        case "gaming":
            split.GPU = 0.45;
            split.CPU = 0.2;
            break;
        case "work":
        case "general":
            split.CPU = 0.35;
            split.GPU = 0.2;
            break;
        case "video_editing":
        case "3d":
        case "streaming":
            split.CPU = 0.3;
            split.GPU = 0.4;
            break;
    }

    const total = Object.values(split).reduce((a, b) => a + b, 0);
    Object.keys(split).forEach((k) => (split[k] /= total));

    return split;
}

export function filterDataInJSON(data) {
    const maxBudget = data.maxBudget;
    const split = splitPercentages(data.usage)
    const prices = {
        CPU: maxBudget * split.CPU,
        GPU: maxBudget * split.GPU,
        RAM: maxBudget * split.RAM,
        storage: maxBudget * split.storage,
        motherboard: maxBudget * split.motherboard,
        PSU: maxBudget * split.PSU,
    };

    const readAndFilterCSV = (filename, budget) => {
        const filePath = path.join(process.cwd(), "src/data", filename);
        const file = fs.readFileSync(filePath, "utf8");

        const results = Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
        });

        return results.data
            .filter((item) => Number(item.price) <= budget)
            .map((item) => `${item.name} ${Number(item.price)}$`);
    };

    const CPUs = readAndFilterCSV("cpu.csv", prices.CPU);
    const GPUs = readAndFilterCSV("video-card.csv", prices.GPU);
    const RAMs = readAndFilterCSV("memory.csv", prices.RAM);
    const storages = readAndFilterCSV("internal-hard-drive.csv", prices.storage);
    const motherboards = readAndFilterCSV("motherboard.csv", prices.motherboard);
    const PSUs = readAndFilterCSV("power-supply.csv", prices.PSU);

    return {
        CPUsList: CPUs,
        GPUsList: GPUs,
        RAMsList: RAMs,
        storagesList: storages,
        motherboardsList: motherboards,
        PSUsList: PSUs,
    };
}