import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, Check, Microscope as MicroscopeIcon, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { MicroscopeView } from "@/components/microscope-view";
import { MicroscopeScene3D } from "@/components/microscope-scene-3d";
import { samples, totalMagnification, STRUCTURE_LABELS, type ObjectiveId, type StructureId } from "@/lib/microscope";
import { askMicroscopeAI, getLastMicroscopeAISource } from "@/lib/microscope-ai";
import type { AssistantReply, HistoryTurn } from "@/lib/ai-teacher-client";

type Message = { id: number; role: "user" | "assistant"; kind?: AssistantReply["kind"]; text: string };
const kindLabels: Record<AssistantReply["kind"], string> = { Observed: "Kuzatilgan", Inferred: "Xulosa", Predicted: "Bashorat" };

export const Route = createFileRoute("/mikroskop")({
  head: () => ({ meta: [{ title: "Mikroskop kuzatuvi — TajribaLab" }, { name: "description", content: "Preparatlarni obyektiv, fokus va yorug'lik bilan kuzatish laboratoriyasi." }, { property: "og:title", content: "Mikroskop kuzatuvi — TajribaLab" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: MicroscopeLab,
});

const ALL_STRUCTURES = Object.keys(STRUCTURE_LABELS) as StructureId[];

function MicroscopeLab() {
  const [mode, setMode] = useState<"3D" | "2D">("2D");
  const [sampleId, setSampleId] = useState(samples[0]!.id);
  const [objective, setObjective] = useState<ObjectiveId>("10x");
  const [focus, setFocus] = useState(20);
  const [light, setLight] = useState(70);
  const [picked, setPicked] = useState<StructureId[]>([]);
  const [checked, setChecked] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "assistant", kind: "Inferred", text: "AI ustoz tayyor. Preparat, kattalashtirish yoki fokus haqida so‘rang." }]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const focusTarget = 55;

  const sample = samples.find((s) => s.id === sampleId)!;
  const inFocus = Math.abs(focus - focusTarget) < 8;
  const correctSet = useMemo(() => new Set(sample.visibleStructures), [sample]);
  const score = checked ? { correct: picked.filter((p) => correctSet.has(p)).length, missed: sample.visibleStructures.filter((s) => !picked.includes(s)).length, wrong: picked.filter((p) => !correctSet.has(p)).length } : null;

  const toggleStructure = (s: StructureId) => { setChecked(false); setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s])); };
  const reset = () => { setFocus(20); setLight(70); setPicked([]); setChecked(false); };
  const ask = async () => {
    if (!question.trim() || asking) return;
    setAsking(true);
    const asked = question;
    setQuestion("");
    const history: HistoryTurn[] = messages.filter((m) => m.id !== 0).map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: asked }]);
    try {
      const reply = await askMicroscopeAI(asked, sampleId, objective, focus, focusTarget, light, history);
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", ...reply }]);
    } catch {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", kind: "Inferred", text: "AI ustoz hozir javob bera olmadi. Iltimos, qayta urinib ko‘ring." }]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <Link to="/laboratoriyalar" className="lab-back"><ArrowLeft size={18} /><span>Katalog</span></Link>
        <div className="lab-title"><MicroscopeIcon size={20} /><div><strong>Mikroskop kuzatuvi</strong><small>Hujayra tuzilishi · Mehmon sessiyasi</small></div></div>
        <div className="lab-top-actions">
          <div className="segmented"><button className={mode === "3D" ? "active" : ""} onClick={() => setMode("3D")}>3D</button><button className={mode === "2D" ? "active" : ""} onClick={() => setMode("2D")}>2D</button></div>
          <Button variant="ghost" size="icon" aria-label="Boshqaruvlarni tiklash" onClick={reset}><RotateCcw size={18} /></Button>
        </div>
      </header>
      <div className="lab-grid">
        <aside className="lab-sidebar tools-panel">
          <div className="panel-heading"><span>Preparat</span></div>
          <div className="microscope-controls">
            <div className="microscope-sample-list">
              {samples.map((s) => (
                <button key={s.id} className={`microscope-sample-btn${s.id === sampleId ? " active" : ""}`} onClick={() => { setSampleId(s.id); setChecked(false); setPicked([]); }}>{s.name}</button>
              ))}
            </div>
            <p className="circuit-hint">{sample.description}</p>
            <label>Obyektiv
              <select value={objective} onChange={(e) => setObjective(e.target.value as ObjectiveId)} className="field">
                <option value="10x">10x (oddiy)</option>
                <option value="40x">40x (kuchli)</option>
              </select>
            </label>
            <label>Fokus (dag‘al/nozik): <strong>{focus}</strong>
              <input type="range" min={0} max={100} value={focus} onChange={(e) => setFocus(Number(e.target.value))} />
            </label>
            <label>Yorug‘lik: <strong>{light}%</strong>
              <input type="range" min={10} max={100} value={light} onChange={(e) => setLight(Number(e.target.value))} />
            </label>
          </div>
        </aside>

        <section className="scene-panel">
          {mode === "2D" ? (
            <div className="microscope-2d-wrap"><MicroscopeView sampleId={sampleId} objective={objective} focusValue={focus} focusTarget={focusTarget} light={light} /></div>
          ) : (
            <MicroscopeScene3D objective={objective} />
          )}
        </section>

        <aside className="lab-sidebar teacher-panel">
          <div className="panel-heading"><span>Kuzatuv ma’lumotlari</span></div>
          <div className="circuit-readout">
            <div><small>UMUMIY KATTALASHTIRISH</small><strong>{totalMagnification(objective)}x</strong></div>
            <div><small>FOKUS</small><strong>{inFocus ? "Aniq" : "Xira"}</strong></div>
          </div>
          <p className="circuit-hint" style={{ padding: "0 1rem" }}>Umumiy kattalashtirish = okulyar (10x) × obyektiv ({objective}). {mode === "2D" ? "Tasvir chapdagi fokus va yorug'lik sozlamalariga qarab o'zgaradi." : ""}</p>

          <div className="panel-heading" style={{ marginTop: 12 }}><span>Ko‘rinadigan tuzilmalarni belgilang</span></div>
          <div className="microscope-structure-list">
            {ALL_STRUCTURES.map((s) => (
              <label key={s} className="microscope-structure-item">
                <input type="checkbox" checked={picked.includes(s)} onChange={() => toggleStructure(s)} />
                {STRUCTURE_LABELS[s]}
              </label>
            ))}
          </div>
          <Button variant="secondary" style={{ margin: "0 1rem", width: "calc(100% - 2rem)" }} onClick={() => setChecked(true)} disabled={picked.length === 0}><Check size={16} />Javobni tekshirish</Button>
          {score && (
            <p className={`circuit-status ${score.wrong === 0 && score.missed === 0 ? "circuit-status-closed" : ""}`} style={{ marginTop: "0.75rem" }}>
              To‘g‘ri: {score.correct}/{sample.visibleStructures.length}{score.wrong > 0 && ` · Noto‘g‘ri belgilangan: ${score.wrong}`}{score.missed > 0 && ` · O‘tkazib yuborilgan: ${score.missed}`}
            </p>
          )}

          <div className="panel-heading" style={{ marginTop: 16 }}><span><Bot size={16} />AI ustoz</span></div>
          <div className="teacher-status">{getLastMicroscopeAISource() === "remote" ? "AI ustoz · haqiqiy javob" : "AI ustoz · lokal qoidaviy javob"}</div>
          <div className="messages">
            {messages.slice(-8).map((m) => (
              <div key={m.id} className={`teacher-message${m.role === "user" ? " teacher-message-user" : ""}`}>
                {m.role !== "user" && <Bot size={17} />}
                <div>{m.role === "assistant" && m.kind && <small className="teacher-kind">{kindLabels[m.kind]}</small>}<p>{m.text}</p></div>
              </div>
            ))}
            {asking && <div className="teacher-message"><Bot size={17} /><p>O‘ylanmoqda…</p></div>}
          </div>
          <form className="teacher-ask" onSubmit={(e) => { e.preventDefault(); void ask(); }}>
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Preparat haqida so‘rang…" disabled={asking} />
            <Button type="submit" size="icon" disabled={asking}>↗</Button>
          </form>
          <div className="teacher-prompts">
            <Button variant="secondary" onClick={() => setQuestion("Bu preparatda nima ko‘rinadi?")}>Nima ko‘rinadi?</Button>
            <Button variant="secondary" onClick={() => setQuestion("Umumiy kattalashtirish qanday hisoblanadi?")}>Kattalashtirish qanday?</Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
