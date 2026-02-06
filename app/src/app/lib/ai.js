export async function promptAI(prompt) {
    // const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${process.env.OPENROUTER_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     model: "openai/gpt-4o",
    //     messages: [{ role: "user", content: prompt }],
    //     max_tokens: 300,
    //   }),
    // });

    // const data = await response.json();

    // const build = data.choices?.[0]?.message.content || "Error generating build";

    let build = '{\n' +
        '  "CPU": "Intel Core i5-13400",\n' +
        '  "GPU": "Integrated Graphics",\n' +
        '  "RAM": "16GB DDR4 3200MHz",\n' +
        '  "Storage": "512GB NVMe SSD",\n' +
        '  "Motherboard": "ASUS Prime B760M-A",\n' +
        '  "PSU": "550W 80+ Bronze",\n' +
        '  "Cooling": "Cooler Master Hyper 212",\n' +
        '  "Case": "NZXT H510"\n' +
        '}'

    try {
        return JSON.parse(build);
    } catch (err) {
        console.error("Failed to parse AI response as JSON:", err);
        return { error: "Failed to parse AI response" };
    }
}