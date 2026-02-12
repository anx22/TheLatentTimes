export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly API_KEY: string;
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: string;
      readonly VITE_GEMINI_API_KEY: string;
    }
  }

  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Google AI Studio Key Selection Interface
    aistudio?: AIStudio;
  }
}
