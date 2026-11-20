"use client";

import { donemSecenekleri, donemYaz } from "@/lib/bicim";

export default function DonemSecici({
  deger,
  degisti,
}: {
  deger: string;
  degisti: (donem: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      Dönem:
      <select className="girdi !w-auto" value={deger} onChange={(e) => degisti(e.target.value)}>
        {donemSecenekleri().map((d) => (
          <option key={d} value={d}>
            {donemYaz(d)}
          </option>
        ))}
      </select>
    </label>
  );
}
