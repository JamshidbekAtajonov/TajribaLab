import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { ExperimentCard } from "@/components/experiment-card";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { experiments, type Subject } from "@/lib/experiments";

export const Route = createFileRoute("/laboratoriyalar/")({
  head: () => ({ meta: [{ title: "Laboratoriyalar — TajribaLab" }, { name: "description", content: "Kimyo, fizika va biologiya virtual laboratoriyalari katalogi." }, { property: "og:title", content: "Laboratoriyalar — TajribaLab" }, { property: "og:description", content: "Interaktiv fan tajribalarini tanlang va bajaring." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Labs,
});

function Labs() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<"Barchasi" | Subject>("Barchasi");
  const filtered = useMemo(() => experiments.filter((x) => (subject === "Barchasi" || x.subject === subject) && `${x.title} ${x.topic}`.toLowerCase().includes(query.toLowerCase())), [query, subject]);
  return <SiteShell><main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><div className="max-w-2xl"><p className="eyebrow">Tajriba katalogi</p><h1 className="page-title">O‘rganish uchun tajriba tanlang</h1><p className="page-lead">Har bir tajribada jihozlarni o‘zingiz boshqarasiz, natijani o‘lchaysiz va xulosa qilasiz.</p></div><div className="mt-8 flex flex-col gap-3 border-y border-border py-4 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-3.5 text-muted-foreground" size={18}/><span className="sr-only">Tajribani qidirish</span><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Tajriba yoki mavzu bo‘yicha qidiring" className="field pl-10" /></label><div className="flex flex-wrap gap-2" aria-label="Fan filtri"><SlidersHorizontal className="m-3 hidden text-muted-foreground sm:block" size={18}/>{(["Barchasi","Kimyo","Fizika","Biologiya"] as const).map((item)=><Button key={item} variant={subject===item?"primary":"secondary"} onClick={()=>setSubject(item)}>{item}</Button>)}</div></div><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((item)=><ExperimentCard key={item.id} experiment={item}/>)}</div>{filtered.length===0&&<div className="empty-state"><p>Bu qidiruvga mos tajriba topilmadi.</p><Button onClick={()=>{setQuery("");setSubject("Barchasi")}}>Filtrlarni tozalash</Button></div>}</main></SiteShell>;
}