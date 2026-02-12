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
    hasSelectedApiKey(): Promise<boolean>;
    openSelectKey(): Promise<void>;
  }

  interface Window {
    // aistudio is already declared on Window in the environment types (as type AIStudio).
    // We implicitly extend it by augmenting the AIStudio interface above.
  }
}
