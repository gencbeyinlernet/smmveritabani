import { connection } from "next/server";
import { musteriDogrula } from "@/lib/dogrula";
import { musteriEkle, musterileriGetir } from "@/lib/veri";

export async function GET() {
  await connection(); // her istekte güncel veriyi oku
  return Response.json(await musterileriGetir());
}

export async function POST(istek: Request) {
  const sonuc = musteriDogrula(await istek.json());
  if ("hata" in sonuc) return Response.json(sonuc, { status: 400 });
  return Response.json(await musteriEkle(sonuc.musteri), { status: 201 });
}
