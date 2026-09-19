import { Clock, FlaskConical, Microscope, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Experiment } from "@/lib/experiments";

const icons = { Kimyo: FlaskConical, Fizika: Zap, Biologiya: Microscope };

export function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const Icon = icons[experiment.subject];
  return (
    <article className="group flex min-h-72 flex-col border border-border bg-card p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <span className={`subject-icon subject-${experiment.subject.toLowerCase()}`}><Icon size={24} /></span>
        <span className={experiment.ready ? "status-ready" : "status-soon"}>{experiment.ready ? "Ishlaydi" : "Tez kunda"}</span>
      </div>
      <div className="mt-5 flex-1">
        <p className="text-xs font-bold uppercase text-muted-foreground">{experiment.subject} · {experiment.topic}</p>
        <h2 className="mt-2 font-display text-xl font-bold">{experiment.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{experiment.description}</p>
      </div>
      <div className="mt-5 flex items-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock size={15} />{experiment.duration}</span><span>{experiment.level}</span><span>{experiment.modes.join(" / ")}</span>
      </div>
      {experiment.ready && experiment.id === "kislota-ishqor-titrlash" && <div className="mt-4 grid grid-cols-2 gap-2"><Link to="/tajribalar/$id" params={{ id: experiment.id }} className="btn-secondary">Batafsil</Link><Link to="/lab/$id" params={{ id: experiment.id }} className="btn-primary">Boshlash</Link></div>}
      {experiment.ready && experiment.id === "elektr-zanjiri" && <div className="mt-4"><Link to="/fizika-zanjiri" className="btn-primary w-full">Boshlash</Link></div>}
      {experiment.ready && experiment.id === "mikroskop-kuzatuvi" && <div className="mt-4"><Link to="/mikroskop" className="btn-primary w-full">Boshlash</Link></div>}
    </article>
  );
}