import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const body = req.body || {};
    const syllabusText = body.syllabusText || "";
    const questionsText = body.questionsText || "";

    const ai = new GoogleGenAI({
      apiKey: process.env.AIzaSyBEpaUR2_Kbf2YNehw0RFxo87tQATwR4qs,
    });

    const prompt = `
Analyze the syllabus and past exam questions and create a study plan.

SYLLABUS:
${syllabusText}

QUESTIONS:
${questionsText}
`;

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ text: prompt }],
    });

    return res.status(200).json({
      output: result.text,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "AI analysis failed",
    });
  }
}
