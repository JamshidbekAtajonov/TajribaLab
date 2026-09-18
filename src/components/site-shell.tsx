import { FlaskConical, HelpCircle, Library, Menu, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function SiteShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground"><FlaskConical size={20} /></span>
            TajribaLab
          </Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Asosiy menyu">
            <Link to="/laboratoriyalar" className="nav-link"><Library size={17} /> Laboratoriyalar</Link>
            <Link to="/natijalar" className="nav-link">Natijalarim</Link>
            <Link to="/yordam" className="nav-link"><HelpCircle size={17} /> Yordam</Link>
          </nav>
          <Button variant="ghost" className="px-3 md:hidden" aria-label="Menyuni ochish" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </div>
        {open && <nav className="grid gap-1 border-t border-border p-3 md:hidden"><Link to="/laboratoriyalar" className="nav-link">Laboratoriyalar</Link><Link to="/natijalar" className="nav-link">Natijalarim</Link><Link to="/yordam" className="nav-link">Yordam</Link></nav>}
      </header>
      {children}
    </div>
  );
}