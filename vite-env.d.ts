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
    // aistudio is declared globally by the environment/SDK types with type 'AIStudio'.
    // Removing local declaration to avoid "Subsequent property declarations must have the same type" error.
  }
}