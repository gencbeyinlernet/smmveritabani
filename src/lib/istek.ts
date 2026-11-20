// Sayfaların API uçlarıyla konuşması için küçük yardımcı.
export async function api<T>(adres: string, secenek?: RequestInit): Promise<T> {
  const yanit = await fetch(adres, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    ...secenek,
  });
  if (yanit.status === 401 && typeof window !== "undefined") {
    // Oturum süresi dolduysa sayfayı tamamen yenileyerek girişe dön.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/giris";
  }
  const veri = await yanit.json().catch(() => ({}));
  if (!yanit.ok) throw new Error(veri.hata ?? "Bir hata oluştu, lütfen tekrar deneyin.");
  return veri as T;
}
