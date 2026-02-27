import { safeGenerateContent, searchTrend } from '../gemini';

export const agentTargetedSearch = async (topic: string, globalDirective?: string): Promise<{ context: string; grounded: boolean; urls: { title: string; url: string }[] }> => {
  const searchResult = await searchTrend(`latest technical details, documentation, and real-world developments regarding: ${topic}`);
  const directivePrefix = globalDirective ? `DIRECTOR'S STRATEGIC DIRECTIVE: "${globalDirective}"\n\nYou MUST align your output with this directive.\n\n` : '';
  
  const prompt = `
    ${directivePrefix}
    You are THE SCOUT. The Editor has requested a deep-dive on the following topic: "${topic}".
    
    Review the live web data below and extract the most crucial, cutting-edge technical facts, context, and recent developments.
    
    Raw Data:
    ${searchResult.text}
    
    If the raw data does NOT contain relevant information about "${topic}" (i.e., it's a fictional or non-existent technical topic), you MUST start your response with "UNGROUNDED:".
    
    Otherwise, provide a concise, highly technical briefing (max 3 sentences) that will serve as the foundation for the Columnist.
  `;

  const response = await safeGenerateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  const text = response.text?.trim() || "";
  const isGrounded = !text.startsWith("UNGROUNDED:");
  const cleanText = text.replace("UNGROUNDED:", "").trim() || `No real-world technical grounding found for "${topic}". Proceeding with speculative synthesis.`;

  return { 
    context: cleanText, 
    grounded: isGrounded,
    urls: searchResult.groundingUrls
  };
};
