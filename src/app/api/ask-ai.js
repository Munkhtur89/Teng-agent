import mammoth from "mammoth";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { question, wordFileName } = req.body;

  // Word файлын замыг тодорхойлох
  const filePath = path.join(process.cwd(), "public/word", wordFileName);

  // Word файлыг унших
  let fileText = "";
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    fileText = result.value;
  } catch (e) {
    return res.status(500).json({ error: "Word файлыг уншиж чадсангүй" });
  }

  // OpenAI руу асуулт + файлын агуулгыг илгээх
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `Энэ бол Word файлын агуулга: ${fileText}`,
        },
        {
          role: "user",
          content: question,
        },
      ],
    }),
  });
  const data = await openaiRes.json();
  res.status(200).json({ answer: data.choices[0].message.content });
}

function findRelevantSection(text, keyword) {
  const lines = text.split("\n");
  const idx = lines.findIndex((line) =>
    line.toLowerCase().includes(keyword.toLowerCase())
  );
  if (idx === -1) return "";
  return lines.slice(Math.max(0, idx - 2), idx + 3).join("\n");
}
