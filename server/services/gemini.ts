import { GoogleGenAI } from "@google/genai";
import { MoodInterpretation, moods, moodInterpretationSchema } from "@shared/schema";
import { GEMINI_CONFIG } from "../config/api";

// Blueprint reference: javascript_gemini
// Centralized API configuration - to upgrade to a different model (e.g., gemini-2.5-flash),
// update GEMINI_CONFIG.model in server/config/api.ts

const ai = new GoogleGenAI({ apiKey: GEMINI_CONFIG.apiKey });

export async function interpretMood(text: string): Promise<MoodInterpretation> {
  try {
    const systemPrompt = `You are a mood analysis expert for classic movie recommendations. 
Analyze the user's text and extract:
1. The primary mood from: ${moods.join(", ")}
2. Preferred movie genres
3. Runtime preferences (min/max in minutes)
4. Era preferences (year range, default to 1970-2005 for classics)
5. Language preference (if mentioned)
6. Confidence score (0-1)

Respond with JSON in this exact format:
{
  "mood": "string",
  "preferredGenres": ["string"],
  "maxRuntimeMin": number (optional),
  "minRuntimeMin": number (optional),
  "era": { "from": number, "to": number } (optional),
  "languagePreference": "string" (optional),
  "confidence": number
}`;

    const result = await ai.models.generateContent({
      model: GEMINI_CONFIG.model,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            mood: { type: "string" },
            preferredGenres: {
              type: "array",
              items: { type: "string" },
            },
            maxRuntimeMin: { type: "number" },
            minRuntimeMin: { type: "number" },
            era: {
              type: "object",
              properties: {
                from: { type: "number" },
                to: { type: "number" },
              },
            },
            languagePreference: { type: "string" },
            confidence: { type: "number" },
          },
          required: ["mood", "preferredGenres", "confidence"],
        },
      },
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
    });

    const rawJson = result.response.text();
    if (!rawJson) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(rawJson);
    
    // Validate with Zod schema to ensure type safety
    const validated = moodInterpretationSchema.parse(parsed);
    
    // Double-check mood is in allowed list
    if (!moods.includes(validated.mood as any)) {
      validated.mood = "relaxed"; // Default fallback
    }

    return validated;
  } catch (error) {
    console.error("Gemini AI error:", error);
    // Fallback to keyword-based classification
    return fallbackMoodClassification(text);
  }
}

// Fallback keyword-based mood classifier
function fallbackMoodClassification(text: string): MoodInterpretation {
  const lowerText = text.toLowerCase();
  
  const keywords = {
    happy: ["happy", "cheerful", "uplifting", "joyful", "fun", "comedy", "laugh"],
    sad: ["sad", "melancholy", "emotional", "cry", "tears", "depressing"],
    nostalgic: ["nostalgic", "classic", "old", "vintage", "memories", "remember"],
    adventurous: ["adventure", "exciting", "action", "thrilling", "explore"],
    romantic: ["romantic", "love", "romance", "date", "couple"],
    intense: ["intense", "thriller", "suspense", "dark", "serious", "crime"],
    relaxed: ["relaxed", "calm", "peaceful", "easy", "light", "comfortable"],
    mysterious: ["mysterious", "mystery", "detective", "puzzle", "enigma"],
  };

  let detectedMood: MoodInterpretation["mood"] = "relaxed";
  let maxMatches = 0;

  for (const [mood, words] of Object.entries(keywords)) {
    const matches = words.filter((word) => lowerText.includes(word)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedMood = mood as any;
    }
  }

  // Map mood to genres
  const genreMapping: Record<string, string[]> = {
    happy: ["comedy", "family", "music"],
    sad: ["drama", "romance"],
    nostalgic: ["drama", "family", "romance"],
    adventurous: ["adventure", "action", "western"],
    romantic: ["romance", "drama"],
    intense: ["thriller", "crime", "mystery"],
    relaxed: ["comedy", "drama"],
    mysterious: ["mystery", "thriller", "crime"],
  };

  // Detect runtime preference
  let maxRuntimeMin: number | undefined;
  if (lowerText.includes("short") || lowerText.includes("quick")) {
    maxRuntimeMin = 120;
  }

  return {
    mood: detectedMood,
    preferredGenres: genreMapping[detectedMood] || ["drama"],
    maxRuntimeMin,
    era: { from: 1970, to: 2005 },
    confidence: maxMatches > 0 ? 0.7 : 0.5,
  };
}
