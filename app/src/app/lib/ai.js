function cleanAIResponse(str) {
    str = str.replace(/```json|```/gi, "").trim();

    str = str.replace(/^\s+|\s+$/g, "");

    return str;
}

export async function promptAI(prompt) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    let buildMessage = data.choices?.[0]?.message.content;

    try {
        buildMessage = cleanAIResponse(buildMessage);
        return JSON.parse(buildMessage);
    } catch (err) {
        console.error("Failed to parse AI response as JSON:", err);
        return { error: buildMessage };
    }
}