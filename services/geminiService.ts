
import { GoogleGenAI } from "@google/genai";
import { ProcessTemplate } from '../types.js';

const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.error("Failed to initialize GoogleGenAI", e);
}

export const generateCode = async (prompt: string, context?: string): Promise<string> => {
  if (!ai) {
    throw new Error("API Key not configured. Please ensure process.env.API_KEY is set.");
  }

  const fullPrompt = `
    You are an expert software engineer and coding assistant. 
    Your task is to help the user with the following request.
    
    Context: ${context || 'None provided'}
    
    User Request: ${prompt}
    
    If the user asks for code, provide ONLY the code within markdown code blocks. 
    If the user asks a question, answer concisely.
    Prefer React + Tailwind for UI requests unless specified otherwise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const analyzeCodeEfficiency = async (code: string): Promise<{ score: number; feedback: string }> => {
  if (!ai) {
      return { score: 0, feedback: "API Key missing." };
  }

  const prompt = `
    Analyze the following code for efficiency, readability, and best practices.
    Return a JSON object with two fields:
    1. "score" (number 0-100)
    2. "feedback" (short string summary)

    Code to analyze:
    ${code}
  `;

  try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
      });
      
      const text = response.text;
      if (!text) return { score: 0, feedback: "Analysis failed." };
      
      const result = JSON.parse(text);
      return result;
  } catch (e) {
      return { score: 0, feedback: "Could not analyze code." };
  }
}

export const summarizeFeedback = async (comments: string[]): Promise<string> => {
    if (!ai || comments.length === 0) return "No feedback to summarize.";

    const prompt = `
      Summarize the following user feedback comments into a single concise paragraph. 
      Highlight key positives and common complaints.

      Comments:
      ${comments.map(c => `- ${c}`).join('\n')}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });
        return response.text || "Could not generate summary.";
    } catch (e) {
        return "Error generating summary.";
    }
};

export const parseProcessTemplate = async (rawText: string): Promise<Partial<ProcessTemplate>> => {
    if (!ai) throw new Error("AI not initialized");

    const prompt = `
        Parse the following raw text into a structured Process Template for a software development platform.
        Return a JSON object with these keys:
        - title (string, short and clear)
        - description (string, 1-2 sentences)
        - promptContent (string, the core instruction for the AI)
        - inputFormat (string, description of what user inputs)
        - outputFormat (string, description of expected output)
        - techStack (array of strings, infer from text)

        Raw Text:
        ${rawText}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        const text = response.text;
        if (!text) throw new Error("Empty response");
        return JSON.parse(text);
    } catch (e) {
        console.error("Parse failed", e);
        throw new Error("Failed to parse template.");
    }
};
