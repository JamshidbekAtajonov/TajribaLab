import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { SiteShell } from "@/components/site-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/oqituvchi")({
  head: () => ({ meta: [{ title: "O‘qituvchi demo — TajribaLab" }, { name: "description", content: "O‘qituvchi paneli namunasi — hali real ma’lumot bilan ishlamaydi." }, { property: "og:title", content: "O‘qituvchi demo — TajribaLab" }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Teacher,
});

const notReady = () => toast("Bu funksiya hali ishlab chiqilmoqda.", { description: "Sinf va o‘quvchi boshqaruvi uchun server (Supabase auth + jadval) hali ulanmagan." });

function Teacher() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <p className="eyebrow">O‘qituvchi demo</p>
        <h1 className="page-title">O‘qituvchi paneli — namuna</h1>
        <p className="page-lead">
          Bu sahifa hali faqat ko‘rinish namunasi. Sinf yaratish, o‘quvchilarni taklif qilish va ularning natijalarini
          kuzatish uchun hisob tizimi va ma’lumotlar bazasi hali ulanmagan — quyidagi tugmalar real amal bajarmaydi.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Sinf yaratish</h2>
            <p className="mt-2 text-sm text-muted-foreground">O‘quvchilarni QR-kod orqali sinfga taklif qiling.</p>
            <Button className="mt-4" variant="secondary" onClick={notReady}>Sinf yaratish</Button>
          </div>
          <div className="border border-border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Natijalarni kuzatish</h2>
            <p className="mt-2 text-sm text-muted-foreground">Har bir o‘quvchining tajriba natijalarini jamlab ko‘ring.</p>
            <Button className="mt-4" variant="secondary" onClick={notReady}>Hisobotni ochish</Button>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
          Bu qism qachon tayyor bo‘ladi? O‘qituvchi/sinf tizimi uchun autentifikatsiya va ma’lumotlar bazasi kerak — bu alohida bosqichda quriladi.
        </div>
      </main>
    </SiteShell>
  );
}
