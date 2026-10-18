
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { ViralIdea, Scene, VoiceName } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Helper to decode raw PCM data
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const geminiService = {
  async generateViralIdeas(niche: string): Promise<ViralIdea[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 viral short-form video ideas for the niche: "${niche}". 
      Focus on high retention hooks and trending formats. Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              hook: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              viralScore: { type: Type.NUMBER }
            },
            required: ["title", "hook", "reasoning", "viralScore"]
          }
        }
      }
    });

    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      console.error("Failed to parse ideas JSON", e);
      return [];
    }
  },

  async generateScript(ideaTitle: string, hook: string): Promise<{ scenes: Scene[], captions: string, hashtags: string[] }> {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Create a professional 60-second video script for this viral idea: "${ideaTitle}". Hook: "${hook}". 
      Break it into 4-6 specific scenes. For each scene, provide a cinematic visual prompt (detailed, lighting, camera angle) and the spoken audio script.
      Also generate an optimized caption and 20 viral hashtags.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  visualPrompt: { type: Type.STRING },
                  audioScript: { type: Type.STRING },
                  duration: { type: Type.NUMBER }
                },
                required: ["id", "visualPrompt", "audioScript", "duration"]
              }
            },
            captions: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["scenes", "captions", "hashtags"]
        }
      }
    });

    try {
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Failed to parse script JSON", e);
      return { scenes: [], captions: "", hashtags: [] };
    }
  },

  async generateVoiceOver(text: string, voiceName: VoiceName = VoiceName.KORE): Promise<AudioBuffer> {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say with high energy and engagement: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data returned");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const buffer = await decodeAudioData(decode(base64Audio), audioContext, 24000, 1);
    return buffer;
  }
};
