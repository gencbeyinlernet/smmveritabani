import { Hourglass, RefreshCw } from "lucide-react";
import CikisDugmesi from "@/components/CikisDugmesi";
import GirisKarti from "@/components/GirisKarti";

export default function OnayBekliyorSayfasi() {
  return (
    <GirisKarti baslik="Hesabınız onay bekliyor">
      <div className="flex gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-600">
          <Hourglass className="h-6 w-6" />
        </span>
        <p className="text-sm text-slate-600">
          Kaydınız alındı. Büro yöneticisi hesabınızı onayladıktan sonra uygulamayı kullanabilirsiniz.
          Onaylandığında bu sayfayı yenilemeniz yeterli.
        </p>
      </div>
      <div className="flex gap-2">
        {/* Tam yenileme: onay durumu yeniden kontrol edilsin */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className="dugme flex-1">
          <RefreshCw className="h-4 w-4" />
          Sayfayı yenile
        </a>
        <CikisDugmesi className="dugme-ikincil" />
      </div>
    </GirisKarti>
  );
}
