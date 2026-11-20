import { connection } from "next/server";
import { sunucuIstemcisi } from "@/lib/supabase/sunucu";

/** Tüm kullanıcılar (yalnızca yönetici; veritabanı kuralı da bunu zorunlu kılar). */
export async function GET() {
  await connection();
  const supabase = await sunucuIstemcisi();
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("profiller")
    .select("id, kullanici_adi, onayli, yonetici, olusturulma")
    .order("olusturulma");
  if (error) return Response.json({ hata: "Kullanıcılar okunamadı." }, { status: 500 });
  return Response.json(
    data.map((p) => ({
      id: p.id,
      kullaniciAdi: p.kullanici_adi,
      onayli: p.onayli,
      yonetici: p.yonetici,
      olusturulma: p.olusturulma,
      ben: p.id === user?.id,
    })),
  );
}
