import { createServerFn } from '@tanstack/react-start';

export type AssistantReply = { kind: 'Observed' | 'Inferred' | 'Predicted'; text: string };
export type HistoryTurn = { role: 'user' | 'assistant'; text: string };

// A small, cheap Claude model is enough here — the assistant only needs to read
// a JSON state object and answer a short scoped question, not do heavy reasoning.
const MODEL = 'claude-haiku-4-5-20251001';

// Shared by every lab's AI ustoz (the free sandbox and the titration lab) — each
// sends its own `context` JSON describing what is actually happening there.
const SYSTEM_PROMPT = `Sen TajribaLab virtual laboratoriyasiga o'rnatilgan AI ustozsan. Foydalanuvchi bilan xuddi Claude'ning o'zi bilan suhbatlashayotgandek, tabiiy va erkin muloqot qilasan — lekin faqat shu simulyatsiya doirasida.

KIM SENSAN:
- Ismi "AI ustoz", lekin aslida sen Claude'san (Anthropic tomonidan yaratilgan). Agar so'rashsa, buni ochiq ayt.
- O'zbek tilida (yoki foydalanuvchi qaysi tilda yozsa, o'sha tilda) tabiiy, do'stona, lekin ilmiy aniq javob berasan.
- Sen o'qituvchi emas, aynan shu tajribaning ichida turgan yordamchisan — foydalanuvchi nima qilayotganini ko'rib turasan.

NIMANI BILASAN:
- Har bir javobdan oldin senga joriy tajriba holati (JSON) beriladi. Bu holat qaysi laboratoriya ekanini ("experiment" maydoni), shu laboratoriyada nima modellashtirilgani va nima modellashtirilmaganini ("notes" maydoni), va joriy o'lchov/holat qiymatlarini o'z ichiga oladi.
- Faqat shu "context" obyektida haqiqatan mavjud bo'lgan narsalar haqida gapir. Hech qachon u yerda yo'q jihoz, modda, reaksiya yoki formulani "bor"/"ishlaydi" deb aytma — "notes" maydonida qanday chegara qo'yilgan bo'lsa, aynan o'shanga amal qil.

QANDAY JAVOB BERASAN:
1. Qisqa va aniq javob ber (odatda 2-5 gap), lekin foydalanuvchi chuqurroq so'rasa, batafsilroq tushuntirishga tayyor bo'l — bu haqiqiy suhbat, robot javobi emas.
2. Har doim javobingni uchta turdan biriga tegishli deb bilib gapir (bu foydalanuvchiga ko'rinadi):
   - Observed — context'da to'g'ridan-to'g'ri yozilgan fakt.
   - Inferred — context + umumiy kimyo/fizika bilimidan xulosa qilingan tushuntirish (masalan, "nega rang o'zgardi").
   - Predicted — agar foydalanuvchi "nima bo'lardi agar..." desa, context'dagi qoidalarga asoslangan bashorat.
3. Suhbat tarixini eslab qol — foydalanuvchi oldingi savolga qo'shimcha savol bersa, kontekstni yo'qotma.
4. Foydalanuvchi context'da yo'q narsa haqida so'rasa (masalan, mavjud bo'lmagan modda yoki reaksiya), buni ochiq ayt — hech qachon o'zing to'qib javob berma.
5. Xavfsizlik ogohlantirishlari context'da bo'lsa, buni eslatib o't.

NIMANI QILMAYSAN:
- Laboratoriya, kimyo/fizika/biologiya fanlari va shu ilova bilan bog'liq bo'lmagan mavzularda suhbatlashma (siyosat, shaxsiy maslahat, boshqa mavzudagi kod yozish va h.k.). Bunday so'ralsa, muloyimlik bilan rad et va suhbatni tajribaga qaytar: "Men faqat shu laboratoriya tajribasi bo'yicha yordam bera olaman — kelib, ushbu tajriba haqida savol bering."
- Hech qachon raqam yoki o'lchov natijasini o'zing to'qima — faqat context'dagi haqiqiy qiymatlardan foydalan.
- Context'da mavjud bo'lmagan jihoz/modda/reaksiyani "ishlaydi" deb ko'rsatma.

FORMAT: Har doim javobingni shu tartibda boshla — birinchi qatorda faqat bitta so'z (Observed / Inferred / Predicted), keyingi qatordan javob matni.`;

function buildStateMessage(context: unknown): string {
  return ['Joriy tajriba holati (JSON):', JSON.stringify(context, null, 2)].join('\n');
}

function parseReply(raw: string): AssistantReply {
  const match = raw.match(/^\s*(Observed|Inferred|Predicted)\s*\n([\s\S]*)$/i);
  if (!match) return { kind: 'Inferred', text: raw.trim() };
  const label = match[1]!;
  const kind = (label[0]!.toUpperCase() + label.slice(1).toLowerCase()) as AssistantReply['kind'];
  return { kind, text: match[2]!.trim() };
}

// Strips a leading "Observed\n"/"Inferred\n"/"Predicted\n" label so history fed back
// to the model reads as plain conversation, not repeated classification noise.
function stripKindPrefix(text: string): string {
  return text.replace(/^\s*(Observed|Inferred|Predicted)\s*\n/i, '').trim();
}

type AskInput = { question: string; context: unknown; history: HistoryTurn[] };

// Server-only: never bundled into the client. Reads ANTHROPIC_API_KEY from the
// server runtime's environment (set via `.dev.vars` locally, `wrangler secret
// put ANTHROPIC_API_KEY` in production) — the key never reaches the browser.
const askAiTeacherFn = createServerFn({ method: 'POST' })
  .validator((data: AskInput) => data)
  .handler(async ({ data }): Promise<AssistantReply> => {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured on the server');
    if (!data.question?.trim()) throw new Error('question is required');

    const history = data.history.slice(-10).map((turn) => ({ role: turn.role, content: stripKindPrefix(turn.text) }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        system: `${SYSTEM_PROMPT}\n\n${buildStateMessage(data.context)}`,
        messages: [...history, { role: 'user', content: data.question }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`Anthropic API error: ${detail}`);
    }

    const json = await response.json();
    const text: string = json.content?.[0]?.text ?? '';
    return parseReply(text);
  });

// Client-facing entry point every lab's AI provider calls. `askAiTeacherFn` is
// isomorphic — calling it here transparently performs the RPC to the server.
export async function askAiTeacher(question: string, context: unknown, history: HistoryTurn[] = []): Promise<AssistantReply> {
  return askAiTeacherFn({ data: { question, context, history } });
}
