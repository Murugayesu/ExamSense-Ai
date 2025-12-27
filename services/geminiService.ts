
import { GoogleGenAI, Type } from "@google/genai";
import { ExamAnalysis, Priority, Depth } from "../types";

export interface FileData {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export async function analyzeExamMaterial(
  syllabusText: string, 
  questionsText: string,
  syllabusFiles: FileData[],
  questionFiles: FileData[]
): Promise<ExamAnalysis> {
  // Strict adherence to developer guidelines for API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze the provided syllabus and past exam questions to create a strategic exam preparation plan.
    
    INSTRUCTIONS:
    1. Cross-reference the syllabus topics with the past exam questions.
    2. Identify recurring patterns: which topics are high-yield (frequently asked)?
    3. Determine the required preparation depth (Basic recall vs. Complex Application).
    4. Provide a structured, prioritized study roadmap.

    PASTED SYLLABUS TEXT:
    ${syllabusText || 'None provided'}
    
    PASTED QUESTIONS TEXT:
    ${questionsText || 'None provided'}
  `;

  const parts = [
    { text: prompt },
    ...syllabusFiles,
    ...questionFiles
  ];

  const response = await ai.models.generateContent({
    // Upgraded to pro for better document reasoning and pattern recognition
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          syllabus: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                topics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: [Priority.HIGH, Priority.MEDIUM, Priority.LOW] },
                      depth: { type: Type.STRING, enum: [Depth.BASIC, Depth.CONCEPTUAL, Depth.NUMERICAL, Depth.APPLICATION] },
                      reasoning: { type: Type.STRING }
                    },
                    required: ["name", "priority", "depth", "reasoning"]
                  }
                }
              },
              required: ["title", "topics"]
            }
          },
          keyInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          studyPlan: {
            type: Type.OBJECT,
            properties: {
              masterNow: { type: Type.ARRAY, items: { type: Type.STRING } },
              deepDive: { type: Type.ARRAY, items: { type: Type.STRING } },
              quickRevision: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["masterNow", "deepDive", "quickRevision"]
          }
        },
        required: ["syllabus", "keyInsights", "studyPlan"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as ExamAnalysis;
  } catch (err) {
    console.error("Failed to parse Gemini response:", err);
    throw new Error("Could not generate analysis. Please ensure your inputs are clear and try again.");
  }
}
