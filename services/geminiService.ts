import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

export const initializeGemini = (apiKey: string) => {
  if (!apiKey) return;
  genAI = new GoogleGenAI({ apiKey });
};

export const askHRPolicy = async (question: string): Promise<string> => {
  if (!genAI || !process.env.API_KEY) {
    return "ยังไม่ได้เริ่มระบบ AI หรือไม่พบ API Key";
  }

  try {
    const model = 'gemini-2.5-flash';
    const systemInstruction = `You are a helpful HR Assistant for a company called 'Thansandee' in Thailand. 
    Answer questions based on general HR best practices and Thai Labor Law. 
    Keep answers concise, polite, and professional. 
    **Always answer in Thai language.**
    Use a helpful tone.
    If asked about specific company data (like salaries of other employees), refuse politely in Thai.
    `;

    const response = await genAI.models.generateContent({
      model: model,
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "ขออภัย ไม่สามารถสร้างคำตอบได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับบริการ AI";
  }
};