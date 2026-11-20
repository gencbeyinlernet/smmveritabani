// VERİ KATMANI – tüm kayıtlar Supabase veritabanında tutulur.
// Her işlem giriş yapan kullanıcının oturumuyla yapılır; veritabanındaki
// güvenlik kuralları (RLS) onaysız kullanıcıların veriye erişimini engeller.

import "server-only";
import { sunucuIstemcisi as db } from "./supabase/sunucu";
import type { BeyannameKaydi, BeyannameTuru, Durum, EvrakKaydi, Musteri } from "./tipler";

/** Supabase hatasını Türkçe bir mesaja çevirir. */
function kontrol<T>(sonuc: { data: T; error: { message: string; code?: string } | null }): T {
  if (sonuc.error) {
    console.error("Supabase hatası:", sonuc.error);
    if (sonuc.error.code === "PGRST205")
      throw new Error("Veritabanı tabloları bulunamadı. sql-kod.txt dosyasını Supabase'de çalıştırın.");
    throw new Error("Veritabanına kaydedilemedi. Lütfen tekrar deneyin.");
  }
  return sonuc.data;
}

// ---------- Veritabanı satırı <-> uygulama kaydı dönüşümleri ----------

type MusteriSatiri = {
  id: string;
  unvan: string;
  vergi_no: string;
  sektor: string;
  mukellefiyet_turu: string;
  yetkili: string;
  telefon: string;
  eposta: string;
  aylik_ucret: number | string;
  beyannameler: BeyannameTuru[];
};

const musteriden = (s: MusteriSatiri): Musteri => ({
  id: s.id,
  unvan: s.unvan,
  vergiNo: s.vergi_no,
  sektor: s.sektor,
  mukellefiyetTuru: s.mukellefiyet_turu,
  yetkili: s.yetkili,
  telefon: s.telefon,
  eposta: s.eposta,
  aylikUcret: Number(s.aylik_ucret),
  beyannameler: s.beyannameler,
});

const musteriye = (m: Omit<Musteri, "id">) => ({
  unvan: m.unvan,
  vergi_no: m.vergiNo,
  sektor: m.sektor,
  mukellefiyet_turu: m.mukellefiyetTuru,
  yetkili: m.yetkili,
  telefon: m.telefon,
  eposta: m.eposta,
  aylik_ucret: m.aylikUcret,
  beyannameler: m.beyannameler,
});

// ---------- Müşteriler ----------

export async function musterileriGetir(): Promise<Musteri[]> {
  const satirlar = kontrol(await (await db()).from("musteriler").select("*").order("unvan"));
  return (satirlar as MusteriSatiri[]).map(musteriden);
}

export async function musteriEkle(bilgi: Omit<Musteri, "id">): Promise<Musteri> {
  const satir = kontrol(await (await db()).from("musteriler").insert(musteriye(bilgi)).select().single());
  return musteriden(satir as MusteriSatiri);
}

export async function musteriGuncelle(id: string, bilgi: Omit<Musteri, "id">): Promise<Musteri | null> {
  const satir = kontrol(
    await (await db()).from("musteriler").update(musteriye(bilgi)).eq("id", id).select().maybeSingle(),
  );
  return satir ? musteriden(satir as MusteriSatiri) : null;
}

// ---------- Evrak ----------

export async function evraklariGetir(donem: string): Promise<EvrakKaydi[]> {
  const satirlar = kontrol(
    await (await db()).from("evraklar").select("musteri_id, donem, geldi, gelis_tarihi").eq("donem", donem),
  ) as { musteri_id: string; donem: string; geldi: boolean; gelis_tarihi: string | null }[];
  return satirlar.map((s) => ({
    musteriId: s.musteri_id,
    donem: s.donem,
    geldi: s.geldi,
    gelisTarihi: s.gelis_tarihi,
  }));
}

export async function evrakKaydet(k: EvrakKaydi): Promise<EvrakKaydi> {
  kontrol(
    await (await db()).from("evraklar").upsert({
      musteri_id: k.musteriId,
      donem: k.donem,
      geldi: k.geldi,
      gelis_tarihi: k.gelisTarihi,
      guncelleme: new Date().toISOString(),
    }),
  );
  return k;
}

// ---------- Beyanname ----------

export async function beyannameleriGetir(donemler: string[]): Promise<BeyannameKaydi[]> {
  const satirlar = kontrol(
    await (await db()).from("beyanname_kayitlari").select("musteri_id, tur, donem, durum").in("donem", donemler),
  ) as { musteri_id: string; tur: BeyannameTuru; donem: string; durum: Durum }[];
  return satirlar.map((s) => ({ musteriId: s.musteri_id, tur: s.tur, donem: s.donem, durum: s.durum }));
}

export async function beyannameKaydet(k: BeyannameKaydi): Promise<BeyannameKaydi> {
  kontrol(
    await (await db()).from("beyanname_kayitlari").upsert({
      musteri_id: k.musteriId,
      tur: k.tur,
      donem: k.donem,
      durum: k.durum,
      guncelleme: new Date().toISOString(),
    }),
  );
  return k;
}
