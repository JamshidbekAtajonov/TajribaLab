import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Bot, Plus, RotateCcw, Trash2, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { CircuitBoard } from "@/components/circuit-board";
import { CircuitScene3D } from "@/components/circuit-scene-3d";
import { connectTerminals, evaluateCircuit, initialCircuitState, removeWire, terminals, RESISTANCE_RANGE, VOLTAGE_RANGE, type CircuitState, type TerminalId } from "@/lib/circuit";
import { askCircuitAI, getLastCircuitAISource } from "@/lib/circuit-ai";
import type { AssistantReply, HistoryTurn } from "@/lib/ai-teacher-client";

type Message = { id: number; role: "user" | "assistant"; kind?: AssistantReply["kind"]; text: string };
const kindLabels: Record<AssistantReply["kind"], string> = { Observed: "Kuzatilgan", Inferred: "Xulosa", Predicted: "Bashorat" };

export const Route = createFileRoute("/fizika-zanjiri")({
  head: () => ({ meta: [{ title: "Oddiy elektr zanjiri — TajribaLab" }, { name: "description", content: "Om qonuni asosidagi interaktiv elektr zanjiri laboratoriyasi." }, { property: "og:title", content: "Oddiy elektr zanjiri — TajribaLab" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: CircuitLab,
});

function CircuitLab() {
  const [state, setState] = useState<CircuitState>(initialCircuitState);
  const [mode, setMode] = useState<"3D" | "2D">("2D");
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([{ id: 0, role: "assistant", kind: "Inferred", text: "AI ustoz tayyor. Zanjirni ulang va o‘lchov asboblari yoki qonuniyat haqida so‘rang." }]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const evaluation = useMemo(() => evaluateCircuit(state), [state]);

  const onTerminalClick = (t: TerminalId) => {
    setError(null);
    if (!state.selected) { setState((s) => ({ ...s, selected: t })); return; }
    if (state.selected === t) { setState((s) => ({ ...s, selected: null })); return; }
    const result = connectTerminals(state, state.selected, t);
    if (result.error) setError(result.error);
    setState(result.state);
  };
  const onWireClick = (index: number) => setState((s) => removeWire(s, index));
  const reset = () => setState(initialCircuitState);
  const ask = async () => {
    if (!question.trim() || asking) return;
    setAsking(true);
    const asked = question;
    setQuestion("");
    const history: HistoryTurn[] = messages.filter((m) => m.id !== 0).map((m) => ({ role: m.role, text: m.text }));
    setMessages((m) => [...m, { id: Date.now(), role: "user", text: asked }]);
    try {
      const reply = await askCircuitAI(asked, state, evaluation, history);
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", ...reply }]);
    } catch {
      setMessages((m) => [...m, { id: Date.now() + 1, role: "assistant", kind: "Inferred", text: "AI ustoz hozir javob bera olmadi. Iltimos, qayta urinib ko‘ring." }]);
    } finally {
      setAsking(false);
    }
  };
  const recordMeasurement = () => {
    if (evaluation.current === null) return;
    setState((s) => ({ ...s, measurements: [...s.measurements, { voltage: s.voltage, resistance: s.resistance, current: evaluation.current! }] }));
  };

  return (
    <main className="lab-shell">
      <header className="lab-header">
        <Link to="/laboratoriyalar" className="lab-back"><ArrowLeft size={18} /><span>Katalog</span></Link>
        <div className="lab-title"><Zap size={20} /><div><strong>Oddiy elektr zanjiri</strong><small>Om qonuni · Mehmon sessiyasi</small></div></div>
        <div className="lab-top-actions">
          <div className="segmented"><button className={mode === "3D" ? "active" : ""} onClick={() => setMode("3D")}>3D</button><button className={mode === "2D" ? "active" : ""} onClick={() => setMode("2D")}>2D</button></div>
          <Button variant="ghost" size="icon" aria-label="Zanjirni tozalash" onClick={reset}><RotateCcw size={18} /></Button>
        </div>
      </header>
      <div className="lab-grid">
        <aside className="lab-sidebar tools-panel">
          <div className="panel-heading"><span><Zap size={18} />Sozlamalar</span></div>
          <div className="circuit-controls">
            <label>Manba kuchlanishi: <strong>{state.voltage} V</strong>
              <input type="range" min={VOLTAGE_RANGE.min} max={VOLTAGE_RANGE.max} value={state.voltage} onChange={(e) => setState((s) => ({ ...s, voltage: Number(e.target.value) }))} />
            </label>
            <label>Rezistor qarshiligi: <strong>{state.resistance} Ω</strong>
              <input type="range" min={RESISTANCE_RANGE.min} max={RESISTANCE_RANGE.max} step={1} value={state.resistance} onChange={(e) => setState((s) => ({ ...s, resistance: Number(e.target.value) }))} />
            </label>
          </div>
          <div className="panel-heading" style={{ marginTop: 12 }}><span>Ulanishlar</span></div>
          <p className="circuit-hint">Ikkita terminalni ketma-ket bosib sim torting. Simni o‘chirish uchun unga bosing.</p>
          {error && <p className="circuit-error">{error}</p>}
          <div className="circuit-wire-list">
            {state.wires.length === 0 && <p className="circuit-hint">Hali sim ulanmagan.</p>}
            {state.wires.map((w, i) => (
              <div key={i} className="circuit-wire-row"><span>{terminals[w[0]].label} → {terminals[w[1]].label}</span><button onClick={() => onWireClick(i)} aria-label="Simni o‘chirish"><Trash2 size={14} /></button></div>
            ))}
          </div>
        </aside>

        <section className="scene-panel">
          {mode === "2D" ? (
            <CircuitBoard state={state} onTerminalClick={onTerminalClick} onWireClick={onWireClick} />
          ) : (
            <CircuitScene3D state={state} closed={evaluation.status === "closed"} current={evaluation.current} />
          )}
        </section>

        <aside className="lab-sidebar teacher-panel">
          <div className="panel-heading"><span>O‘lchov asboblari</span></div>
          <div className="circuit-readout">
            <div><small>AMPERMETR</small><strong>{evaluation.current !== null ? `${(evaluation.current * 1000).toFixed(1)} mA` : "—"}</strong></div>
            <div><small>VOLTMETR</small><strong>{evaluation.voltmeterReading !== null ? `${evaluation.voltmeterReading.toFixed(1)} V` : "—"}</strong></div>
          </div>
          <p className={`circuit-status circuit-status-${evaluation.status}`}>{evaluation.message}</p>
          <Button variant="secondary" style={{ margin: "0 1rem", width: "calc(100% - 2rem)" }} disabled={evaluation.current === null} onClick={recordMeasurement}><Plus size={16} />O‘lchovni yozib qo‘yish</Button>

          <div className="panel-heading" style={{ marginTop: 16 }}><span>I–U grafigi</span></div>
          {state.measurements.length < 3 ? (
            <p className="circuit-hint">Grafik chizish uchun kamida 3 ta o‘lchov yozib qo‘ying (kuchlanish yoki qarshilikni o‘zgartirib, har safar "O‘lchovni yozib qo‘yish"ni bosing).</p>
          ) : (
            <div style={{ width: "100%", height: 200 }}>
              <ResponsiveContainer>
                <LineChart data={state.measurements.map((m, i) => ({ i: i + 1, U: m.voltage, I: Number((m.current * 1000).toFixed(2)) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="U" label={{ value: "U (V)", position: "insideBottom", offset: -2 }} />
                  <YAxis label={{ value: "I (mA)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="I" stroke="#1a6670" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="panel-heading" style={{ marginTop: 16 }}><span><Bot size={16} />AI ustoz</span></div>
          <div className="teacher-status">{getLastCircuitAISource() === "remote" ? "AI ustoz · haqiqiy javob" : "AI ustoz · lokal qoidaviy javob"}</div>
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
            <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Zanjir haqida so‘rang…" disabled={asking} />
            <Button type="submit" size="icon" disabled={asking}>↗</Button>
          </form>
          <div className="teacher-prompts">
            <Button variant="secondary" onClick={() => setQuestion("Ampermetr nima uchun shunday ko‘rsatmoqda?")}>Ampermetr nega shunday?</Button>
            <Button variant="secondary" onClick={() => setQuestion("Voltmetr to‘g‘ri ulanganmi?")}>Voltmetr to‘g‘rimi?</Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
