// Uygulamadaki tüm kayıt türlerinin tanımı.
// Supabase'e geçerken tablolar bu yapıya göre oluşturulacak.

export const BEYANNAME_TURLERI = ["KDV", "MUHTASAR", "GECICI"] as const;
export type BeyannameTuru = (typeof BEYANNAME_TURLERI)[number];

export const BEYANNAME_ADLARI: Record<BeyannameTuru, string> = {
  KDV: "KDV",
  MUHTASAR: "Muhtasar",
  GECICI: "Geçici Vergi",
};

export const DURUMLAR = ["Bekliyor", "Hazırlandı", "Onaylandı", "Gönderildi"] as const;
export type Durum = (typeof DURUMLAR)[number];

export const MUKELLEFIYET_TURLERI = [
  "Kurumlar Vergisi",
  "Gelir Vergisi (Bilanço)",
  "Gelir Vergisi (İşletme)",
] as const;

export type Musteri = {
  id: string;
  unvan: string;
  vergiNo: string;
  sektor: string;
  mukellefiyetTuru: string;
  yetkili: string;
  telefon: string; // yalnızca rakam, ör. 05550000001
  eposta: string;
  aylikUcret: number;
  beyannameler: BeyannameTuru[]; // müşterinin verdiği beyannameler
};

export type EvrakKaydi = {
  musteriId: string;
  donem: string; // "2026-11"
  geldi: boolean;
  gelisTarihi: string | null; // "2026-11-05"
};

export type BeyannameKaydi = {
  musteriId: string;
  tur: BeyannameTuru;
  donem: string; // KDV/Muhtasar: "2026-11", Geçici Vergi: "2026-Q3"
  durum: Durum;
};

export type Veriler = {
  musteriler: Musteri[];
  evraklar: EvrakKaydi[];
  beyannameKayitlari: BeyannameKaydi[];
};
