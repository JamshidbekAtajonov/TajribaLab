import { buildExperimentContext, type LabEvent, type LabState } from './sandbox';
export type AssistantReply = { kind: 'Observed' | 'Inferred' | 'Predicted'; text: string };
export type HistoryTurn = { role: 'user' | 'assistant'; text: string };
export interface AIProvider { sendMessage(question: string, state: LabState, history?: HistoryTurn[]): Promise<AssistantReply> }
export const localAIProvider: AIProvider = { async sendMessage(question, state) {
  const context = buildExperimentContext(state); const q = question.toLowerCase(); const latest = context.recentEvents.at(-1);
  if (/what.*(inside|contain)|ichida/.test(q)) { const vessels = context.objects.filter(x=>x.contents.length); return {kind:'Observed',text:vessels.length?vessels.map(x=>`${x.name}: ${x.contents.map(c=>`${c.quantity} ${c.unit} ${c.material}`).join(', ')}`).join(' · '):'No vessel contains a substance yet.'}; }
  if (/what.*(did|happen)|nima.*bo/.test(q)) return {kind:'Observed',text:context.recentEvents.length?context.recentEvents.slice(-5).map(x=>x.text).join(' → '):'No experiment actions have been recorded yet.'};
  if (/heat|temperature|qiz/.test(q)) return {kind:'Predicted',text:'Heating will raise the selected vessel temperature in this simulation. Bromine heating triggers a safety warning; no chemical reaction is defined from heating alone.'};
  if (/reaction|react|why.*(color|change)/.test(q)) return {kind:'Observed',text:context.reactions.length?context.reactions.join(' · '):'The simulation has not detected a chemical reaction. Changes so far are transfers or temperature updates.'};
  return {kind:'Inferred',text:latest?`Current state follows: ${latest.text}. Hydrogen is modeled as a gas, bromine as a liquid, and iron as a solid. You can transfer a source into a vessel to compare them.`:'Place equipment and materials on the bench, then select a source and transfer it into a vessel.'};
} };
export function observation(event: LabEvent): AssistantReply | null { if (!['OBJECT_ADDED','SUBSTANCE_TRANSFERRED','TEMPERATURE_CHANGED','CONTAINER_EMPTIED','REACTION_COMPLETED'].includes(event.type)) return null; return {kind:'Observed',text:event.text+'.'}; }
