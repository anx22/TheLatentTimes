<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# The Latent Times

AI-native magazine engine — React (Vite) + Convex + Gemini.
See [PRODUCT.md](./PRODUCT.md), [ARCHITECTURE.md](./ARCHITECTURE.md),
[AGENTS.md](./AGENTS.md), and [DECISIONS.md](./DECISIONS.md) for context.

## Run Locally

Prerequisites: Node.js, a Convex account, a Google AI Studio API key.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure Convex (one-off):

   ```bash
   npx convex dev
   ```

   This creates a deployment and writes `VITE_CONVEX_URL` into `.env.local`.

3. Set the Gemini API key in the Convex deployment **(not in the browser)**:

   ```bash
   npx convex env set GEMINI_API_KEY <your-google-ai-studio-key>
   ```

   All agent calls run inside Convex actions (`convex/gemini.ts`), so the key
   never enters the browser bundle.

4. Run the app:

   ```bash
   npm run dev
   ```

`npx convex dev` should keep running in a second terminal to push schema /
function changes.
