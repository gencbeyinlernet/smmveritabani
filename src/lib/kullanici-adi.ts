// Supabase girişte e-posta biçimi ister. Kullanıcı e-posta yazmaz;
// kullanıcı adı arka planda "ad@kullanici.invalid" biçimine çevrilir.
// ".invalid" uzantısı hiçbir zaman gerçek bir adrese gitmez.
export const KULLANICI_ALANI = "kullanici.invalid";

export const KULLANICI_ADI_KURALI = /^[a-z0-9._-]{3,30}$/;

export function kullaniciAdiDuzenle(ad: string): string {
  return ad.trim().toLowerCase();
}

export function kullaniciAdiHatasi(ad: string): string | null {
  if (!KULLANICI_ADI_KURALI.test(ad))
    return "Kullanıcı adı 3–30 karakter olmalı; yalnızca İngilizce küçük harf, rakam, nokta, alt çizgi ve tire içerebilir (ş, ğ, ü gibi harfler kullanılamaz).";
  return null;
}

export function kullaniciAdindanEposta(ad: string): string {
  return `${kullaniciAdiDuzenle(ad)}@${KULLANICI_ALANI}`;
}
