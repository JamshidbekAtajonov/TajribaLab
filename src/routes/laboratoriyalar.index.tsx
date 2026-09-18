import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ExperimentCard } from "@/components/experiment-card";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { experiments, type Experiment, type Subject } from "@/lib/experiments";

const subjects = ["Barchasi", "Kimyo", "Fizika", "Biologiya"] as const;
const levels = ["Barchasi", "Boshlang‘ich", "O‘rta", "Murakkab"] as const;
const statuses = ["Barchasi", "Ishlaydi", "Tez kunda"] as const;
type Level = Experiment["level"];

const searchSchema = z.object({
  fan: z.enum(subjects).catch("Barchasi"),
  daraja: z.enum(levels).catch("Barchasi"),
  holat: z.enum(statuses).catch("Barchasi"),
  q: z.string().catch(""),
});

export const Route = createFileRoute("/laboratoriyalar/")({
  head: () => ({ meta: [{ title: "Laboratoriyalar — TajribaLab" }, { name: "description", content: "Kimyo, fizika va biologiya virtual laboratoriyalari katalogi." }, { property: "og:title", content: "Laboratoriyalar — TajribaLab" }, { property: "og:description", content: "Interaktiv fan tajribalarini tanlang va bajaring." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  validateSearch: searchSchema,
  component: Labs,
});

function Labs() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [query, setQuery] = useState(search.q);
  const subject = search.fan;
  const level = search.daraja;
  const status = search.holat;
  const setSubject = (fan: "Barchasi" | Subject) => navigate({ search: (prev) => ({ ...prev, fan }) });
  const setLevel = (daraja: "Barchasi" | Level) => navigate({ search: (prev) => ({ ...prev, daraja }) });
  const setStatus = (holat: (typeof statuses)[number]) => navigate({ search: (prev) => ({ ...prev, holat }) });
  const commitQuery = (q: string) => navigate({ search: (prev) => ({ ...prev, q }) });
  const clearFilters = () => { setQuery(""); navigate({ search: { fan: "Barchasi", daraja: "Barchasi", holat: "Barchasi", q: "" } }); };
  const filtered = useMemo(
    () => experiments.filter(
      (x) =>
        (subject === "Barchasi" || x.subject === subject) &&
        (level === "Barchasi" || x.level === level) &&
        (status === "Barchasi" || (status === "Ishlaydi") === x.ready) &&
        `${x.title} ${x.topic}`.toLowerCase().includes(search.q.toLowerCase()),
    ),
    [subject, level, status, search.q],
  );
  return <SiteShell><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="max-w-2xl"><p className="eyebrow">Tajriba katalogi</p><h1 className="page-title">O‘rganish uchun tajriba tanlang</h1><p className="page-lead">Har bir tajribada jihozlarni o‘zingiz boshqarasiz, natijani o‘lchaysiz va xulosa qilasiz.</p></div><Link to="/sandbox" className="sandbox-catalog-card"><span>YANGI · 3D SANDBOX</span><strong>Erkin kimyo laboratoriyasi</strong><p>Jihozlarni qo‘ying, H₂, Br₂, Fe va suv bilan erkin tajriba qiling. Jarayonni AI yordamchisi bilan muhokama qiling.</p><b>Laboratoriyaga kirish ↗</b></Link><div className="mt-8 flex flex-col gap-3 border-y border-border py-4"><label className="relative flex-1"><Search className="absolute left-3 top-3.5 text-muted-foreground" size={18}/><span className="sr-only">Tajribani qidirish</span><input value={query} onChange={(e)=>{setQuery(e.target.value);commitQuery(e.target.value);}} placeholder="Tajriba yoki mavzu bo‘yicha qidiring" className="field pl-10" /></label><div className="flex flex-wrap items-center gap-2" aria-label="Fan filtri"><SlidersHorizontal className="mr-1 hidden text-muted-foreground sm:block" size={18}/>{subjects.map((item)=><Button key={item} variant={subject===item?"primary":"secondary"} onClick={()=>setSubject(item)}>{item}</Button>)}</div><div className="flex flex-wrap gap-2" aria-label="Daraja filtri">{levels.map((item)=><Button key={item} variant={level===item?"primary":"secondary"} onClick={()=>setLevel(item)}>{item}</Button>)}</div><div className="flex flex-wrap gap-2" aria-label="Holat filtri">{statuses.map((item)=><Button key={item} variant={status===item?"primary":"secondary"} onClick={()=>setStatus(item)}>{item}</Button>)}</div></div><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((item)=><ExperimentCard key={item.id} experiment={item}/>)}</div>{filtered.length===0&&<div className="empty-state"><p>Bu qidiruvga mos tajriba topilmadi.</p><Button onClick={clearFilters}>Filtrlarni tozalash</Button></div>}</main></SiteShell>;
}
