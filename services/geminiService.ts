
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `Analyze the provided syllabus and past exam questions to create a strategic exam preparation plan.
    
    INSTRUCTIONS:
    1. Look at both the provided text and any uploaded documents (PDFs/Images).
    2. Use ONLY provided syllabus topics.
    3. Identify patterns: which topics appear most often in the questions?
    4. Determine the required depth: are questions factual (Basic), theoretical (Conceptual), mathematical (Numerical/Derivation), or real-world cases (Application)?
    5. Provide actionable insights on high-return areas.

    PASTED SYLLABUS TEXT:
    ${syllabusText || 'None provided'}
    
    PASTED QUESTIONS TEXT:
    ${questionsText || 'None provided'}
  `;

  // Combine text and files into parts
  const parts = [
    { text: prompt },
    ...syllabusFiles,
    ...questionFiles
  ];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
                title: { type: Type.STRING, description: "The unit or chapter title" },
                topics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      priority: { type: Type.STRING, enum: [Priority.HIGH, Priority.MEDIUM, Priority.LOW] },
                      depth: { type: Type.STRING, enum: [Depth.BASIC, Depth.CONCEPTUAL, Depth.NUMERICAL, Depth.APPLICATION] },
                      reasoning: { type: Type.STRING, description: "Why this priority/depth was assigned based on past paper frequency" }
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
            items: { type: Type.STRING },
            description: "Bullet points of key recurring patterns or strategic advice"
          },
          studyPlan: {
            type: Type.OBJECT,
            properties: {
              masterNow: { type: Type.ARRAY, items: { type: Type.STRING }, description: "High-priority items to perfect first" },
              deepDive: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Complex topics requiring more time" },
              quickRevision: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Low frequency but easy topics" }
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
    throw new Error("Could not generate analysis. Please ensure your inputs/files are clear and try again.");
  }
}
