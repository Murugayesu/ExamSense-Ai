import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { syllabusText, questionsText } = req.body;

  const ai = new GoogleGenAI({
    apiKey: process.env.API_KEY, // comes from Vercel
  });

  const prompt = `
Analyze the syllabus and past exam questions and create a study plan.

SYLLABUS:
${syllabusText || "None"}

QUESTIONS:
${questionsText || "None"}
`;

  const result = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: [{ text: prompt }],
  });

  return res.status(200).json({
    output: result.text,
  });
}
