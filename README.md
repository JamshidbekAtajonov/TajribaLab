# TajribaLab — Virtual fan laboratoriyasi

O'zbek tilidagi virtual laboratoriya platformasi. O'quvchilar kimyo, fizika va biologiya tajribalarini haqiqiy fizika/kimyo/biologiya qoidalariga asoslangan interaktiv 3D va 2D simulyatsiyalar orqali, ro'yxatdan o'tmasdan va real jihozlarsiz bajarishlari mumkin.

**Live demo**: https://tajriba-lab.vercel.app
## Bu loyiha qanday qurilgan

Loyihaning boshlang'ich interfeys dizayni va skeleti [Lovable](https://lovable.dev) platformasida yaratilgan. Undan keyingi barcha funksionallik — laboratoriya simulyatsiyalari, hisoblash mantiqlari, AI ustoz integratsiyasi, animatsiyalar, o'zbek tiliga to'liq tarjima va boshqa hamma narsa — **Claude (Anthropic)** tomonidan, Claude Code orqali to'g'ridan-to'g'ri ushbu repozitoriyda yozilgan.

## Nima qila oladi

- **Kimyo — kislota-ishqor titrlash**: byuretka, kolba va indikator bilan haqiqiy titrlash jarayoni; pH qiymati kislota/ishqor mol balansidan real formula orqali hisoblanadi (taxminiy son emas).
- **Kimyo — erkin laboratoriya (sandbox)**: suv, vodorod, brom va temir bilan erkin tajriba; 9 xil jihoz, temir+brom reaksiyasi 80°C dan yuqorida haqiqiy modellashtirilgan.
- **Fizika — oddiy elektr zanjiri**: manba, ampermetr, rezistor va voltmetrni simlar bilan ulab, Om qonuni (I = U/R) asosida real hisoblangan tok va kuchlanishni kuzatish; noto'g'ri ulanish (ampermetr ketma-ket emas, qisqa tutashuv) aniq xato bilan ko'rsatiladi.
- **Biologiya — mikroskop kuzatuvi**: ikkita tayyor preparat (piyoz pardasi, elodeya bargi), 10x/40x obyektiv, fokus va yorug'lik boshqaruvi; kattalashtirish oshganda hech qanday yangi (to'qib chiqarilgan) tafsilot qo'shilmaydi — faqat mavjud tasvir kattalashadi.
- **AI ustoz**: barcha to'rtta laboratoriyada ham har bir tajriba o'z real holatini AI'ga yuboradi, shuning uchun javoblar shu tajribada haqiqatan mavjud bo'lgan narsalarga asoslanadi. Server ishlamasa yoki sozlanmagan bo'lsa, avtomatik ravishda qoidaviy (rule-based) lokal javobga tushadi — tajriba hech qachon to'xtab qolmaydi.
- **Natijalar**: tajriba tarixi, CSV eksport, brauzer orqali PDF chop etish, kuzatuv/xulosa yozish — hammasi qurilmada (localStorage) saqlanadi, hisob yaratish shart emas.
- **PWA**: sayt telefon/kompyuterga "ilova" sifatida o'rnatiladi (manifest + service worker), Android uchun APK sifatida ham o'rash mumkin.

## Texnologiyalar

**Frontend**
- [React 19](https://react.dev) + [TanStack Start](https://tanstack.com/start) (SSR, fayl asosidagi routing, server funksiyalari)
- [TanStack Router](https://tanstack.com/router) va [TanStack Query](https://tanstack.com/query)
- [TypeScript](https://www.typescriptlang.org) (qat'iy `strict` sozlamalar bilan)
- [Vite](https://vite.dev) — build vositasi
- [Tailwind CSS 4](https://tailwindcss.com) + [Radix UI](https://www.radix-ui.com) primitivlari (shadcn/ui uslubida)
- [Zod](https://zod.dev) — sxema validatsiyasi (URL qidiruv parametrlari va h.k.)
- [Recharts](https://recharts.org) — I–U grafigi va boshqa diagrammalar
- [Lucide](https://lucide.dev) — ikonalar

**3D/2D grafika**
- [Three.js](https://threejs.org), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) va [drei](https://github.com/pmndrs/drei) — barcha 3D laboratoriya sahnalari (kolba, zanjir jihozlari, mikroskop korpusi)
- Xom SVG — 2D sxemalar (titrlash qurilmasi, elektr zanjiri taxtasi, mikroskop okulyar ko'rinishi)

**AI**
- [Anthropic Claude API](https://www.anthropic.com) (`claude-haiku-4-5`) — AI ustoz uchun, TanStack Start server funksiyasi orqali chaqiriladi. API kalit hech qachon brauzerga chiqmaydi.

**Backend / infratuzilma**
- Alohida backend yo'q — [Cloudflare Workers](https://workers.cloudflare.com) ustida ishlaydigan TanStack Start serveri o'zi backend vazifasini bajaradi ([Nitro](https://nitro.build) orqali)
- [pnpm](https://pnpm.io) — paket menejeri

## Rivojlantirish

```sh
pnpm install
pnpm dev
node node_modules/typescript/bin/tsc --noEmit
pnpm build
```

Node.js kerak — [nvm orqali o'rnatish](https://github.com/nvm-sh/nvm#installing-and-updating).

### AI ustoz uchun kalit sozlash

**Lokal ishlash uchun** (`pnpm dev` haqiqiy process environment o'zgaruvchilarini o'qiydi):

```sh
# macOS/Linux
export ANTHROPIC_API_KEY=sk-ant-...
pnpm dev
```

```powershell
# Windows PowerShell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
pnpm dev
```

(`.dev.vars.example` o'zgaruvchi nomini ko'rsatadi; `wrangler dev` ishlatsangiz uni `.dev.vars`ga nusxalang — bu fayl har doim `.gitignore`da.)

**Production uchun** (bu ilova Cloudflare Worker sifatida quriladi — `pnpm build` `.output/server/wrangler.json` yaratadi):

```sh
npx wrangler login
npx wrangler secret put ANTHROPIC_API_KEY
```

Yoki Cloudflare dashboard'da worker'ning **Settings → Variables and Secrets** bo'limida qo'ying. Kalit qo'yilmagan bo'lsa ham sayt ishlayveradi — AI ustoz avtomatik lokal qoidaviy javobga tushadi.

## Vercel'ga deploy qilish

Ilova [Nitro](https://nitro.build) orqali quriladi, shuning uchun bir xil kod bazasi bir nechta platformaga (shu jumladan Vercel'ga) mos keladi — kod o'zgartirish shart emas, faqat build vaqtidagi bitta muhit o'zgaruvchisi kifoya.

1. [vercel.com](https://vercel.com) da **Add New → Project** orqali shu GitHub repozitoriyasini import qiling.
2. Loyiha **Environment Variables** bo'limida ikkitasini qo'shing:
   - `NITRO_PRESET` = `vercel` (build'ni Cloudflare o'rniga Vercel uchun moslashtiradi)
   - `ANTHROPIC_API_KEY` = sizning Anthropic API kalitingiz (AI ustoz uchun; qo'ymasangiz ham sayt lokal qoidaviy javob bilan ishlayveradi)
3. **Deploy** tugmasini bosing. `vercel.json` va `pnpm build` qolganini o'zi bajaradi (`.vercel/output` — Vercel'ning "Build Output API" formatida).

Terminal orqali deploy qilish uchun:

```sh
npm i -g vercel
vercel login
vercel --prod
```

Global `pnpm lint` hozircha repo bo'ylab meros bo'lib qolgan Prettier formatlash xatolari sababli muvaffaqiyatsiz tugaydi.
