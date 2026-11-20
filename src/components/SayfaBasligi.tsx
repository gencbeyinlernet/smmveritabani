import type { LucideIcon } from "lucide-react";

/** Her sayfanın üstündeki simgeli başlık. */
export default function SayfaBasligi({
  ikon: Ikon,
  renk,
  baslik,
  aciklama,
  children,
}: {
  ikon: LucideIcon;
  renk: string; // ör. "bg-violet-100 text-violet-600"
  baslik: string;
  aciklama?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${renk}`}>
          <Ikon className="h-6 w-6" strokeWidth={2} />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{baslik}</h1>
          {aciklama && <p className="text-sm text-slate-500">{aciklama}</p>}
        </div>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}
