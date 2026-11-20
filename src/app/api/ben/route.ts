import { connection } from "next/server";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

/** Giriş yapan kullanıcının adı ve yetkileri (menüde gösterilir). */
export async function GET() {
  await connection();
  const supabase = await sunucuIstemcisi();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ hata: "Lütfen giriş yapın." }, { status: 401 });
  const { data } = await supabase
    .from("profiller")
    .select("kullanici_adi, onayli, yonetici")
    .eq("id", user.id)
    .maybeSingle();
  return Response.json({
    kullaniciAdi: data?.kullanici_adi ?? "",
    onayli: Boolean(data?.onayli),
    yonetici: Boolean(data?.onayli && data?.yonetici),
  });
}
