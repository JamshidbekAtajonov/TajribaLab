// Supabase Edge Function (Deno runtime).
// Proxies chat questions to the Anthropic API so the API key never reaches the browser.
// Deploy: supabase functions deploy ai-teacher
// Secret required: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

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

type RequestBody = { question: string; context: ExperimentContext };

// Matches AssistantReply in src/lib/sandbox-ai.ts
type AssistantReply = { kind: 'Observed' | 'Inferred' | 'Predicted'; text: string };

const SYSTEM_PROMPT = `You are the scientific assistant embedded in TajribaLab, a virtual chemistry sandbox for students.
You only know what the simulation state tells you — never invent equipment, substances, or reactions that are not in the provided context.
Answer briefly (2-4 sentences), in the same language the student asked in (Uzbek or English).
Classify your answer as one of exactly three kinds and start your reply with that single word on its own, followed by a newline, then the answer:
- Observed: a direct fact already recorded in the simulation state or event log.
- Inferred: something derived from the state plus general chemistry knowledge (e.g. explaining why something behaves as observed).
- Predicted: what would happen next given a hypothetical action, based on the reaction rules described in the context.
Only the iron + bromine reaction (2 Fe + 3 Br2 -> 2 FeBr3, requires >=80C) is modeled in this sandbox. Do not claim other reactions occur.`;

function buildUserMessage(question: string, context: ExperimentContext): string {
  return [
    `Student question: ${question}`,
    '',
    'Current simulation state (JSON):',
    JSON.stringify(context, null, 2),
  ].join('\n');
}

function parseReply(raw: string): AssistantReply {
  const match = raw.match(/^\s*(Observed|Inferred|Predicted)\s*\n([\s\S]*)$/i);
  if (!match) return { kind: 'Inferred', text: raw.trim() };
  const kind = (match[1][0].toUpperCase() + match[1].slice(1).toLowerCase()) as AssistantReply['kind'];
  return { kind, text: match[2].trim() };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS_HEADERS });

  try {
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not configured on the server' }), {
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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-5',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: buildUserMessage(body.question, body.context) }],
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return new Response(JSON.stringify({ error: `Anthropic API error: ${detail}` }), {
        status: 502,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const text: string = data.content?.[0]?.text ?? '';
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
