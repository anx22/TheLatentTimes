import { safeGenerateContent } from '../gemini';

export async function agentSynthesis(clusterTitle: string, items: { title: string; content?: string }[]): Promise<{ summary: string; keyEntities: string[] }> {
  const prompt = `
You are the Synthesis Agent for an intelligent news engine.
Your task is to analyze a cluster of related news signals and generate a concise meta-summary and extract key entities.

CLUSTER TITLE: ${clusterTitle}

SIGNALS:
${items.map((item, i) => `[${i + 1}] ${item.title}\n${item.content || ''}`).join('\n\n')}

Provide your analysis in the following JSON format:
{
  "summary": "A 2-3 sentence meta-summary of what this cluster is about, highlighting the main narrative or event.",
  "keyEntities": ["Entity 1", "Entity 2", "Entity 3"]
}
`;

  try {
    const response = await safeGenerateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a precise, analytical journalist synthesizing raw signals into coherent narratives.",
      }
    });
    
    const data = JSON.parse(response.text || "{}");
    return {
      summary: data.summary || "Emerging cluster of related signals.",
      keyEntities: data.keyEntities || []
    };
  } catch (error) {
    console.error("Synthesis Agent Error:", error);
    return { summary: "Emerging cluster of related signals.", keyEntities: [] };
  }
}
