"use client";

import { useState } from "react";
import { BarChart3, Download, FileWarning } from "lucide-react";
import SayfaBasligi from "@/components/SayfaBasligi";
import DonemSecici from "@/components/DonemSecici";
import TarayicidaGoster from "@/components/TarayicidaGoster";
import { buAy, donemYaz } from "@/lib/bicim";

export default function RaporlarSayfasi() {
  return (
    <TarayicidaGoster>
      <RaporIcerik />
    </TarayicidaGoster>
  );
}

function RaporIcerik() {
  const [donem, setDonem] = useState(buAy());
  return (
    <div>
      <SayfaBasligi ikon={BarChart3} renk="bg-rose-100 text-rose-600" baslik="Raporlar" aciklama="Hazır raporları Excel dosyası olarak indirin." />
      <div className="kart space-y-5 p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-vurgu-50 text-vurgu-500">
            <FileWarning className="h-5 w-5" />
          </span>
          <div>
          <h2 className="font-semibold text-slate-900">Evrakı Gelmeyen Müşteriler</h2>
          <p className="text-sm text-gray-500">
            Seçilen ayda evrakı henüz gelmemiş müşterilerin unvan, yetkili, telefon ve e-posta
            bilgilerini Excel dosyası olarak indirir.
          </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <DonemSecici deger={donem} degisti={setDonem} />
          <a className="dugme-vurgu" href={`/api/rapor/evrak-gelmeyenler?donem=${donem}`}>
            <Download className="h-4 w-4" />
            {donemYaz(donem)} listesini Excel olarak indir
          </a>
        </div>
      </div>
    </div>
  );
}
