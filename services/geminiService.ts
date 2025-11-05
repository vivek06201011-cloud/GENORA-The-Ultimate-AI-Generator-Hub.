
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Tool } from '../types';
import { TOOLS } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A simple check, though the prompt says to assume it's available.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateContent = async (
  toolId: string,
  input: string,
  secondaryInput?: string
): Promise<string> => {
  const tool: Tool | undefined = TOOLS.find(t => t.id === toolId);
  if (!tool) {
    throw new Error('Invalid tool selected');
  }

  const prompt = tool.prompt(input, secondaryInput);
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: tool.model,
      contents: prompt,
      config: {
        ...(tool.isComplex && { thinkingConfig: { thinkingBudget: 32768 } }),
        ...(tool.useSearch && { tools: [{googleSearch: {}}] }),
      }
    });

    let text = response.text;
    
    if (tool.useSearch && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const sources = response.candidates[0].groundingMetadata.groundingChunks
        .map(chunk => chunk.web)
        .filter(web => web?.uri)
        .map(web => `[${web.title || web.uri}](${web.uri})`);
      
      if (sources.length > 0) {
        const uniqueSources = [...new Set(sources)];
        text += `\n\n**Sources:**\n${uniqueSources.join('\n')}`;
      }
    }
    
    return text;
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    if (error instanceof Error) {
        return `An error occurred: ${error.message}. Please check your API key and network connection.`;
    }
    return "An unknown error occurred.";
  }
};

export const streamChat = async (history: { role: string; parts: { text: string }[] }[], message: string, onChunk: (chunk: string) => void) => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history,
        });

        const responseStream = await chat.sendMessageStream({ message });

        for await (const chunk of responseStream) {
            onChunk(chunk.text);
        }
    } catch (error) {
        console.error("Error in streaming chat:", error);
        if (error instanceof Error) {
            onChunk(`An error occurred: ${error.message}.`);
        } else {
            onChunk("An unknown error occurred during chat.");
        }
    }
};
