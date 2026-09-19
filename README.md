# Creative Interface Design

Sen professional dizaynersan va web developer va dasturchisan, bizning websiteimiz ushbu funksiyalardan iborat, menga shu saytning interfeysi kerak, xatosiz va mukammal qil

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://flawless-digital-art.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1c6b00c8-92a3-4851-9077-5aade66b81ee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

## 3D laboratory sandbox

Open `/sandbox` or use the **Erkin kimyo laboratoriyasi** card in the laboratory catalog. The freeform lab runs entirely in the browser and needs no API key. Add equipment and materials from the drawer, drag objects on the bench, select a vessel, and transfer a source into it from the inspector. The timeline records simulation events; the right panel uses a local, rule based assistant grounded in those events and current contents.

The current simulation covers water, hydrogen, bromine, iron, nine equipment forms, and one deliberately simplified iron–bromine demonstration when both materials are in a vessel heated to 80°C. It is educational software, not a quantitative chemistry model. Other periodic table tiles are reference placeholders.

The assistant contract is `AIProvider` in `src/lib/sandbox-ai.ts`. The UI now uses `hybridAIProvider` (`src/lib/hybrid-ai-provider.ts`), which calls the real AI teacher through a Supabase Edge Function and transparently falls back to the rule-based `localAIProvider` if Supabase isn't connected yet or the request fails. No model key belongs in a `VITE_` variable or client bundle.

### AI teacher (Supabase Edge Function)

1. In the Lovable project settings, add the **Supabase** integration (one click). This creates `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the frontend automatically.
2. Set the server-side secret: `supabase secrets set OPENAI_API_KEY=sk-...` (or via the Supabase dashboard → Edge Functions → Secrets). This key is only ever read inside the function, never sent to the browser.
3. Deploy the function: `supabase functions deploy ai-teacher`.
4. Copy `.env.example` to `.env.local` for local development and fill in the two `VITE_SUPABASE_*` values from the Supabase project settings.

Until Supabase is connected, `supabase` in `src/lib/supabase-client.ts` is `null` and `hybridAIProvider` silently uses `localAIProvider`, so the sandbox keeps working with no configuration.

Run `pnpm install`, `pnpm dev`, `node node_modules/typescript/bin/tsc --noEmit`, and `pnpm build`. Global `pnpm lint` currently fails on inherited Prettier formatting issues across the repository.

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
