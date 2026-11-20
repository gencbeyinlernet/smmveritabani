"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ClipboardCheck,
  Download,
  FileStack,
  FileWarning,
  LayoutDashboard,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import SayfaBasligi from "@/components/SayfaBasligi";
import { donemYaz } from "@/lib/bicim";
import { api } from "@/lib/istek";

type Ozet = {
  ay: string;
  toplamMusteri: number;
  evrakiGelmeyen: number;
  bekleyenBeyanname: number;
  gonderilmemisBeyanname: number;
};

type Kutu = {
  baslik: string;
  sayi: number;
  alt: string;
  href: string;
  ikon: LucideIcon;
  arkaplan: string;
  oran?: number; // 0–1 arası ilerleme çubuğu
};

export default function AnaSayfa() {
  const [ozet, setOzet] = useState<Ozet | null>(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    api<Ozet>("/api/ozet").then(setOzet).catch((e) => setHata(e.message));
  }, []);

  const kutular: Kutu[] = ozet
    ? [
        {
          baslik: "Toplam Müşteri",
          sayi: ozet.toplamMusteri,
          alt: "Kayıtlı müşteri",
          href: "/musteriler",
          ikon: Users,
          arkaplan: "from-violet-500 to-indigo-600",
        },
        {
          baslik: "Evrakı Gelmeyen",
          sayi: ozet.evrakiGelmeyen,
          alt: `${donemYaz(ozet.ay)} · ${ozet.toplamMusteri - ozet.evrakiGelmeyen} müşterinin evrakı geldi`,
          href: "/evrak",
          ikon: FileWarning,
          arkaplan: "from-rose-500 to-vurgu-600",
          oran: ozet.toplamMusteri ? (ozet.toplamMusteri - ozet.evrakiGelmeyen) / ozet.toplamMusteri : 0,
        },
        {
          baslik: "Bekleyen Beyanname",
          sayi: ozet.bekleyenBeyanname,
          alt: `Gönderilmemiş toplam: ${ozet.gonderilmemisBeyanname}`,
          href: "/beyannameler",
          ikon: ClipboardCheck,
          arkaplan: "from-amber-400 to-orange-500",
        },
      ]
    : [];

  const kisayollar = [
    { href: "/musteriler", ad: "Yeni müşteri ekle", ikon: UserPlus, renk: "bg-violet-100 text-violet-600" },
    { href: "/evrak", ad: "Evrak girişi yap", ikon: FileStack, renk: "bg-emerald-100 text-emerald-600" },
    { href: "/beyannameler", ad: "Beyanname durumu güncelle", ikon: ClipboardCheck, renk: "bg-amber-100 text-amber-600" },
  ];

  return (
    <div>
      <SayfaBasligi
        ikon={LayoutDashboard}
        renk="bg-sky-100 text-sky-600"
        baslik="Ana Sayfa"
        aciklama={ozet ? `${donemYaz(ozet.ay)} dönemi özeti` : "Özet bilgiler yükleniyor…"}
      />

      {hata && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{hata}</p>}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {!ozet &&
          !hata &&
          [0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-200/70" />)}
        {kutular.map((k) => {
          const Ikon = k.ikon;
          return (
            <Link
              key={k.baslik}
              href={k.href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${k.arkaplan} p-6 text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:shadow-xl`}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="flex items-start justify-between">
                <div className="text-sm font-medium text-white/85">{k.baslik}</div>
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
                  <Ikon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-3 text-4xl font-bold tabular-nums tracking-tight">{k.sayi}</div>
              {k.oran !== undefined && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-white" style={{ width: `${Math.round(k.oran * 100)}%` }} />
                </div>
              )}
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-white/80">
                <span>{k.alt}</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
        {ozet && (
          <div className="kart flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                <FileWarning className="h-6 w-6" />
              </span>
              <div>
                <div className="font-semibold text-slate-900">Evrakı gelmeyenler listesi</div>
                <div className="text-sm text-slate-500">
                  {ozet.evrakiGelmeyen > 0
                    ? `${donemYaz(ozet.ay)} ayında ${ozet.evrakiGelmeyen} müşterinin evrakı bekleniyor.`
                    : `${donemYaz(ozet.ay)} ayında tüm evraklar geldi.`}
                </div>
              </div>
            </div>
            {ozet.evrakiGelmeyen > 0 && (
              <a className="dugme-vurgu" href={`/api/rapor/evrak-gelmeyenler?donem=${ozet.ay}`}>
                <Download className="h-4 w-4" />
                Excel olarak indir
              </a>
            )}
          </div>
        )}
        <div className="kart p-5">
          <div className="mb-3 text-sm font-semibold text-slate-900">Hızlı işlemler</div>
          <div className="space-y-1">
            {kisayollar.map(({ href, ad, ikon: Ikon, renk }) => (
              <Link
                key={ad}
                href={href}
                className="group flex items-center gap-3 rounded-xl p-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <span className={`grid h-9 w-9 place-items-center rounded-lg ${renk}`}>
                  <Ikon className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1">{ad}</span>
                <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
