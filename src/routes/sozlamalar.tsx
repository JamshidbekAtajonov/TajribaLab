import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { getGraphicsQuality, setGraphicsQuality, type GraphicsQuality } from "@/lib/preferences";

export const Route = createFileRoute("/sozlamalar")({
  head: () => ({ meta: [{ title: "Sozlamalar — TajribaLab" }, { name: "description", content: "Grafika sifati va boshqa sozlamalar." }, { property: "og:title", content: "Sozlamalar — TajribaLab" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Settings,
});

function Settings() {
  const [quality, setQuality] = useState<GraphicsQuality>("high");
  useEffect(() => setQuality(getGraphicsQuality()), []);
  const choose = (value: GraphicsQuality) => { setGraphicsQuality(value); setQuality(value); };
  return (
    <SiteShell>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="eyebrow">Sozlamalar</p>
        <h1 className="page-title">Ilova sozlamalari</h1>
        <p className="page-lead">Bu sozlamalar shu qurilmada saqlanadi va keyingi tashrifda ham eslab qolinadi.</p>

        <section className="mt-8 border-t border-border pt-6">
          <h2 className="font-display text-lg font-bold">Grafika sifati</h2>
          <p className="mt-1 text-sm text-muted-foreground">Titrlash laboratoriyasini yangi sessiya boshlaganda qaysi rejimda ochish kerakligini tanlang. Joriy davom etayotgan tajriba o‘zining saqlangan rejimida qoladi.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant={quality === "high" ? "primary" : "secondary"} onClick={() => choose("high")}>Yuqori (to‘liq 3D)</Button>
            <Button variant={quality === "light" ? "primary" : "secondary"} onClick={() => choose("light")}>Yengil (2D)</Button>
          </div>
        </section>

        <section className="mt-8 border-t border-border pt-6">
          <h2 className="font-display text-lg font-bold">Ovoz sozlamalari</h2>
          <p className="mt-1 text-sm text-muted-foreground">Ovozli izoh funksiyasi hali ishlab chiqilmagan.</p>
          <div className="mt-4"><Button variant="secondary" disabled>Ovozli izoh · Tez kunda</Button></div>
        </section>
      </main>
    </SiteShell>
  );
}
