import { promptAI } from "@/app/lib/ai";

export async function POST(req) {
    const { usage } = await req.json();

    const prompt = `
User wants a PC for: ${usage}.
Generate a JSON object with recommended PC components only, format:

{
  "CPU": "",
  "GPU": "",
  "RAM": "",
  "Storage": "",
  "Motherboard": "",
  "PSU": "",
  "Cooling": "",
  "Case": ""
}

Do not include any extra text.
`;

    const build = await promptAI(prompt);

    if (build?.error)
        return new Response(JSON.stringify({ error: build?.error }), { status: 500 });

    return new Response(JSON.stringify({ build }), { status: 200 });
}
