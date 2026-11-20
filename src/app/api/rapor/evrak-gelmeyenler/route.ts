import { connection } from "next/server";
import ExcelJS from "exceljs";
import { buAy, donemYaz, telefonYaz } from "@/lib/bicim";
import { evrakiGelmeyenler } from "@/lib/hesap";
import { evraklariGetir, musterileriGetir } from "@/lib/veri";

/** Seçilen ayda (varsayılan: bu ay) evrakı gelmeyen müşterileri Excel dosyası olarak verir. */
export async function GET(istek: Request) {
  await connection(); // her istekte güncel veriyi oku
  const istenen = new URL(istek.url).searchParams.get("donem");
  const donem = istenen && /^\d{4}-(0[1-9]|1[0-2])$/.test(istenen) ? istenen : buAy();
  const [musteriler, evraklar] = await Promise.all([musterileriGetir(), evraklariGetir(donem)]);
  const liste = evrakiGelmeyenler(musteriler, evraklar, donem).sort((a, b) =>
    a.unvan.localeCompare(b.unvan, "tr"),
  );

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Evrakı Gelmeyenler");
  ws.addRow([`${donemYaz(donem)} – Evrakı Gelmeyen Müşteriler (${liste.length} müşteri)`]).font = {
    bold: true,
    size: 13,
  };
  ws.addRow([]);
  const baslik = ws.addRow(["Sıra", "Müşteri Unvanı", "Yetkili", "Telefon", "E-posta", "Sektör"]);
  baslik.font = { bold: true, color: { argb: "FFFFFFFF" } };
  baslik.eachCell((h) => {
    h.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A5F" } };
  });
  liste.forEach((m, i) =>
    ws.addRow([i + 1, m.unvan, m.yetkili, telefonYaz(m.telefon), m.eposta, m.sektor]),
  );
  [6, 38, 22, 18, 32, 14].forEach((g, i) => (ws.getColumn(i + 1).width = g));

  const icerik = await wb.xlsx.writeBuffer();
  const dosyaAdi = `evraki-gelmeyenler-${donem}.xlsx`;
  return new Response(icerik as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${dosyaAdi}"`,
      "Cache-Control": "no-store",
    },
  });
}
