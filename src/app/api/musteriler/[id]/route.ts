import { musteriDogrula } from "@/lib/dogrula";
import { musteriGuncelle } from "@/lib/veri";

export async function PUT(istek: Request, ctx: RouteContext<"/api/musteriler/[id]">) {
  const { id } = await ctx.params;
  const sonuc = musteriDogrula(await istek.json());
  if ("hata" in sonuc) return Response.json(sonuc, { status: 400 });
  const guncel = await musteriGuncelle(id, sonuc.musteri);
  if (!guncel) return Response.json({ hata: "Müşteri bulunamadı." }, { status: 404 });
  return Response.json(guncel);
}
