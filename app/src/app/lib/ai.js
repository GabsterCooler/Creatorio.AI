/**
 * Thin wrapper around the OpenRouter chat completions API.
 *
 * - `prompt` is the full text prompt we send as a single user message.
 * - `apiKey` is the user's OpenRouter key (validated earlier in the flow).
 * - On failure, returns an `{ error: string }` object so callers can surface
 *   a friendly message without needing to know HTTP / API details.
 */
export async function promptAI(prompt, apiKey) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    }),
  });

  const data = await response.json();

  if (!response.ok || data.error?.message) {
    console.error("Failed to get response from AI:", data.error?.message);
    return {
      error:
        "Something went wrong with the AI. Please try again and make sure your API key is correct.",
    };
  }

  // On success we only care about the raw message text; higher‑level
  // parsing / validation is handled by the route code.
  return data.choices?.[0]?.message?.content;
}