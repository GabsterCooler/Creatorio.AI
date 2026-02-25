import { promptAI } from "@/app/lib/ai";
import { getTopMatchesForBuild } from "@/app/lib/excel";

function validateForm(data) {
  const allowedUsage = ["gaming", "work", "video_editing", "3d", "streaming", "general"];
  const allowedResolution = ["1080p", "1440p", "4k"];
  const allowedPerformance = ["best_value", "high_end", "future_proof"];

  const isValidNumber =
    typeof data.budget === "number" && Number.isFinite(data.budget) && data.budget >= 0;

  const hasEnvKey =
    typeof data.envKey === "string" &&
    data.envKey.trim().length > 0;

  return (
    data &&
    typeof data === "object" &&
    allowedUsage.includes(data.usage) &&
    isValidNumber &&
    allowedResolution.includes(data.resolution) &&
    allowedPerformance.includes(data.performance) &&
    hasEnvKey
  );
}

function cleanAIResponse(message) {
  if (typeof message !== "string") return "";
  const withoutFences = message.replace(/```json|```/gi, "").trim();
  return withoutFences.replace(/^\s+|\s+$/g, "");
}

function makeErrorResponse(message, status) {
  return new Response(
    JSON.stringify({ error: message }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

function buildInitialPrompt(data) {
  return `
You are a PC hardware expert.

A user wants a PC with the following requirements:

- Usage: ${data.usage}
- Budget: $${data.budget}
- Target Resolution: ${data.resolution}
- Performance Preference: ${data.performance}

Recommend a COMPLETE and REALISTIC PC build using REAL consumer parts that exist on the market.

IMPORTANT RULES:

- Stay within the total budget.
- Ensure all parts are compatible.
- Prioritize component balance (no extreme bottlenecks).
- Do NOT recommend integrated graphics for video editing.
- Do NOT invent product names.
- The currency is in USD.
- Do NOT include wattage, efficiency, certifications, commas, parentheses, or extra specs.

OUTPUT RULES (CRITICAL):

- Output ONLY valid JSON.
- No markdown.
- No explanations.
- No extra text.
- No comments.

Format EXACTLY like this:

{
  "CPU": "",
  "GPU": "",
  "RAM": "",
  "Storage": "",
  "Motherboard": "",
  "PSU": ""
}

If the budget is too low to build a functional PC, output EXACTLY:

Not enough budget for the recommendation.
`;
}

function buildConstrainedPrompt(data, topMatches) {
  return `
You are a PC hardware expert.

A user wants a PC with the following requirements:

- Usage: ${data.usage}
- Budget: $${data.budget}
- Target Resolution: ${data.resolution}
- Performance Preference: ${data.performance}

You must build a COMPLETE PC using ONLY the following options for each component.

For each category, choose exactly ONE option. Stay within the total budget and aim for the best performance/value balance.

When choosing, copy the option "name" value EXACTLY as written.

CPU options:
${topMatches.CPU.map((opt, index) => `${index + 1}. name: ${opt.name}, price: ${opt.price}`).join("\n")}

GPU options:
${topMatches.GPU.map((opt, index) => `${index + 1}. name: ${opt.name}, price: ${opt.price}`).join("\n")}

RAM options:
${topMatches.RAM.map((opt, index) => `${index + 1}. name: ${opt.name}, price: ${opt.price}`).join("\n")}

Storage options:
${topMatches.Storage.map((opt, index) => `${index + 1}. name: ${opt.name}, price: ${opt.price}`).join("\n")}

Motherboard options:
${topMatches.Motherboard.map((opt, index) => `${index + 1}. name: ${opt.name}, price: ${opt.price}`).join("\n")}

PSU options:
${topMatches.PSU.map((opt, index) => `${index + 1}. name: ${opt.name}, price: ${opt.price}`).join("\n")}

IMPORTANT OUTPUT RULES:

- Output ONLY valid JSON.
- No markdown.
- No explanations.
- No extra text.
- No comments.

Format EXACTLY like this:

{
  "CPU": "",
  "GPU": "",
  "RAM": "",
  "Storage": "",
  "Motherboard": "",
  "PSU": ""
}
`;
}

function pickFromOptions(selectedName, options) {
  return options.find(opt => opt.name === selectedName);
}

export async function POST(req) {
  const data = await req.json();

  if (!validateForm(data)) {
    return makeErrorResponse("Invalid form data", 400);
  }

  const initialPrompt = buildInitialPrompt(data);
  const initialBuildResponse = await promptAI(initialPrompt, data.envKey);

  if (initialBuildResponse?.error) {
    return makeErrorResponse(initialBuildResponse.error, 500);
  }

  if (initialBuildResponse === "Not enough budget for the recommendation.") {
    return makeErrorResponse(initialBuildResponse, 400);
  }

  let initialBuildResponseJSON = null;

  try {
    initialBuildResponseJSON = JSON.parse(cleanAIResponse(initialBuildResponse));
  } catch (err) {
    console.error("Failed to parse AI response as JSON:", err);
    return makeErrorResponse("Something went wrong with the AI. Please try again and make sure your API key is correct.",500);
  }

  console.log(initialBuildResponseJSON)

  const topMatches = getTopMatchesForBuild(initialBuildResponseJSON, 5);

  const constrainedPrompt = buildConstrainedPrompt(data, topMatches);
  const constrainedBuildResponse = await promptAI(constrainedPrompt, data.envKey);

  if (constrainedBuildResponse?.error) {
    return makeErrorResponse(constrainedBuildResponse.error, 500);
  }

  let constrainedBuildResponseJSON;

  try {
    constrainedBuildResponseJSON = JSON.parse(cleanAIResponse(constrainedBuildResponse));
  } catch (err) {
    console.error("Failed to parse constrained AI response as JSON:", err);
    return makeErrorResponse("The AI returned an invalid constrained build. Please try again.",500);
  }

  const finalBuild = {
    CPU: pickFromOptions(constrainedBuildResponseJSON.CPU, topMatches.CPU),
    GPU: pickFromOptions(constrainedBuildResponseJSON.GPU, topMatches.GPU),
    RAM: pickFromOptions(constrainedBuildResponseJSON.RAM, topMatches.RAM),
    Storage: pickFromOptions(constrainedBuildResponseJSON.Storage, topMatches.Storage),
    Motherboard: pickFromOptions(constrainedBuildResponseJSON.Motherboard, topMatches.Motherboard),
    PSU: pickFromOptions(constrainedBuildResponseJSON.PSU, topMatches.PSU)
  };

  return new Response(
    JSON.stringify({ build: finalBuild }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}