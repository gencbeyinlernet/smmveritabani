// Gelen müşteri bilgisini kontrol eder. Hata varsa Türkçe mesaj döner.

import { sadeceRakam } from "./bicim";
import { BEYANNAME_TURLERI, type BeyannameTuru, type Musteri } from "./tipler";

export function musteriDogrula(
  g: Record<string, unknown>,
): { hata: string } | { musteri: Omit<Musteri, "id"> } {
  const metin = (k: string) => (typeof g[k] === "string" ? (g[k] as string).trim() : "");
  const telefon = metin("telefon");
  const eposta = metin("eposta");
  const ucret = Number(g.aylikUcret);

  if (!metin("unvan")) return { hata: "Unvan boş bırakılamaz." };
  if (telefon && sadeceRakam(telefon) !== telefon)
    return { hata: "Telefon yalnızca rakamlardan oluşmalıdır." };
  if (telefon && (telefon.length < 10 || telefon.length > 11))
    return { hata: "Telefon 10 veya 11 haneli olmalıdır." };
  if (eposta && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(eposta))
    return { hata: "E-posta adresi geçerli görünmüyor." };
  if (!Number.isFinite(ucret) || ucret < 0) return { hata: "Aylık ücret geçerli bir tutar olmalıdır." };

  const beyannameler = Array.isArray(g.beyannameler)
    ? BEYANNAME_TURLERI.filter((t) => (g.beyannameler as unknown[]).includes(t))
    : [];

  return {
    musteri: {
      unvan: metin("unvan"),
      vergiNo: metin("vergiNo"),
      sektor: metin("sektor"),
      mukellefiyetTuru: metin("mukellefiyetTuru"),
      yetkili: metin("yetkili"),
      telefon,
      eposta,
      aylikUcret: Math.round(ucret * 100) / 100,
      beyannameler: beyannameler as BeyannameTuru[],
    },
  };
}
