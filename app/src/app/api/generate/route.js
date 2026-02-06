import { promptAI } from "@/app/lib/ai";
import { filterDataInJSON } from "@/app/lib/excel";

export async function POST(req) {
    const data = await req.json();

    const JSONfilteredData = filterDataInJSON(data);

    console.log(JSON.stringify(JSONfilteredData, null, 2))

    const prompt = `
        The user wants a pc with:
        ${JSON.stringify(JSONfilteredData, null, 2)}

        Generate a JSON object with recommended PC components only, format:

        {
            "CPU": "",
            "GPU": "",
            "RAM": "",
            "Storage": "",
            "Motherboard": "",
            "PSU": ""
        }

        If you can't fill the format because of budget issues, say:
        Not enough budget for the recommendation.

        Do not include any extra text.
        `;

    const build = await promptAI(prompt);

    if (build?.error)
        return new Response(JSON.stringify({ error: build?.error }), { status: 500 });

    return new Response(JSON.stringify({ build }), { status: 200 });
}
