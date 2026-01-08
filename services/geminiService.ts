import { GoogleGenAI, Type } from "@google/genai";
import { TweetData, CalendarEntry, AnalysisResult } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in process.env.API_KEY");
  }
  return new GoogleGenAI({ apiKey });
};

// 1. Rewrite Tweet Logic
export const rewriteTweet = async (originalText: string): Promise<string> => {
  try {
    const ai = getAiClient();
    
    const prompt = `
      Analyze the following X (Twitter) post: "${originalText}".
      Rewrite this tweet to convey the same core message but with a fresh angle, keeping it concise and engaging. 
      Maintain a professional yet conversational SaaS-founder tone. 
      Use a strong hook. Do not add hashtags unless they are extremely relevant (max 1).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate rewrite.";
  } catch (error) {
    console.error("Rewrite error:", error);
    if (error instanceof Error) {
        return `Error: ${error.message}`;
    }
    return "Error generating rewrite. Please check your API Key and connection.";
  }
};

// 2. Analyze Time & Niche
export const analyzePerformance = async (tweets: TweetData[]): Promise<AnalysisResult> => {
  try {
    const ai = getAiClient();

    // Prepare data for AI
    const dataSummary = tweets.map(t => ({
      text: t.text.substring(0, 50) + "...",
      hasVisual: !!t.imageUrl,
      postedAt: t.postedAt,
      engagement: t.likes + t.comments * 2 + (t.views / 100) // Simple weighted score
    }));

    const prompt = `
      You are a social media growth expert. Analyze this dataset of tweets and their performance:
      ${JSON.stringify(dataSummary)}

      1. Identify the 3 best time windows for posting based on high engagement.
      2. Identify the specific content niche based on the text.
      3. Calculate an abstract engagement health score (0-100).
      Note: Tweets with visuals (hasVisual: true) often perform better. Factor this into your score/analysis.

      Return JSON.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestTimeSlots: { type: Type.ARRAY, items: { type: Type.STRING } },
            nicheAnalysis: { type: Type.STRING },
            engagementScore: { type: Type.NUMBER },
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      bestTimeSlots: ["Morning (08:00 - 10:00)", "Evening (18:00 - 20:00)"],
      nicheAnalysis: "General Tech/SaaS (Default - Check API Key)",
      engagementScore: 50
    };
  }
};

// 3. Generate Calendar (Requires > 35 tweets ideally, but works with less for demo)
export const generateCalendar = async (tweets: TweetData[], niche: string): Promise<CalendarEntry[]> => {
  try {
    const ai = getAiClient();

    const prompt = `
      Based on the identified niche "${niche}" and the style of previous tweets, generate a 3-day content calendar with 2 tweets per day.
      
      Follow these rules:
      - Mix of educational threads (hooks), questions, and personal insights.
      - Strong hooks are mandatory.
      - English language.
      
      Return a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING, description: "Day 1, Day 2, etc." },
              time: { type: Type.STRING, description: "Suggested time e.g. 09:00 AM" },
              topic: { type: Type.STRING },
              hook: { type: Type.STRING, description: "The actual tweet text draft" },
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as CalendarEntry[];
  } catch (error) {
    console.error("Calendar error:", error);
    return [];
  }
};