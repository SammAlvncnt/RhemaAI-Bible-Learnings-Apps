import { GoogleGenAI, Type } from "@google/genai";
import { Book, Translation, Verse, BOOKS } from "../lib/constants";

// Lazy initialize Gemini
let genAI: any = null;
function getAI() {
  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
  }
  return genAI;
}

// In-memory cache for verses
const verseCache: Record<string, Verse[]> = {};

export async function fetchVersesFromAPI(bookName: string, chapter: number, translation: Translation): Promise<Verse[]> {
  const cacheKey = `${bookName}-${chapter}-${translation}`;
  if (verseCache[cacheKey]) {
    // Return a copy to prevent mutation issues
    return [...verseCache[cacheKey]];
  }

  // Try bible-api.com for English (KJV, WEB, BBE)
  let result: Verse[] = [];
  
  if (translation === 'TB' || translation === 'BIMK' || translation === 'NIV') {
    result = await fetchVersesFromGemini(bookName, chapter, translation);
  } else {
    try {
      const apiTranslationMap: Record<string, string> = {
        'KJV': 'kjv',
        'WEB': 'web',
        'BBE': 'bbe',
      };
      
      const apiTrans = apiTranslationMap[translation] || 'kjv';
      const response = await fetch(`https://bible-api.com/${bookName}+${chapter}?translation=${apiTrans}`);
      if (!response.ok) throw new Error('API failure');
      const data = await response.json();
      
      result = data.verses.map((v: any) => ({
        id: `${bookName.toLowerCase()}-${chapter}-${v.verse}-${translation}`,
        testament: BOOKS.find(b => b.name === bookName)?.testament || 'NT',
        bookName,
        bookId: bookName.toLowerCase().replace(/\s+/g, '-'),
        chapter,
        verse: v.verse,
        translation,
        language: 'en',
        text: v.text,
      }));
    } catch (error) {
      console.warn("External API failed, falling back to Gemini", error);
      result = await fetchVersesFromGemini(bookName, chapter, translation);
    }
  }

  if (result.length > 0) {
    verseCache[cacheKey] = result;
  }
  return result;
}

/**
 * Preloads adjacent chapters to the cache
 */
export function preloadAdjacentChapters(bookName: string, chapter: number, currentTranslation: Translation, parallelTranslation: Translation | null) {
  const book = BOOKS.find(b => b.name === bookName);
  if (!book) return;

  const translations = [currentTranslation];
  if (parallelTranslation) translations.push(parallelTranslation);

  // Preload next chapter
  if (chapter < book.chapterCount) {
    translations.forEach(t => fetchVersesFromAPI(bookName, chapter + 1, t));
  }
  
  // Preload prev chapter
  if (chapter > 1) {
    translations.forEach(t => fetchVersesFromAPI(bookName, chapter - 1, t));
  }
}

export async function fetchVersesFromGemini(bookName: string, chapter: number, translation: Translation): Promise<Verse[]> {
  const ai = getAI();
  
  const prompt = `Return all verses for ${bookName} chapter ${chapter} in the ${translation} (Indonesian or English) translation.
  Return only a JSON array of objects with "verse" (number) and "text" (string) properties. 
  Do not include any other text in the response.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              verse: { type: Type.NUMBER },
              text: { type: Type.STRING },
            },
            required: ["verse", "text"]
          },
        },
      },
    });

    const versesData = JSON.parse(result.text);
    return versesData.map((v: any) => ({
      id: `${bookName.toLowerCase()}-${chapter}-${v.verse}-${translation}`,
      testament: BOOKS.find(b => b.name === bookName)?.testament || 'NT',
      bookName,
      bookId: bookName.toLowerCase().replace(/\s+/g, '-'),
      chapter,
      verse: v.verse,
      translation,
      language: ['TB', 'BIMK'].includes(translation) ? 'id' : 'en',
      text: v.text,
    }));
  } catch (error) {
    console.error("Gemini Bible Fetch Error:", error);
    return [];
  }
}

export async function getInsight(verse: Verse): Promise<string> {
  const ai = getAI();
  const prompt = `Provide a deep theological and cultural insight for this Bible verse: ${verse.bookName} ${verse.chapter}:${verse.verse} (${verse.translation}).
  Verse text: "${verse.text}"
  Format: Clear, immersive, scholarly but accessible. Explain Greek/Hebrew meanings where relevant. Max 100 words.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return result.text || "No insight available.";
  } catch (error) {
    return "Failed to load insight.";
  }
}
