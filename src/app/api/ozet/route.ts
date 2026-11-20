import { connection } from "next/server";
import { buAy, ceyrekBul } from "@/lib/bicim";
import { beyannameDurumlari, evrakiGelmeyenler } from "@/lib/hesap";
import { beyannameleriGetir, evraklariGetir, musterileriGetir } from "@/lib/veri";

export async function GET() {
  await connection(); // her istekte güncel veriyi oku
  const ay = buAy();
  const [musteriler, evraklar, kayitlar] = await Promise.all([
    musterileriGetir(),
    evraklariGetir(ay),
    beyannameleriGetir([ay, ceyrekBul(ay)]),
  ]);
  const durumlar = beyannameDurumlari(musteriler, kayitlar, ay);
  return Response.json({
    ay,
    toplamMusteri: musteriler.length,
    evrakiGelmeyen: evrakiGelmeyenler(musteriler, evraklar, ay).length,
    bekleyenBeyanname: durumlar.filter((d) => d.durum === "Bekliyor").length,
    gonderilmemisBeyanname: durumlar.filter((d) => d.durum !== "Gönderildi").length,
  });
}
