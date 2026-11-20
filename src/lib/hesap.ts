// Ana sayfa özeti ve rapor için ortak hesaplar.

import { ceyrekBul, geciciVerilirMi } from "./bicim";
import type { BeyannameKaydi, BeyannameTuru, Durum, EvrakKaydi, Musteri } from "./tipler";

/** Seçilen ayda evrakı gelmeyen müşteriler. */
export function evrakiGelmeyenler(musteriler: Musteri[], evraklar: EvrakKaydi[], donem: string) {
  const gelenler = new Set(
    evraklar.filter((e) => e.donem === donem && e.geldi).map((e) => e.musteriId),
  );
  return musteriler.filter((m) => !gelenler.has(m.id));
}

/** Bir beyanname türünün seçilen aya karşılık gelen dönemi (geçici vergi için çeyrek). */
export function beyannameDonemi(tur: BeyannameTuru, ay: string): string {
  return tur === "GECICI" ? ceyrekBul(ay) : ay;
}

/**
 * Seçilen ay için müşterilerin vermesi gereken tüm beyannameler ve durumları.
 * Kaydı olmayan beyanname "Bekliyor" sayılır.
 * 4. çeyrekte geçici vergi verilmediği için o aylarda geçici vergi listeye girmez.
 */
export function beyannameDurumlari(
  musteriler: Musteri[],
  kayitlar: BeyannameKaydi[],
  ay: string,
): { musteriId: string; tur: BeyannameTuru; donem: string; durum: Durum }[] {
  const sonuc = [];
  for (const m of musteriler) {
    for (const tur of m.beyannameler) {
      const donem = beyannameDonemi(tur, ay);
      if (tur === "GECICI" && !geciciVerilirMi(donem)) continue;
      const kayit = kayitlar.find(
        (k) => k.musteriId === m.id && k.tur === tur && k.donem === donem,
      );
      sonuc.push({ musteriId: m.id, tur, donem, durum: kayit?.durum ?? ("Bekliyor" as Durum) });
    }
  }
  return sonuc;
}
