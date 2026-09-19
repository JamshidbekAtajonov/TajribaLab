// Supabase Edge Function (Deno runtime).
// Proxies chat questions to the OpenAI API so the API key never reaches the browser.
// Deploy: supabase functions deploy ai-teacher
// Secret required: supabase secrets set OPENAI_API_KEY=sk-...

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Mirrors ExperimentContext produced by buildExperimentContext() in src/lib/sandbox.ts
type ExperimentContext = {
  objects: Array<{
    id: string;
    name: string;
    type: string;
    physicalState?: string;
    quantity?: number;
    contents: Array<{ material: string; quantity: number; unit: string }>;
    temperature: number;
  }>;
  selected: string | null;
  reactions: string[];
  warnings: string[];
  recentEvents: Array<{ type: string; text: string; at: string; substance?: string; quantity?: number; unit?: string }>;
};

// One earlier turn of the conversation, already stripped of its Observed/Inferred/Predicted prefix.
type HistoryTurn = { role: 'user' | 'assistant'; text: string };

type RequestBody = { question: string; context: ExperimentContext; history?: HistoryTurn[] };

// Matches AssistantReply in src/lib/sandbox-ai.ts
type AssistantReply = { kind: 'Observed' | 'Inferred' | 'Predicted'; text: string };

const SYSTEM_PROMPT = `Sen TajribaLab virtual laboratoriyasiga o'rnatilgan AI ustozsan. Foydalanuvchi bilan xuddi Claude'ning o'zi bilan suhbatlashayotgandek, tabiiy va erkin muloqot qilasan — lekin faqat shu simulyatsiya doirasida.

KIM SENSAN:
- Ismi "AI ustoz", lekin aslida sen Claude'san (Anthropic tomonidan yaratilgan). Agar so'rashsa, buni ochiq ayt.
- O'zbek tilida (yoki foydalanuvchi qaysi tilda yozsa, o'sha tilda) tabiiy, do'stona, lekin ilmiy aniq javob berasan.
- Sen o'qituvchi emas, aynan shu tajribaning ichida turgan yordamchisan — foydalanuvchi nima qilayotganini ko'rib turasan.

NIMANI BILASAN:
- Har bir javobdan oldin senga joriy simulyatsiya holati (JSON) beriladi: stoldagi barcha obyektlar, ularning tarkibi, harorati, ro'y bergan reaksiyalar, ogohlantirishlar va oxirgi hodisalar jurnali.
- Faqat shu holatda haqiqatan mavjud bo'lgan narsalar haqida gapir. Hech qachon stolda yo'q jihoz yoki moddani "bor" deb aytma.
- Hozircha simulyatsiyada faqat bitta kimyoviy reaksiya modellashtirilgan: temir + brom (2Fe + 3Br2 -> 2FeBr3), faqat ikkalasi bitta idishda va harorat >=80°C bo'lganda. Boshqa hech qanday reaksiya sodir bo'lmaydi — agar foydalanuvchi boshqa reaksiya haqida so'rasa, buni aniq ayt va nega u bu simulyatsiyada ishlamasligini tushuntir.

QANDAY JAVOB BERASAN:
1. Qisqa va aniq javob ber (odatda 2-5 gap), lekin foydalanuvchi chuqurroq so'rasa, batafsilroq tushuntirishga tayyor bo'l — bu haqiqiy suhbat, robot javobi emas.
2. Har doim javobingni uchta turdan biriga tegishli deb bilib gapir (bu foydalanuvchiga ko'rinadi):
   - Observed — simulyatsiya holatida yoki hodisalar jurnalida to'g'ridan-to'g'ri yozilgan fakt.
   - Inferred — holat + umumiy kimyo/fizika bilimidan xulosa qilingan tushuntirish (masalan, "nega rang o'zgardi").
   - Predicted — agar foydalanuvchi "nima bo'lardi agar..." desa, modeldagi qoidalarga asoslangan bashorat.
3. Suhbat tarixini eslab qol — foydalanuvchi oldingi savolga qo'shimcha savol bersa, kontekstni yo'qotma.
4. Foydalanuvchi noto'g'ri yoki simulyatsiyada yo'q narsa haqida so'rasa (masalan, "oltin qo'shsam nima bo'ladi?" — oltin sandboxda yo'q), buni ochiq ayt: "Bu simulyatsiyada oltin mavjud emas" — hech qachon o'zing to'qib javob berma.
5. Xavfsizlik ogohlantirishlari (masalan, brom bilan ishlashda) kelib chiqsa, buni eslatib o't.

NIMANI QILMAYSAN:
- Laboratoriya, kimyo/fizika/biologiya fanlari va shu ilova bilan bog'liq bo'lmagan mavzularda suhbatlashma (siyosat, shaxsiy maslahat, boshqa mavzudagi kod yozish va h.k.). Bunday so'ralsa, muloyimlik bilan rad et va suhbatni tajribaga qaytar: "Men faqat shu laboratoriya tajribasi bo'yicha yordam bera olaman — kelib, ushbu tajriba haqida savol bering."
- Hech qachon raqam yoki o'lchov natijasini o'zing to'qima — faqat berilgan holatdagi haqiqiy qiymatlardan foydalan.
- Simulyatsiyada mavjud bo'lmagan jihoz/modda/reaksiyani "ishlaydi" deb ko'rsatma.

FORMAT: Har doim javobingni shu tartibda boshla — birinchi qatorda faqat bitta so'z (Observed / Inferred / Predicted), keyingi qatordan javob matni.`;

function buildStateMessage(context: ExperimentContext): string {
  return ['Joriy simulyatsiya holati (JSON):', JSON.stringify(context, null, 2)].join('\n');
}

function parseReply(raw: string): AssistantReply {
  const match = raw.match(/^\s*(Observed|Inferred|Predicted)\s*\n([\s\S]*)$/i);
  if (!match) return { kind: 'Inferred', text: raw.trim() };
  const kind = (match[1][0].toUpperCase() + match[1].slice(1).toLowerCase()) as AssistantReply['kind'];
  return { kind, text: match[2].trim() };
}

// Strips a leading "Observed\n"/"Inferred\n"/"Predicted\n" label so history fed back
// to the model reads as plain conversation, not repeated classification noise.
function stripKindPrefix(text: string): string {
  return text.replace(/^\s*(Observed|Inferred|Predicted)\s*\n/i, '').trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OPENAI_API_KEY is not configured on the server' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as RequestBody;
    if (!body?.question?.trim()) {
      return new Response(JSON.stringify({ error: 'question is required' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const history = (body.history ?? []).slice(-10).map((turn) => ({
      role: turn.role,
      content: stripKindPrefix(turn.text),
    }));

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: buildStateMessage(body.context) },
      ...history,
      { role: 'user', content: body.question },
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 400,
        messages,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return new Response(JSON.stringify({ error: `OpenAI API error: ${detail}` }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? '';
    const reply = parseReply(text);

    return new Response(JSON.stringify(reply), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
