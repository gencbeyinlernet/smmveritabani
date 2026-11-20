"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Plus, Search } from "lucide-react";
import SayfaBasligi from "@/components/SayfaBasligi";
import { paraYaz, sadeceRakam, telefonYaz } from "@/lib/bicim";
import { api } from "@/lib/istek";
import {
  BEYANNAME_ADLARI,
  BEYANNAME_TURLERI,
  MUKELLEFIYET_TURLERI,
  type BeyannameTuru,
  type Musteri,
} from "@/lib/tipler";

type Form = Omit<Musteri, "id" | "aylikUcret"> & { aylikUcret: string };

const BOS_FORM: Form = {
  unvan: "",
  vergiNo: "",
  sektor: "",
  mukellefiyetTuru: MUKELLEFIYET_TURLERI[0],
  yetkili: "",
  telefon: "",
  eposta: "",
  aylikUcret: "",
  beyannameler: [...BEYANNAME_TURLERI],
};

export default function MusterilerSayfasi() {
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [sektor, setSektor] = useState("");
  const [mukellefiyet, setMukellefiyet] = useState("");
  const [duzenlenen, setDuzenlenen] = useState<string | "yeni" | null>(null);
  const [form, setForm] = useState<Form>(BOS_FORM);
  const [hata, setHata] = useState("");
  const [kaydediliyor, setKaydediliyor] = useState(false);

  async function yukle() {
    try {
      setMusteriler(await api<Musteri[]>("/api/musteriler"));
    } catch (e) {
      setHata((e as Error).message);
    } finally {
      setYukleniyor(false);
    }
  }
  useEffect(() => {
    api<Musteri[]>("/api/musteriler")
      .then(setMusteriler)
      .catch((e) => setHata(e.message))
      .finally(() => setYukleniyor(false));
  }, []);

  const sektorler = useMemo(
    () => [...new Set(musteriler.map((m) => m.sektor).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr")),
    [musteriler],
  );

  const liste = useMemo(() => {
    const a = arama.toLocaleLowerCase("tr");
    return musteriler
      .filter((m) => !sektor || m.sektor === sektor)
      .filter((m) => !mukellefiyet || m.mukellefiyetTuru === mukellefiyet)
      .filter(
        (m) =>
          !a ||
          [m.unvan, m.yetkili, m.eposta, m.vergiNo, m.telefon].some((x) =>
            x.toLocaleLowerCase("tr").includes(a),
          ),
      )
      .sort((x, y) => x.unvan.localeCompare(y.unvan, "tr"));
  }, [musteriler, arama, sektor, mukellefiyet]);

  function yeniAc() {
    setForm(BOS_FORM);
    setHata("");
    setDuzenlenen("yeni");
  }

  function duzenleAc(m: Musteri) {
    setForm({ ...m, aylikUcret: String(m.aylikUcret).replace(".", ",") });
    setHata("");
    setDuzenlenen(m.id);
  }

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setKaydediliyor(true);
    try {
      const govde = JSON.stringify({ ...form, aylikUcret: Number(form.aylikUcret.replace(",", ".")) || 0 });
      if (duzenlenen === "yeni") await api("/api/musteriler", { method: "POST", body: govde });
      else await api(`/api/musteriler/${duzenlenen}`, { method: "PUT", body: govde });
      setDuzenlenen(null);
      await yukle();
    } catch (e) {
      setHata((e as Error).message);
    } finally {
      setKaydediliyor(false);
    }
  }

  function beyannameDegistir(tur: BeyannameTuru, secili: boolean) {
    setForm((f) => ({
      ...f,
      beyannameler: BEYANNAME_TURLERI.filter((t) => (t === tur ? secili : f.beyannameler.includes(t))),
    }));
  }

  const alan = (k: keyof Form) => ({
    value: form[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  return (
    <div className="space-y-5">
      <SayfaBasligi ikon={Users} renk="bg-violet-100 text-violet-600" baslik="Müşteriler" aciklama="Müşteri bilgilerini ekleyin, düzenleyin, arayın ve süzün.">
        <button className="dugme-vurgu" onClick={yeniAc}>
          <Plus className="h-4 w-4" />
          Yeni Müşteri
        </button>
      </SayfaBasligi>

      <div className="kart grid gap-3 p-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="girdi !pl-9"
            placeholder="Unvan, yetkili, e-posta veya vergi no ile ara…"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
          />
        </div>
        <select className="girdi" value={sektor} onChange={(e) => setSektor(e.target.value)}>
          <option value="">Tüm sektörler</option>
          {sektorler.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className="girdi" value={mukellefiyet} onChange={(e) => setMukellefiyet(e.target.value)}>
          <option value="">Tüm mükellefiyet türleri</option>
          {MUKELLEFIYET_TURLERI.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="kart overflow-x-auto">
        <table className="tablo w-full">
          <thead>
            <tr>
              <th>Unvan</th>
              <th>Sektör</th>
              <th>Mükellefiyet Türü</th>
              <th>Yetkili</th>
              <th>Telefon</th>
              <th>E-posta</th>
              <th className="!text-right">Aylık Ücret</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {yukleniyor && (
              <tr>
                <td colSpan={8} className="text-center text-gray-500">Yükleniyor…</td>
              </tr>
            )}
            {!yukleniyor && liste.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-gray-500">Aramanıza uygun müşteri bulunamadı.</td>
              </tr>
            )}
            {liste.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="font-medium">{m.unvan}</td>
                <td>{m.sektor}</td>
                <td>{m.mukellefiyetTuru}</td>
                <td>{m.yetkili}</td>
                <td className="whitespace-nowrap">{telefonYaz(m.telefon)}</td>
                <td>{m.eposta}</td>
                <td className="whitespace-nowrap text-right tabular-nums">{paraYaz(m.aylikUcret)}</td>
                <td className="text-right">
                  <button className="text-sm text-blue-700 hover:underline" onClick={() => duzenleAc(m)}>
                    Düzenle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-500">
        {liste.length} / {musteriler.length} müşteri gösteriliyor
      </p>

      {duzenlenen && (
        <div className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
          <form onSubmit={kaydet} className="kart mt-10 w-full max-w-2xl space-y-4 p-6">
            <h2 className="text-lg font-semibold">
              {duzenlenen === "yeni" ? "Yeni Müşteri" : "Müşteriyi Düzenle"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm">
                Unvan *
                <input className="girdi mt-1" required {...alan("unvan")} />
              </label>
              <label className="text-sm">
                Vergi No
                <input
                  className="girdi mt-1"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.vergiNo}
                  onChange={(e) => setForm((f) => ({ ...f, vergiNo: sadeceRakam(e.target.value) }))}
                />
              </label>
              <label className="text-sm">
                Sektör
                <input className="girdi mt-1" list="sektor-listesi" {...alan("sektor")} />
                <datalist id="sektor-listesi">
                  {sektorler.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </label>
              <label className="text-sm">
                Mükellefiyet Türü
                <select className="girdi mt-1" {...alan("mukellefiyetTuru")}>
                  {MUKELLEFIYET_TURLERI.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Yetkili
                <input className="girdi mt-1" {...alan("yetkili")} />
              </label>
              <label className="text-sm">
                Telefon (yalnızca rakam)
                <input
                  className="girdi mt-1"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="05551234567"
                  value={form.telefon}
                  onChange={(e) => setForm((f) => ({ ...f, telefon: sadeceRakam(e.target.value) }))}
                />
              </label>
              <label className="text-sm">
                E-posta
                <input className="girdi mt-1" type="email" {...alan("eposta")} />
              </label>
              <label className="text-sm">
                Aylık Ücret (₺)
                <input
                  className="girdi mt-1"
                  inputMode="decimal"
                  placeholder="15000"
                  value={form.aylikUcret}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, aylikUcret: e.target.value.replace(/[^\d,]/g, "") }))
                  }
                />
              </label>
            </div>
            <fieldset className="text-sm">
              <legend className="mb-1">Verdiği beyannameler</legend>
              <div className="flex flex-wrap gap-4">
                {BEYANNAME_TURLERI.map((t) => (
                  <label key={t} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.beyannameler.includes(t)}
                      onChange={(e) => beyannameDegistir(t, e.target.checked)}
                    />
                    {BEYANNAME_ADLARI[t]}
                  </label>
                ))}
              </div>
            </fieldset>
            {hata && <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{hata}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" className="dugme-ikincil" onClick={() => setDuzenlenen(null)}>
                Vazgeç
              </button>
              <button className="dugme" disabled={kaydediliyor}>
                {kaydediliyor ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
