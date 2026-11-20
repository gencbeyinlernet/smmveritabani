"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import SayfaBasligi from "@/components/SayfaBasligi";
import DonemSecici from "@/components/DonemSecici";
import TarayicidaGoster from "@/components/TarayicidaGoster";
import { buAy, ceyrekBul, ceyrekYaz, donemYaz, geciciVerilirMi } from "@/lib/bicim";
import { beyannameDonemi, beyannameDurumlari } from "@/lib/hesap";
import { api } from "@/lib/istek";
import {
  BEYANNAME_ADLARI,
  BEYANNAME_TURLERI,
  DURUMLAR,
  type BeyannameKaydi,
  type BeyannameTuru,
  type Durum,
  type Musteri,
} from "@/lib/tipler";

const RENKLER: Record<Durum, string> = {
  Bekliyor: "bg-gray-100 text-gray-700 border-gray-300",
  Hazırlandı: "bg-amber-50 text-amber-800 border-amber-300",
  Onaylandı: "bg-blue-50 text-blue-800 border-blue-300",
  Gönderildi: "bg-green-50 text-green-800 border-green-400",
};

export default function BeyannamelerSayfasi() {
  return (
    <TarayicidaGoster>
      <BeyannameIcerik />
    </TarayicidaGoster>
  );
}

function BeyannameIcerik() {
  const [ay, setAy] = useState(buAy());
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [kayitlar, setKayitlar] = useState<BeyannameKaydi[]>([]);
  const [yuklenenAy, setYuklenenAy] = useState("");
  const yukleniyor = yuklenenAy !== ay;
  const [arama, setArama] = useState("");
  const [sadeceAcik, setSadeceAcik] = useState(false);
  const [hata, setHata] = useState("");

  useEffect(() => {
    api<Musteri[]>("/api/musteriler").then(setMusteriler).catch((e) => setHata(e.message));
  }, []);

  useEffect(() => {
    let iptal = false;
    api<BeyannameKaydi[]>(`/api/beyanname?ay=${ay}`)
      .then((l) => {
        if (iptal) return;
        setKayitlar(l);
        setYuklenenAy(ay);
      })
      .catch((e) => setHata(e.message));
    return () => {
      iptal = true;
    };
  }, [ay]);

  const ceyrek = ceyrekBul(ay);
  const geciciVar = geciciVerilirMi(ceyrek);

  function durumBul(musteriId: string, tur: BeyannameTuru): Durum {
    const donem = beyannameDonemi(tur, ay);
    return kayitlar.find((k) => k.musteriId === musteriId && k.tur === tur && k.donem === donem)?.durum ?? "Bekliyor";
  }

  async function durumDegistir(musteriId: string, tur: BeyannameTuru, durum: Durum) {
    const kayit: BeyannameKaydi = { musteriId, tur, donem: beyannameDonemi(tur, ay), durum };
    const onceki = kayitlar;
    const yeni = kayitlar.filter(
      (k) => !(k.musteriId === musteriId && k.tur === tur && k.donem === kayit.donem),
    );
    setKayitlar([...yeni, kayit]);
    setHata("");
    try {
      await api("/api/beyanname", { method: "PUT", body: JSON.stringify(kayit) });
    } catch (e) {
      setKayitlar(onceki);
      setHata((e as Error).message);
    }
  }

  const tumDurumlar = useMemo(() => beyannameDurumlari(musteriler, kayitlar, ay), [musteriler, kayitlar, ay]);
  const sayilar = DURUMLAR.map((d) => [d, tumDurumlar.filter((x) => x.durum === d).length] as const);

  const liste = useMemo(() => {
    const a = arama.toLocaleLowerCase("tr");
    const acikOlanlar = new Set(tumDurumlar.filter((d) => d.durum !== "Gönderildi").map((d) => d.musteriId));
    return musteriler
      .filter((m) => !a || m.unvan.toLocaleLowerCase("tr").includes(a))
      .filter((m) => !sadeceAcik || acikOlanlar.has(m.id))
      .sort((x, y) => x.unvan.localeCompare(y.unvan, "tr"));
  }, [musteriler, tumDurumlar, arama, sadeceAcik]);

  function hucre(m: Musteri, tur: BeyannameTuru) {
    if (tur === "GECICI" && !geciciVar) return <span className="text-xs text-gray-400">Bu dönemde verilmez</span>;
    if (!m.beyannameler.includes(tur)) return <span className="text-xs text-gray-400">Vermiyor</span>;
    const durum = durumBul(m.id, tur);
    return (
      <select
        aria-label={`${m.unvan} ${BEYANNAME_ADLARI[tur]} durumu`}
        className={`rounded-md border px-2 py-1 text-sm font-medium ${RENKLER[durum]}`}
        value={durum}
        onChange={(e) => durumDegistir(m.id, tur, e.target.value as Durum)}
      >
        {DURUMLAR.map((d) => (
          <option key={d}>{d}</option>
        ))}
      </select>
    );
  }

  return (
    <div className="space-y-5">
      <SayfaBasligi ikon={ClipboardCheck} renk="bg-amber-100 text-amber-600" baslik="Beyanname Takibi" aciklama="KDV, Muhtasar ve Geçici Vergi beyannamelerinin aşamalarını izleyin.">
        <DonemSecici deger={ay} degisti={setAy} />
      </SayfaBasligi>

      <div className="kart flex flex-wrap items-center gap-4 p-4">
        <input
          className="girdi !w-72"
          placeholder="Unvan ile ara…"
          value={arama}
          onChange={(e) => setArama(e.target.value)}
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={sadeceAcik} onChange={(e) => setSadeceAcik(e.target.checked)} />
          Yalnızca gönderilmemiş beyannamesi olanlar
        </label>
        <div className="ml-auto flex flex-wrap gap-2">
          {sayilar.map(([d, n]) => (
            <span key={d} className={`rounded-full border px-3 py-1 text-xs font-medium ${RENKLER[d]}`}>
              {d}: {n}
            </span>
          ))}
        </div>
      </div>

      {hata && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{hata}</p>}

      <div className="kart overflow-x-auto">
        <table className="tablo w-full">
          <thead>
            <tr>
              <th>Müşteri</th>
              <th>KDV<div className="font-normal normal-case">{donemYaz(ay)}</div></th>
              <th>Muhtasar<div className="font-normal normal-case">{donemYaz(ay)}</div></th>
              <th>Geçici Vergi<div className="font-normal normal-case">{ceyrekYaz(ceyrek)}</div></th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-500">Yükleniyor…</td>
              </tr>
            ) : (
              liste.map((m) => (
                <tr key={m.id}>
                  <td className="font-medium">{m.unvan}</td>
                  {BEYANNAME_TURLERI.map((t) => (
                    <td key={t}>{hucre(m, t)}</td>
                  ))}
                </tr>
              ))
            )}
            {!yukleniyor && liste.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center text-gray-500">Gösterilecek müşteri yok.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500">
        KDV ve Muhtasar aylık, Geçici Vergi 3 aylık dönemler hâlinde takip edilir. Geçici Vergi
        hücresindeki değişiklik o 3 aylık dönemin tüm aylarında görünür.
      </p>
    </div>
  );
}
