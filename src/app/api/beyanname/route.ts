import { connection } from "next/server";
import { ceyrekBul } from "@/lib/bicim";
import { BEYANNAME_TURLERI, DURUMLAR } from "@/lib/tipler";
import { beyannameKaydet, beyannameleriGetir } from "@/lib/veri";

const AY = /^\d{4}-(0[1-9]|1[0-2])$/;
const CEYREK = /^\d{4}-Q[1-4]$/;

/** ?ay=2026-11 -> o ayın KDV/Muhtasar kayıtları ve bağlı çeyreğin geçici vergi kayıtları */
export async function GET(istek: Request) {
  await connection(); // her istekte güncel veriyi oku
  const ay = new URL(istek.url).searchParams.get("ay") ?? "";
  if (!AY.test(ay)) return Response.json({ hata: "Geçersiz dönem." }, { status: 400 });
  return Response.json(await beyannameleriGetir([ay, ceyrekBul(ay)]));
}

export async function PUT(istek: Request) {
  const g = await istek.json();
  const tur = BEYANNAME_TURLERI.find((t) => t === g.tur);
  const durum = DURUMLAR.find((d) => d === g.durum);
  const donemUygun = tur === "GECICI" ? CEYREK.test(g.donem ?? "") : AY.test(g.donem ?? "");
  if (typeof g.musteriId !== "string" || !tur || !durum || !donemUygun)
    return Response.json({ hata: "Eksik veya hatalı bilgi." }, { status: 400 });
  return Response.json(await beyannameKaydet({ musteriId: g.musteriId, tur, donem: g.donem, durum }));
}
