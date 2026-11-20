"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import GirisKarti, { HataKutusu, KullaniciAdiAlani, SifreAlani } from "@/components/GirisKarti";
import { kullaniciAdiDuzenle, kullaniciAdiHatasi, kullaniciAdindanEposta } from "@/lib/kullanici-adi";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

export default function KayitSayfasi() {
  const router = useRouter();
  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [hata, setHata] = useState("");
  const [bekle, setBekle] = useState(false);

  async function kayitOl(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    const ad = kullaniciAdiDuzenle(kullaniciAdi);
    const adHatasi = kullaniciAdiHatasi(ad);
    if (adHatasi) return setHata(adHatasi);
    if (sifre.length < 6) return setHata("Şifre en az 6 karakter olmalıdır.");
    if (sifre !== sifreTekrar) return setHata("Şifreler birbiriyle aynı değil.");

    setBekle(true);
    const supabase = tarayiciIstemcisi();
    // Hesap, veritabanındaki "kayit_ol" işlemiyle açılır (sql-kod.txt, 8b. bölüm).
    const kayit = await supabase.rpc("kayit_ol", { yeni_kullanici_adi: ad, yeni_sifre: sifre });
    if (kayit.error) {
      setBekle(false);
      console.error("Kayıt hatası:", kayit.error);
      if (/alınmış/.test(kayit.error.message)) return setHata("Bu kullanıcı adı zaten alınmış. Başka bir ad deneyin.");
      if (/kayit_ol|function/i.test(kayit.error.message))
        return setHata("Kayıt işlemi veritabanında bulunamadı. sql-kod.txt dosyası Supabase'de yeniden çalıştırılmalı.");
      return setHata(kayit.error.message || "Kayıt yapılamadı. Lütfen tekrar deneyin.");
    }
    const giris = await supabase.auth.signInWithPassword({ email: kullaniciAdindanEposta(ad), password: sifre });
    if (giris.error) {
      setBekle(false);
      console.error("Kayıt sonrası giriş hatası:", giris.error);
      return setHata("Hesabınız açıldı ancak giriş yapılamadı. Giriş sayfasından tekrar deneyin.");
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <GirisKarti baslik="Hesap oluşturun" aciklama="Yalnızca kullanıcı adı ve şifre yeterli.">
      <form onSubmit={kayitOl} className="space-y-4">
        <KullaniciAdiAlani
          etiket="Kullanıcı adı"
          ipucu="İngilizce küçük harf, rakam, nokta, alt çizgi veya tire (ör. ayse.yilmaz)"
          autoComplete="username"
          required
          autoFocus
          placeholder="ayse.yilmaz"
          value={kullaniciAdi}
          onChange={(e) => setKullaniciAdi(e.target.value)}
        />
        <SifreAlani
          etiket="Şifre (en az 6 karakter)"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
        />
        <SifreAlani
          etiket="Şifre (tekrar)"
          autoComplete="new-password"
          required
          placeholder="••••••••"
          value={sifreTekrar}
          onChange={(e) => setSifreTekrar(e.target.value)}
        />
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          Güvenliğiniz için yeni hesaplar, yönetici onayladıktan sonra kullanılabilir.
        </div>
        {hata && <HataKutusu>{hata}</HataKutusu>}
        <button className="dugme w-full !py-3" disabled={bekle}>
          <UserPlus className="h-4 w-4" />
          {bekle ? "Hesap oluşturuluyor…" : "Kayıt Ol"}
        </button>
      </form>
      <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-600">
        Zaten hesabınız var mı?{" "}
        <Link href="/giris" className="font-semibold text-vurgu-500 hover:text-vurgu-600">
          Giriş yapın
        </Link>
      </p>
    </GirisKarti>
  );
}
