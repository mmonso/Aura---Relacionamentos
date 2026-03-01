import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';

export const aiService = {
  async generateResponse(history: Message[], systemContext: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
    const formattedHistory = history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: formattedHistory,
      config: {
        systemInstruction: systemContext,
      }
    });

    return response.text || "Desculpe, não consegui gerar uma resposta.";
  }
};
