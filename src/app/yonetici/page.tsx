"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import SayfaBasligi from "@/components/SayfaBasligi";
import { api } from "@/lib/istek";

type Kullanici = {
  id: string;
  kullaniciAdi: string;
  onayli: boolean;
  yonetici: boolean;
  olusturulma: string;
  ben: boolean;
};

export default function YoneticiSayfasi() {
  const [liste, setListe] = useState<Kullanici[] | null>(null);
  const [mesaj, setMesaj] = useState<{ tur: "hata" | "bilgi"; metin: string } | null>(null);
  const [sifreKimin, setSifreKimin] = useState<Kullanici | null>(null);
  const [yeniSifre, setYeniSifre] = useState("");
  const [silinecek, setSilinecek] = useState<Kullanici | null>(null);

  async function yukle() {
    try {
      setListe(await api<Kullanici[]>("/api/yonetici/kullanicilar"));
    } catch (e) {
      setMesaj({ tur: "hata", metin: (e as Error).message });
    }
  }
  useEffect(() => {
    api<Kullanici[]>("/api/yonetici/kullanicilar")
      .then(setListe)
      .catch((e) => setMesaj({ tur: "hata", metin: e.message }));
  }, []);

  async function islem(fn: () => Promise<unknown>, basari: string) {
    setMesaj(null);
    try {
      await fn();
      setMesaj({ tur: "bilgi", metin: basari });
      await yukle();
    } catch (e) {
      setMesaj({ tur: "hata", metin: (e as Error).message });
    }
  }

  const guncelle = (k: Kullanici, degisiklik: Partial<Pick<Kullanici, "onayli" | "yonetici">>, basari: string) =>
    islem(
      () => api(`/api/yonetici/kullanicilar/${k.id}`, { method: "PATCH", body: JSON.stringify(degisiklik) }),
      basari,
    );

  async function sifreKaydet(e: React.FormEvent) {
    e.preventDefault();
    if (!sifreKimin) return;
    const k = sifreKimin;
    setSifreKimin(null);
    await islem(
      () => api(`/api/yonetici/kullanicilar/${k.id}`, { method: "POST", body: JSON.stringify({ yeniSifre }) }),
      `${k.kullaniciAdi} kullanıcısının şifresi değiştirildi. Yeni şifreyi kendisine iletin.`,
    );
    setYeniSifre("");
  }

  async function sil() {
    if (!silinecek) return;
    const k = silinecek;
    setSilinecek(null);
    await islem(
      () => api(`/api/yonetici/kullanicilar/${k.id}`, { method: "DELETE" }),
      `${k.kullaniciAdi} kullanıcısı silindi.`,
    );
  }

  const bekleyenler = liste?.filter((k) => !k.onayli).length ?? 0;

  return (
    <div className="space-y-5">
      <SayfaBasligi
        ikon={ShieldCheck}
        renk="bg-vurgu-50 text-vurgu-500"
        baslik="Yönetici Paneli"
        aciklama={
          <>
          Kullanıcıları onaylayın, yetki verin, şifre yenileyin.
          {bekleyenler > 0 && <b className="text-amber-700"> {bekleyenler} kullanıcı onay bekliyor.</b>}
          </>
        }
      />

      {mesaj && (
        <p
          className={`rounded-md p-2 text-sm ${mesaj.tur === "hata" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}
        >
          {mesaj.metin}
        </p>
      )}

      <div className="kart overflow-x-auto">
        <table className="tablo w-full">
          <thead>
            <tr>
              <th>Kullanıcı adı</th>
              <th>Kayıt tarihi</th>
              <th>Durum</th>
              <th>Yetki</th>
              <th className="!text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {!liste && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500">Yükleniyor…</td>
              </tr>
            )}
            {liste?.map((k) => (
              <tr key={k.id} className={k.onayli ? "" : "bg-amber-50/60"}>
                <td className="font-medium">
                  {k.kullaniciAdi} {k.ben && <span className="text-xs text-gray-500">(siz)</span>}
                </td>
                <td>{new Date(k.olusturulma).toLocaleDateString("tr-TR")}</td>
                <td>
                  {k.onayli ? (
                    <span className="text-green-700">Onaylı</span>
                  ) : (
                    <span className="font-medium text-amber-700">Onay bekliyor</span>
                  )}
                </td>
                <td>{k.yonetici ? "Yönetici" : "Kullanıcı"}</td>
                <td>
                  {k.ben ? (
                    <span className="block text-right text-xs text-gray-400">Kendi hesabınızda işlem yapılamaz</span>
                  ) : (
                    <div className="flex flex-wrap justify-end gap-2">
                      {k.onayli ? (
                        <button className="dugme-ikincil !px-2 !py-1" onClick={() => guncelle(k, { onayli: false }, `${k.kullaniciAdi} kullanıcısının onayı kaldırıldı.`)}>
                          Onayı kaldır
                        </button>
                      ) : (
                        <button className="dugme !px-2 !py-1" onClick={() => guncelle(k, { onayli: true }, `${k.kullaniciAdi} onaylandı.`)}>
                          Onayla
                        </button>
                      )}
                      <button
                        className="dugme-ikincil !px-2 !py-1"
                        onClick={() =>
                          guncelle(
                            k,
                            { yonetici: !k.yonetici },
                            k.yonetici ? `${k.kullaniciAdi} artık yönetici değil.` : `${k.kullaniciAdi} yönetici yapıldı.`,
                          )
                        }
                      >
                        {k.yonetici ? "Yöneticiliği kaldır" : "Yönetici yap"}
                      </button>
                      <button className="dugme-ikincil !px-2 !py-1" onClick={() => { setYeniSifre(""); setSifreKimin(k); }}>
                        Şifre yenile
                      </button>
                      <button className="dugme-ikincil !px-2 !py-1 !text-red-700" onClick={() => setSilinecek(k)}>
                        Sil
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sifreKimin && (
        <div className="fixed inset-0 z-10 flex items-start justify-center bg-black/40 p-4">
          <form onSubmit={sifreKaydet} className="kart mt-20 w-full max-w-sm space-y-3 p-6">
            <h2 className="font-semibold">{sifreKimin.kullaniciAdi} için yeni şifre</h2>
            <input
              className="girdi"
              type="text"
              autoComplete="off"
              minLength={6}
              required
              placeholder="En az 6 karakter"
              value={yeniSifre}
              onChange={(e) => setYeniSifre(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button type="button" className="dugme-ikincil" onClick={() => setSifreKimin(null)}>
                Vazgeç
              </button>
              <button className="dugme">Şifreyi değiştir</button>
            </div>
          </form>
        </div>
      )}

      {silinecek && (
        <div className="fixed inset-0 z-10 flex items-start justify-center bg-black/40 p-4">
          <div className="kart mt-20 w-full max-w-sm space-y-3 p-6">
            <h2 className="font-semibold">Kullanıcı silinsin mi?</h2>
            <p className="text-sm text-gray-700">
              <b>{silinecek.kullaniciAdi}</b> kalıcı olarak silinecek. Bu işlem geri alınamaz. Müşteri
              kayıtları etkilenmez.
            </p>
            <div className="flex justify-end gap-2">
              <button className="dugme-ikincil" onClick={() => setSilinecek(null)}>
                Vazgeç
              </button>
              <button className="dugme !bg-red-700 hover:!bg-red-800" onClick={sil}>
                Evet, sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
