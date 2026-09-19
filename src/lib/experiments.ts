export type Subject = "Kimyo" | "Fizika" | "Biologiya";

export interface Experiment {
  id: string;
  title: string;
  subject: Subject;
  topic: string;
  level: "Boshlang‘ich" | "O‘rta" | "Murakkab";
  duration: string;
  modes: string[];
  ready: boolean;
  description: string;
}

export const experiments: Experiment[] = [
  {
    id: "kislota-ishqor-titrlash",
    title: "Kislota–ishqor titrlash",
    subject: "Kimyo",
    topic: "Neytrallanish va pH",
    level: "O‘rta",
    duration: "20–25 daqiqa",
    modes: ["3D", "2D"],
    ready: true,
    description: "Noma’lum eritma konsentratsiyasini aniq hajm o‘lchovlari orqali toping.",
  },
  {
    id: "elektr-zanjiri",
    title: "Oddiy elektr zanjiri",
    subject: "Fizika",
    topic: "Om qonuni",
    level: "O‘rta",
    duration: "20 daqiqa",
    modes: ["3D", "2D"],
    ready: true,
    description: "Kuchlanish, tok va qarshilik orasidagi bog‘lanishni tekshiring.",
  },
  {
    id: "mikroskop-kuzatuvi",
    title: "Mikroskopda hujayra",
    subject: "Biologiya",
    topic: "Hujayra tuzilishi",
    level: "Boshlang‘ich",
    duration: "15–20 daqiqa",
    modes: ["3D", "2D"],
    ready: true,
    description: "Preparatni joylashtirib, fokus va kattalashtirishni boshqaring.",
  },
];

export const titrationSteps = [
  "Maqsad va model shartlarini o‘qing",
  "Kolbani byuretka ostiga joylashtiring",
  "25 ml HCl eritmasini kolbaga o‘tkazing",
  "Fenolftalein indikatorini qo‘shing",
  "Byuretkani NaOH bilan to‘ldirib, boshlang‘ich o‘qishni yozing",
  "NaOH ni asta tomizing va kolbani aralashtiring",
  "Yakuniy o‘qishni yozing",
  "Natija va xulosani saqlang",
];