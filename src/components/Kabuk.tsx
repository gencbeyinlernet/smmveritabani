"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  ClipboardCheck,
  FileStack,
  LayoutDashboard,
  Menu as MenuIkonu,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import logo from "../../public/logo.png";
import CikisDugmesi from "./CikisDugmesi";

type Baglanti = { href: string; ad: string; ikon: LucideIcon; renk: string };

const BAGLANTILAR: Baglanti[] = [
  { href: "/", ad: "Ana Sayfa", ikon: LayoutDashboard, renk: "text-sky-500" },
  { href: "/musteriler", ad: "Müşteriler", ikon: Users, renk: "text-violet-500" },
  { href: "/evrak", ad: "Evrak Takibi", ikon: FileStack, renk: "text-emerald-500" },
  { href: "/beyannameler", ad: "Beyannameler", ikon: ClipboardCheck, renk: "text-amber-500" },
  { href: "/raporlar", ad: "Raporlar", ikon: BarChart3, renk: "text-rose-500" },
];
const YONETICI: Baglanti = { href: "/yonetici", ad: "Yönetici Paneli", ikon: ShieldCheck, renk: "text-vurgu-500" };

/** Giriş, kayıt ve onay sayfaları menüsüz, tam ekran gösterilir. */
const MENUSUZ_SAYFALAR = ["/giris", "/kayit", "/onay-bekliyor"];

type Ben = { kullaniciAdi: string; yonetici: boolean };

export default function Kabuk({ children }: { children: React.ReactNode }) {
  const yol = usePathname();
  const menusuz = MENUSUZ_SAYFALAR.includes(yol);
  const [ben, setBen] = useState<Ben | null>(null);
  const [mobilAcik, setMobilAcik] = useState(false);

  useEffect(() => {
    if (menusuz) return;
    fetch("/api/ben", { cache: "no-store" })
      .then((y) => (y.ok ? y.json() : null))
      .then(setBen)
      .catch(() => setBen(null));
  }, [menusuz]);

  if (menusuz) return <>{children}</>;

  const baglantilar = ben?.yonetici ? [...BAGLANTILAR, YONETICI] : BAGLANTILAR;
  const basHarf = ben?.kullaniciAdi?.[0]?.toLocaleUpperCase("tr") ?? "·";

  const menu = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">Menü</div>
      {baglantilar.map((b) => {
        const aktif = b.href === "/" ? yol === "/" : yol.startsWith(b.href);
        const Ikon = b.ikon;
        return (
          <Link
            key={b.href}
            href={b.href}
            onClick={() => setMobilAcik(false)}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              aktif ? "bg-white text-marka-800 shadow-sm" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span
              className={`grid h-8 w-8 place-items-center rounded-lg transition ${
                aktif ? "bg-marka-50" : "bg-white/10 group-hover:bg-white/15"
              }`}
            >
              <Ikon className={`h-[18px] w-[18px] ${aktif ? b.renk : "text-white/80"}`} strokeWidth={2} />
            </span>
            {b.ad}
          </Link>
        );
      })}
    </nav>
  );

  const altBolum = (
    <div className="m-3 rounded-xl bg-white/10 p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-vurgu-500 text-sm font-bold text-white">
          {basHarf}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white">{ben?.kullaniciAdi ?? "…"}</div>
          <div className="text-xs text-white/60">{ben?.yonetici ? "Yönetici" : "Kullanıcı"}</div>
        </div>
      </div>
      <CikisDugmesi className="mt-3 w-full rounded-lg border border-white/20 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10" />
    </div>
  );

  const logoKutusu = (
    <div className="mx-3 mb-6 mt-5 overflow-hidden rounded-xl bg-[#f0f6fa]">
      <div className="relative h-14">
        <Image src={logo} alt="Novarge" fill priority sizes="232px" className="object-cover object-center" />
      </div>
      <div className="bg-white/60 py-1 text-center text-[11px] font-semibold tracking-wide text-marka-700">
        Müşteri ve Evrak Takip
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      {/* Masaüstü yan menü */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-gradient-to-b from-marka-800 via-marka-800 to-marka-900 lg:flex">
        {logoKutusu}
        {menu}
        {altBolum}
      </aside>

      {/* Mobil üst şerit */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-marka-800 px-4 py-3 text-white lg:hidden">
        <span className="font-semibold">Müşteri ve Evrak Takip</span>
        <button aria-label="Menüyü aç" onClick={() => setMobilAcik(true)} className="rounded-lg p-1.5 hover:bg-white/10">
          <MenuIkonu className="h-6 w-6" />
        </button>
      </header>
      {mobilAcik && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobilAcik(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-marka-800">
            <button
              aria-label="Menüyü kapat"
              onClick={() => setMobilAcik(false)}
              className="absolute right-3 top-3 rounded-lg p-1.5 text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
            {logoKutusu}
            {menu}
            {altBolum}
          </aside>
        </div>
      )}

      <main key={yol} className="belir mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
