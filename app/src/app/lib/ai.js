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
    return { error: "Something went wrong with the AI. Please try again and make sure your API key is correct." };
  }

  return data.choices?.[0]?.message?.content;
}