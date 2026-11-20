"use client";

import { useEffect, useMemo, useState } from "react";
import { FileStack } from "lucide-react";
import SayfaBasligi from "@/components/SayfaBasligi";
import DonemSecici from "@/components/DonemSecici";
import TarayicidaGoster from "@/components/TarayicidaGoster";
import { bugun, buAy, donemYaz, telefonYaz } from "@/lib/bicim";
import { api } from "@/lib/istek";
import type { EvrakKaydi, Musteri } from "@/lib/tipler";

export default function EvrakSayfasi() {
  return (
    <TarayicidaGoster>
      <EvrakIcerik />
    </TarayicidaGoster>
  );
}

function EvrakIcerik() {
  const [donem, setDonem] = useState(buAy());
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [evraklar, setEvraklar] = useState<Record<string, EvrakKaydi>>({});
  const [yuklenenDonem, setYuklenenDonem] = useState("");
  const yukleniyor = yuklenenDonem !== donem;
  const [arama, setArama] = useState("");
  const [sadeceGelmeyenler, setSadeceGelmeyenler] = useState(false);
  const [hata, setHata] = useState("");

  useEffect(() => {
    api<Musteri[]>("/api/musteriler").then(setMusteriler).catch((e) => setHata(e.message));
  }, []);

  useEffect(() => {
    let iptal = false;
    api<EvrakKaydi[]>(`/api/evrak?donem=${donem}`)
      .then((liste) => {
        if (iptal) return;
        setEvraklar(Object.fromEntries(liste.map((e) => [e.musteriId, e])));
        setYuklenenDonem(donem);
      })
      .catch((e) => setHata(e.message));
    return () => {
      iptal = true;
    };
  }, [donem]);

  async function kaydet(kayit: EvrakKaydi) {
    const onceki = evraklar[kayit.musteriId];
    setEvraklar((s) => ({ ...s, [kayit.musteriId]: kayit }));
    setHata("");
    try {
      await api("/api/evrak", { method: "PUT", body: JSON.stringify(kayit) });
    } catch (e) {
      setEvraklar((s) => ({ ...s, [kayit.musteriId]: onceki }));
      setHata((e as Error).message);
    }
  }

  function isaretle(m: Musteri, geldi: boolean) {
    // Kutucuk işaretlenince geliş tarihi olarak bugün yazılır.
    // Geçmiş bir ay seçiliyse o ayın son günü önerilir; tarih her zaman değiştirilebilir.
    let tarih: string | null = null;
    if (geldi) {
      tarih = donem === buAy() ? bugun() : sonGun(donem);
    }
    kaydet({ musteriId: m.id, donem, geldi, gelisTarihi: tarih });
  }

  const gelenSayisi = musteriler.filter((m) => evraklar[m.id]?.geldi).length;

  const liste = useMemo(() => {
    const a = arama.toLocaleLowerCase("tr");
    return musteriler
      .filter((m) => !a || m.unvan.toLocaleLowerCase("tr").includes(a) || m.yetkili.toLocaleLowerCase("tr").includes(a))
      .filter((m) => !sadeceGelmeyenler || !evraklar[m.id]?.geldi)
      .sort((x, y) => x.unvan.localeCompare(y.unvan, "tr"));
  }, [musteriler, evraklar, arama, sadeceGelmeyenler]);

  return (
    <div className="space-y-5">
      <SayfaBasligi ikon={FileStack} renk="bg-emerald-100 text-emerald-600" baslik="Evrak Takibi" aciklama="Her ay hangi müşterinin evrakının geldiğini işaretleyin.">
        <DonemSecici deger={donem} degisti={setDonem} />
      </SayfaBasligi>

      <div className="kart flex flex-wrap items-center gap-4 p-4">
        <input
          className="girdi !w-72"
          placeholder="Unvan veya yetkili ile ara…"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sadeceGelmeyenler} onChange={(e) => setSadeceGelmeyenler(e.target.checked)} />
          Yalnızca evrakı gelmeyenleri göster
        </label>
        <span className="ml-auto text-sm text-gray-600">
          {donemYaz(donem)}: <b className="text-green-700">{gelenSayisi} geldi</b> ·{" "}
          <b className="text-red-700">{musteriler.length - gelenSayisi} gelmedi</b>
        </span>
      </div>

      {hata && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{hata}</p>}

      <div className="kart overflow-x-auto">
        <table className="tablo w-full">
          <thead>
            <tr>
              <th className="w-28">Evrak geldi</th>
              <th>Müşteri</th>
              <th>Yetkili</th>
              <th>Telefon</th>
              <th>Geliş Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500">Yükleniyor…</td>
              </tr>
            )}
            {!yukleniyor &&
              liste.map((m) => {
                const k = evraklar[m.id];
                return (
                  <tr key={m.id} className={k?.geldi ? "bg-green-50/60" : ""}>
                    <td>
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-green-700"
                        aria-label={`${m.unvan} evrak geldi`}
                        checked={!!k?.geldi}
                        onChange={(e) => isaretle(m, e.target.checked)}
                      />
                    </td>
                    <td className="font-medium">{m.unvan}</td>
                    <td>{m.yetkili}</td>
                    <td className="whitespace-nowrap">{telefonYaz(m.telefon)}</td>
                    <td>
                      {k?.geldi ? (
                        <input
                          type="date"
                          className="girdi !w-44"
                          value={k.gelisTarihi ?? ""}
                          onChange={(e) => e.target.value && kaydet({ ...k, gelisTarihi: e.target.value })}
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            {!yukleniyor && liste.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-gray-500">Gösterilecek müşteri yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function sonGun(donem: string): string {
  const [y, a] = donem.split("-").map(Number);
  const g = new Date(y, a, 0).getDate();
  return `${donem}-${String(g).padStart(2, "0")}`;
}
