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

The assistant contract is `AIProvider` in `src/lib/sandbox-ai.ts`. The app currently uses `localAIProvider`; a production provider should call a server endpoint that holds its API key in a server environment variable and receives only `buildExperimentContext(state)`, then returns a typed `AssistantReply`. No model key belongs in a `VITE_` variable or client bundle.

Run `pnpm install`, `pnpm dev`, `node node_modules/typescript/bin/tsc --noEmit`, and `pnpm build`. Global `pnpm lint` currently fails on inherited Prettier formatting issues across the repository.

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
