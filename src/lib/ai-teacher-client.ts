import { supabase } from './supabase-client';

export type AssistantReply = { kind: 'Observed' | 'Inferred' | 'Predicted'; text: string };
export type HistoryTurn = { role: 'user' | 'assistant'; text: string };

// Shared low-level call to the `ai-teacher` Supabase Edge Function. `context` is
// whatever JSON best describes the calling experiment's current state — the
// sandbox and the titration lab each build their own shape.
export async function askAiTeacher(question: string, context: unknown, history: HistoryTurn[] = []): Promise<AssistantReply> {
  if (!supabase) throw new Error('Supabase is not connected — add the Supabase integration in Lovable first.');

  const { data, error } = await supabase.functions.invoke<AssistantReply>('ai-teacher', {
    body: { question, context, history },
  });

  if (error) throw error;
  if (!data || !data.text) throw new Error('Empty response from ai-teacher function');
  return data;
}
