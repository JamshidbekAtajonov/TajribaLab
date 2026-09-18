import { supabase } from './supabase-client';
import { buildExperimentContext, type LabState } from './sandbox';
import type { AIProvider, AssistantReply } from './sandbox-ai';

// Calls the `ai-teacher` Supabase Edge Function, which holds the Anthropic API key server-side.
export const remoteAIProvider: AIProvider = {
  async sendMessage(question, state: LabState): Promise<AssistantReply> {
    if (!supabase) throw new Error('Supabase is not connected — add the Supabase integration in Lovable first.');

    const context = buildExperimentContext(state);
    const { data, error } = await supabase.functions.invoke<AssistantReply>('ai-teacher', {
      body: { question, context },
    });

    if (error) throw error;
    if (!data || !data.text) throw new Error('Empty response from ai-teacher function');
    return data;
  },
};
