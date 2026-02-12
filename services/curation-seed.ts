
import { Lead } from "../types";

// PHASE 1: "FAKE IT, BUT STRUCTURED"
// 20 High-Quality Seeds covering the Mix (Text/Video/3D | Creative/Eng/Biz/Culture)

export const DEFAULT_CHANNELS = [
    "Generative Video",
    "LLM Architecture", 
    "Digital Fashion",
    "Agentic Patterns",
    "Latent Space Theory",
    "Open Weights",
    "Post-Authenticity"
];

export const SYSTEM_SEEDS: Lead[] = [
    // --- TOPIC: ENGINEERING ---
    {
        id: "seed_01",
        target_topic: "SYSTEM_SEED",
        headline: "The Rise of Small Language Models",
        score: 9.5,
        type: "ANALYSIS",
        context: "Mistral and Phi-2 are outperforming giants. Efficiency is the new moat.",
        why_now: "Mistral just released 8x7B benchmarks beating GPT-3.5.",
        source_ref: "arxiv.org",
        detected_topic: "ENGINEERING",
        detected_format: "CASE_STUDY",
        risk_classification: "NONE",
        editorial_metrics: { trust: 95, novelty: 80, impact: 90, editorial_fit: 99 }
    },
    {
        id: "seed_02",
        target_topic: "SYSTEM_SEED",
        headline: "Flux.1 Dev vs Midjourney V6.1",
        score: 8.8,
        type: "FEATURE",
        context: "A technical breakdown of the UNET architecture differences.",
        why_now: "Flux is taking over open source leaderboards.",
        source_ref: "huggingface.co",
        detected_topic: "ENGINEERING",
        detected_format: "TUTORIAL",
        risk_classification: "NONE",
        editorial_metrics: { trust: 90, novelty: 85, impact: 80, editorial_fit: 95 }
    },
    
    // --- TOPIC: CREATIVE ---
    {
        id: "seed_03",
        target_topic: "SYSTEM_SEED",
        headline: "Synthetic Cinema: The Sora Effect",
        score: 9.2,
        type: "FEATURE",
        context: "How filmmakers are integrating generative video into traditional pipelines.",
        why_now: "Hollywood strikes just ended, but AI anxiety is peaking.",
        source_ref: "vimeo.com",
        detected_topic: "CREATIVE",
        detected_format: "ESSAY",
        risk_classification: "BRAND",
        editorial_metrics: { trust: 80, novelty: 95, impact: 95, editorial_fit: 100 }
    },
    {
        id: "seed_04",
        target_topic: "SYSTEM_SEED",
        headline: "Digital Haute Couture",
        score: 8.5,
        type: "FEATURE",
        context: "Using CLO3D and ComfyUI to design garments that can't exist.",
        why_now: "Paris Fashion Week featured 3 purely digital shows.",
        source_ref: "instagram.com",
        detected_topic: "CREATIVE",
        detected_format: "MANIFESTO",
        risk_classification: "NONE",
        editorial_metrics: { trust: 85, novelty: 90, impact: 70, editorial_fit: 95 }
    },

    // --- TOPIC: BUSINESS ---
    {
        id: "seed_05",
        target_topic: "SYSTEM_SEED",
        headline: "The GPU Rent-Seekers",
        score: 8.0,
        type: "ANALYSIS",
        context: "Why the compute shortage is artificial.",
        why_now: "Nvidia earnings call revealed massive stockpiling.",
        source_ref: "bloomberg.com",
        detected_topic: "BUSINESS",
        detected_format: "CASE_STUDY",
        risk_classification: "MARKET",
        editorial_metrics: { trust: 90, novelty: 60, impact: 85, editorial_fit: 80 }
    },
    {
        id: "seed_06",
        target_topic: "SYSTEM_SEED",
        headline: "Open Weights as a Strategy",
        score: 8.9,
        type: "ANALYSIS",
        context: "Meta's long game with Llama 3.",
        why_now: "Zuckerberg stated AGI is the goal.",
        source_ref: "stratechery.com",
        detected_topic: "BUSINESS",
        detected_format: "ESSAY",
        risk_classification: "NONE",
        editorial_metrics: { trust: 92, novelty: 70, impact: 95, editorial_fit: 85 }
    },

    // --- TOPIC: CULTURE ---
    {
        id: "seed_07",
        target_topic: "SYSTEM_SEED",
        headline: "The Death of the Interface",
        score: 9.8,
        type: "FEATURE",
        context: "Why 'Chat' is a regression in UI design.",
        why_now: "Rabbit R1 launch failure sparked UI debate.",
        source_ref: "are.na",
        detected_topic: "CULTURE",
        detected_format: "MANIFESTO",
        risk_classification: "NONE",
        editorial_metrics: { trust: 85, novelty: 98, impact: 90, editorial_fit: 100 }
    },
    {
        id: "seed_08",
        target_topic: "SYSTEM_SEED",
        headline: "Post-Authenticity",
        score: 7.5,
        type: "ANALYSIS",
        context: "When deepfakes become an aesthetic choice.",
        why_now: "Viral Pope coat image anniversary.",
        source_ref: "dazeddigital.com",
        detected_topic: "CULTURE",
        detected_format: "ESSAY",
        risk_classification: "LEGAL",
        editorial_metrics: { trust: 70, novelty: 80, impact: 60, editorial_fit: 90 }
    },
    
    // --- MIX: TOOLS & MEDIA ---
    {
        id: "seed_09",
        target_topic: "SYSTEM_SEED",
        headline: "Gaussian Splatting in the Browser",
        score: 8.2,
        type: "FEATURE",
        context: "Real-time 3D capture is finally web-ready.",
        why_now: "Three.js added native Splat support.",
        source_ref: "github.com",
        detected_topic: "ENGINEERING",
        detected_format: "TOOL",
        risk_classification: "NONE",
        editorial_metrics: { trust: 99, novelty: 75, impact: 60, editorial_fit: 85 }
    },
    {
        id: "seed_10",
        target_topic: "SYSTEM_SEED",
        headline: "Audio Reactive Latent Walks",
        score: 7.8,
        type: "FEATURE",
        context: "Syncing BPM to diffusion steps.",
        why_now: "New ComfyUI nodes released.",
        source_ref: "youtube.com",
        detected_topic: "CREATIVE",
        detected_format: "TUTORIAL",
        risk_classification: "NONE",
        editorial_metrics: { trust: 88, novelty: 70, impact: 50, editorial_fit: 80 }
    }
];
