import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

type Baglam = RouteContext<"/api/yonetici/kullanicilar/[id]">;

/** Onay / yönetici yetkisi değiştirme. */
export async function PATCH(istek: Request, ctx: Baglam) {
  const { id } = await ctx.params;
  const g = await istek.json();
  const degisiklik: { onayli?: boolean; yonetici?: boolean } = {};
  if (typeof g.onayli === "boolean") degisiklik.onayli = g.onayli;
  if (typeof g.yonetici === "boolean") degisiklik.yonetici = g.yonetici;
  if (!Object.keys(degisiklik).length) return Response.json({ hata: "Değişiklik yok." }, { status: 400 });

  const supabase = await sunucuIstemcisi();
  const { data, error } = await supabase.from("profiller").update(degisiklik).eq("id", id).select("id");
  if (error || !data?.length)
    return Response.json({ hata: "Güncellenemedi. Kendi hesabınızı değiştiremezsiniz." }, { status: 400 });
  return Response.json({ tamam: true });
}

/** Şifre sıfırlama. */
export async function POST(istek: Request, ctx: Baglam) {
  const { id } = await ctx.params;
  const { yeniSifre } = await istek.json();
  if (typeof yeniSifre !== "string" || yeniSifre.length < 6)
    return Response.json({ hata: "Şifre en az 6 karakter olmalıdır." }, { status: 400 });
  const supabase = await sunucuIstemcisi();
  const { error } = await supabase.rpc("yonetici_sifre_degistir", { hedef: id, yeni_sifre: yeniSifre });
  if (error) return Response.json({ hata: error.message }, { status: 400 });
  return Response.json({ tamam: true });
}

/** Kullanıcıyı silme. */
export async function DELETE(_istek: Request, ctx: Baglam) {
  const { id } = await ctx.params;
  const supabase = await sunucuIstemcisi();
  const { error } = await supabase.rpc("yonetici_kullanici_sil", { hedef: id });
  if (error) return Response.json({ hata: error.message }, { status: 400 });
  return Response.json({ tamam: true });
}
