"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Info, LogIn } from "lucide-react";
import GirisKarti, { HataKutusu, KullaniciAdiAlani, SifreAlani } from "@/components/GirisKarti";
import { kullaniciAdindanEposta } from "@/lib/kullanici-adi";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

export default function GirisSayfasi() {
  const router = useRouter();
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);
  const [unuttum, setUnuttum] = useState(false);

  async function girisYap(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setBekle(true);
    const { error } = await tarayiciIstemcisi().auth.signInWithPassword({
      email: kullaniciAdindanEposta(kullaniciAdi),
      password: sifre,
    });
    if (error) {
      setHata("Kullanıcı adı veya şifre hatalı.");
      setBekle(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <GirisKarti baslik="Tekrar hoş geldiniz" aciklama="Devam etmek için hesabınıza giriş yapın.">
      <form onSubmit={girisYap} className="space-y-4">
        <KullaniciAdiAlani
          etiket="Kullanıcı adı"
          autoComplete="username"
          required
          autoFocus
          placeholder="kullanici.adi"
          value={kullaniciAdi}
          onChange={(e) => setKullaniciAdi(e.target.value)}
        />
        <SifreAlani
          etiket="Şifre"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm font-medium text-marka-600 hover:text-marka-800"
            onClick={() => setUnuttum(!unuttum)}
          >
            Şifremi unuttum
          </button>
        </div>
        {unuttum && (
          <div className="flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-900">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            Şifrenizi büro yöneticisi yenileyebilir. Lütfen yöneticiye başvurun; size yeni bir şifre verecektir.
          </div>
        )}
        {hata && <HataKutusu>{hata}</HataKutusu>}
        <button className="dugme w-full !py-3" disabled={bekle}>
          <LogIn className="h-4 w-4" />
          {bekle ? "Giriş yapılıyor…" : "Giriş Yap"}
        </button>
      </form>
      <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="font-semibold text-vurgu-500 hover:text-vurgu-600">
          Kayıt olun
        </Link>
      </p>
    </GirisKarti>
  );
}
