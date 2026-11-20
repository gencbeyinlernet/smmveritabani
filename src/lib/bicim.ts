// Para, telefon, tarih ve dönem biçimlendirme yardımcıları.

const paraBicimi = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 15000 -> "15.000,00 ₺" */
export function paraYaz(tutar: number): string {
  return `${paraBicimi.format(tutar)} ₺`;
}

/** Yalnızca rakamları bırakır. */
export function sadeceRakam(metin: string): string {
  return metin.replace(/\D/g, "");
}

/** "05550000001" -> "0 555 000 00 01" */
export function telefonYaz(tel: string): string {
  const r = sadeceRakam(tel);
  if (r.length === 11 && r.startsWith("0")) {
    return `${r[0]} ${r.slice(1, 4)} ${r.slice(4, 7)} ${r.slice(7, 9)} ${r.slice(9)}`;
  }
  return r;
}

/** "2026-11-05" -> "05.11.2026" */
export function tarihYaz(tarih: string | null): string {
  if (!tarih) return "";
  const [y, a, g] = tarih.split("-");
  return `${g}.${a}.${y}`;
}

export const AY_ADLARI = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];

/** Bugünün dönemi: "2026-11" */
export function buAy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Bugünün tarihi: "2026-11-20" */
export function bugun(): string {
  const d = new Date();
  return `${buAy()}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "2026-11" -> "Kasım 2026" */
export function donemYaz(donem: string): string {
  const [y, a] = donem.split("-");
  return `${AY_ADLARI[Number(a) - 1]} ${y}`;
}

/** Ayın bağlı olduğu geçici vergi dönemi: "2026-11" -> "2026-Q4" */
export function ceyrekBul(donem: string): string {
  const [y, a] = donem.split("-");
  return `${y}-Q${Math.ceil(Number(a) / 3)}`;
}

/** "2026-Q3" -> "2026 / 3. Dönem (Temmuz–Eylül)" */
export function ceyrekYaz(ceyrek: string): string {
  const [y, q] = ceyrek.split("-Q");
  const n = Number(q);
  return `${y} / ${n}. Dönem (${AY_ADLARI[(n - 1) * 3]}–${AY_ADLARI[n * 3 - 1]})`;
}

/** 4. çeyrek için geçici vergi beyannamesi verilmez (yıllık beyanname verilir). */
export function geciciVerilirMi(ceyrek: string): boolean {
  return !ceyrek.endsWith("Q4");
}

/** Seçim kutusu için son 12 ay + gelecek 1 ay, yeniden eskiye. */
export function donemSecenekleri(): string[] {
  const d = new Date();
  const liste: string[] = [];
  for (let i = 1; i >= -12; i--) {
    const t = new Date(d.getFullYear(), d.getMonth() + i, 1);
    liste.push(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`);
  }
  return liste;
}
