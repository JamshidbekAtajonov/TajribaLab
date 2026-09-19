import { buildExperimentContext, type LabEvent, type LabState } from './sandbox';
export type AssistantReply = { kind: 'Observed' | 'Inferred' | 'Predicted'; text: string };
export type HistoryTurn = { role: 'user' | 'assistant'; text: string };
export interface AIProvider { sendMessage(question: string, state: LabState, history?: HistoryTurn[]): Promise<AssistantReply> }
export const localAIProvider: AIProvider = { async sendMessage(question, state) {
  const context = buildExperimentContext(state); const q = question.toLowerCase(); const latest = context.recentEvents.at(-1);
  if (/ichida|tarkib/.test(q)) { const vessels = context.objects.filter(x=>x.contents.length); return {kind:'Observed',text:vessels.length?vessels.map(x=>`${x.name}: ${x.contents.map(c=>`${c.quantity} ${c.unit} ${c.material}`).join(', ')}`).join(' · '):'Hozircha hech bir idishda modda yo‘q.'}; }
  if (/nima.*bo‘ldi|nima.*sodir bo‘ldi|nima.*yuz berdi/.test(q)) return {kind:'Observed',text:context.recentEvents.length?context.recentEvents.slice(-5).map(x=>x.text).join(' → '):'Hali hech qanday tajriba amali qayd etilmagan.'};
  if (/qizdir|isit|harorat/.test(q)) return {kind:'Predicted',text:'Qizdirish shu simulyatsiyada tanlangan idish haroratini oshiradi. Bromni qizdirish xavfsizlik ogohlantirishini keltirib chiqaradi; faqat qizdirishdan hech qanday kimyoviy reaksiya aniqlanmagan.'};
  if (/reaksiya|nega.*(rang|o‘zgar)/.test(q)) return {kind:'Observed',text:context.reactions.length?context.reactions.join(' · '):'Simulyatsiya hali kimyoviy reaksiyani aniqlagani yo‘q. Hozirgacha bo‘lgan o‘zgarishlar — o‘tkazish yoki harorat yangilanishi.'};
  return {kind:'Inferred',text:latest?`Joriy holat shundan iborat: ${latest.text}. Vodorod gaz, brom suyuqlik, temir esa qattiq modda sifatida modellashtirilgan. Manbani idishga o‘tkazib solishtirib ko‘rishingiz mumkin.`:'Avval jihoz va moddalarni stolga qo‘ying, so‘ng manbani tanlab idishga o‘tkazing.'};
} };
export function observation(event: LabEvent): AssistantReply | null { if (!['OBJECT_ADDED','SUBSTANCE_TRANSFERRED','TEMPERATURE_CHANGED','CONTAINER_EMPTIED','REACTION_COMPLETED'].includes(event.type)) return null; return {kind:'Observed',text:event.text+'.'}; }
