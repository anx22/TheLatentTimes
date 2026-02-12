
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

  interface Window {
    // aistudio definition removed as it conflicts with the global definition provided by the environment/SDK
    // Use the global AIStudio type if available, or any.
  }
}
