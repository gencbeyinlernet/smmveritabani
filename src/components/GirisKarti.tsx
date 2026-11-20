"use client";

import Image from "next/image";
import { useState } from "react";
import { BarChart3, ClipboardCheck, Eye, EyeOff, FileStack, Lock, User, type LucideIcon } from "lucide-react";
import logo from "../../public/logo.png";

const OZELLIKLER: { ikon: LucideIcon; baslik: string; metin: string; renk: string }[] = [
  { ikon: FileStack, baslik: "Evrak takibi", metin: "Hangi müşterinin evrakı geldi, tek bakışta görün.", renk: "bg-emerald-400/15 text-emerald-300" },
  { ikon: ClipboardCheck, baslik: "Beyanname durumu", metin: "KDV, Muhtasar ve Geçici Vergi aşamalarını izleyin.", renk: "bg-amber-400/15 text-amber-300" },
  { ikon: BarChart3, baslik: "Anında rapor", metin: "Eksik evrak listesini Excel olarak indirin.", renk: "bg-rose-400/15 text-rose-300" },
];

/** Giriş, kayıt ve onay sayfalarının ortak iki bölmeli düzeni. */
export default function GirisKarti({
  baslik,
  aciklama,
  children,
}: {
  baslik: string;
  aciklama?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Sol: tanıtım bölmesi */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-marka-800 via-marka-700 to-marka-900 p-12 text-white lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-vurgu-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />

        <div className="relative w-56 overflow-hidden rounded-2xl bg-[#f0f6fa] shadow-lg">
          <div className="relative h-20">
            <Image src={logo} alt="Novarge" fill priority sizes="224px" className="object-cover object-center" />
          </div>
        </div>

        <div className="relative my-auto max-w-md">
          <span className="rozet bg-white/10 text-white/90">Mali Müşavirlik Bürosu</span>
          <h2 className="mt-4 text-4xl font-bold leading-tight tracking-tight">
            Müşteri ve evrak takibi,
            <span className="block text-vurgu-500"> tek ekranda.</span>
          </h2>
          <ul className="mt-10 space-y-5">
            {OZELLIKLER.map(({ ikon: Ikon, baslik: b, metin, renk }) => (
              <li key={b} className="flex gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${renk}`}>
                  <Ikon className="h-5 w-5" />
                </span>
                <div>
                  <div className="font-semibold">{b}</div>
                  <div className="text-sm text-white/65">{metin}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/45">© Novarge · Tüm hakları saklıdır.</p>
      </section>

      {/* Sağ: form bölmesi */}
      <section className="flex items-center justify-center bg-[#f5f7fb] px-5 py-10">
        <div className="belir w-full max-w-md">
          <div className="mx-auto mb-8 w-48 overflow-hidden rounded-2xl bg-[#f0f6fa] lg:hidden">
            <div className="relative h-16">
              <Image src={logo} alt="Novarge" fill priority sizes="192px" className="object-cover object-center" />
            </div>
          </div>
          <div className="kart p-8 shadow-xl shadow-marka-900/5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{baslik}</h1>
            {aciklama && <p className="mt-1 text-sm text-slate-500">{aciklama}</p>}
            <div className="mt-6 space-y-5">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Simgeli metin kutusu (kullanıcı adı). */
export function KullaniciAdiAlani(props: React.InputHTMLAttributes<HTMLInputElement> & { etiket: string; ipucu?: string }) {
  const { etiket, ipucu, ...girdi } = props;
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{etiket}</span>
      <span className="relative block">
        <User className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
        <input className="girdi !pl-10" autoCapitalize="none" spellCheck={false} {...girdi} />
      </span>
      {ipucu && <span className="mt-1.5 block text-xs text-slate-500">{ipucu}</span>}
    </label>
  );
}

/** Göster/gizle düğmeli şifre kutusu. */
export function SifreAlani(props: React.InputHTMLAttributes<HTMLInputElement> & { etiket: string }) {
  const { etiket, ...girdi } = props;
  const [gorunur, setGorunur] = useState(false);
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{etiket}</span>
      <span className="relative block">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400" />
        <input className="girdi !pl-10 !pr-11" type={gorunur ? "text" : "password"} {...girdi} />
        <button
          type="button"
          onClick={() => setGorunur(!gorunur)}
          aria-label={gorunur ? "Şifreyi gizle" : "Şifreyi göster"}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          {gorunur ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
        </button>
      </span>
    </label>
  );
}

/** Kırmızı hata kutusu. */
export function HataKutusu({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
      {children}
    </p>
  );
}
