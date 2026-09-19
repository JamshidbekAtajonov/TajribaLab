import { buildExperimentContext, type LabState } from './sandbox';
import { askAiTeacher } from './ai-teacher-client';
import type { AIProvider, AssistantReply, HistoryTurn } from './sandbox-ai';

// Calls the shared `ai-teacher` Supabase Edge Function with the sandbox's own
// context shape (buildExperimentContext).
export const remoteAIProvider: AIProvider = {
  async sendMessage(question, state: LabState, history: HistoryTurn[] = []): Promise<AssistantReply> {
    return askAiTeacher(question, buildExperimentContext(state), history);
  },
};
