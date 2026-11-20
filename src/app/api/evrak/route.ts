import { connection } from "next/server";
import { evrakKaydet, evraklariGetir } from "@/lib/veri";

const DONEM = /^\d{4}-(0[1-9]|1[0-2])$/;
const TARIH = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(istek: Request) {
  await connection(); // her istekte güncel veriyi oku
  const donem = new URL(istek.url).searchParams.get("donem") ?? "";
  if (!DONEM.test(donem)) return Response.json({ hata: "Geçersiz dönem." }, { status: 400 });
  return Response.json(await evraklariGetir(donem));
}

export async function PUT(istek: Request) {
  const g = await istek.json();
  if (typeof g.musteriId !== "string" || !DONEM.test(g.donem ?? ""))
    return Response.json({ hata: "Eksik bilgi." }, { status: 400 });
  const geldi = Boolean(g.geldi);
  const gelisTarihi = geldi && TARIH.test(g.gelisTarihi ?? "") ? g.gelisTarihi : null;
  if (geldi && !gelisTarihi)
    return Response.json({ hata: "Geliş tarihi girilmelidir." }, { status: 400 });
  return Response.json(await evrakKaydet({ musteriId: g.musteriId, donem: g.donem, geldi, gelisTarihi }));
}
