
import { GoogleGenAI, Type } from "@google/genai";
import { NewsArticle } from "../types";

// Initialize the Google GenAI SDK using the environment variable API_KEY.
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

/**
 * Discovers emerging news clusters that merit their own page.
 */
export async function discoverEmergingTopics(): Promise<string[]> {
  const model = 'gemini-3-flash-preview';
  const prompt = "Identify 4 highly specific and emerging global news topics today that are distinct from 'General Politics' or 'General Tech'. Examples: 'Solid-state battery breakthroughs', 'Red Sea shipping crisis', 'Generative Video regulations'. Return as a simple JSON array of strings.";

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    // When using googleSearch, the response.text might contain grounded citations.
    // We use regex to safely extract the JSON array to avoid parsing errors.
    const text = response.text || '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : '[]');
  } catch (error) {
    console.error("Topic discovery failed:", error);
    return ['Semiconductor Trade', 'Climate Legislation', 'Biotech Innovation'];
  }
}

/**
 * Fetches and catalogs news for a specific topic cluster.
 */
export async function fetchNewsByTopic(topic: string): Promise<NewsArticle[]> {
  const model = 'gemini-3-flash-preview';
  const prompt = `Perform a high-precision search for the latest 6 news stories about "${topic}". 
  Provide: title, source name, URL, a detailed summary, sentiment, urgency (1-10), and tags.
  Ensure the data is current and verified.`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              summary: { type: Type.STRING },
              publishedAt: { type: Type.STRING },
              sentiment: { type: Type.STRING },
              urgency: { type: Type.NUMBER },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["title", "source", "url", "summary", "publishedAt", "sentiment", "urgency", "tags"]
          }
        }
      },
    });

    // Extract JSON array safely from the response as grounding might inject additional text.
    const text = response.text || '[]';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const results = JSON.parse(jsonMatch ? jsonMatch[0] : '[]');
    
    return results.map((item: any) => ({
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      category: topic,
      // Normalize sentiment to strict types
      sentiment: ['positive', 'negative', 'neutral'].includes(item.sentiment?.toLowerCase()) 
        ? item.sentiment.toLowerCase() 
        : 'neutral'
    }));
  } catch (error) {
    console.error(`Error cataloging news for ${topic}:`, error);
    return [];
  }
}

export async function getTopicInsights(topic: string, articles: NewsArticle[]): Promise<string> {
  const model = 'gemini-3-pro-preview'; // Use Pro for deeper analysis
  const context = articles.map(a => `[${a.source}] ${a.title}: ${a.summary}`).join('\n');
  const prompt = `Context: ${context}\n\nTask: Provide an autonomous strategic synthesis of the "${topic}" cluster. What are the non-obvious implications? What should be monitored in the next 72 hours? Be sharp, professional, and data-driven.`;

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    let result = response.text || "Insight generation pending...";
    
    // As per Search Grounding rules, extract and append URLs from groundingChunks to the UI response.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const sources = chunks.map((c: any) => c.web).filter(Boolean);
      if (sources.length > 0) {
        result += "\n\nSources: " + sources.map((s: any) => s.uri).join(", ");
      }
    }
    
    return result;
  } catch (error) {
    return "The Nexus intelligence layer is currently recalibrating its analysis for this cluster.";
  }
}

export async function askAI(query: string, history: NewsArticle[]): Promise<string> {
  const model = 'gemini-3-flash-preview';
  const context = history.slice(0, 8).map(a => `${a.title} (Source: ${a.source})`).join('\n');
  const prompt = `Role: Senior Nexus News Analyst.
  Current News Context:
  ${context}
  
  User Query: "${query}"
  
  Instructions: Use the context and live Google Search to provide a comprehensive answer. If the query is about trends, provide predictions based on current signals.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
    });
    
    let result = response.text || "Data retrieval failed. Please re-issue the prompt.";

    // Extraction of grounding URLs is mandatory when using googleSearch tool.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks && chunks.length > 0) {
      const sources = chunks.map((c: any) => c.web).filter(Boolean);
      if (sources.length > 0) {
        // Dedup and list source URLs clearly in the chat response.
        const uniqueUris = Array.from(new Set(sources.map((s: any) => s.uri)));
        result += "\n\nReferenced links: " + uniqueUris.join(", ");
      }
    }

    return result;
  } catch (error) {
    return "Nexus link unstable. Unable to provide real-time analysis at this moment.";
  }
}
