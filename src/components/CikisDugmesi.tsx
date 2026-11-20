"use client";

import { useRouter } from "next/navigation";
import { tarayiciIstemcisi } from "@/lib/supabase/tarayici";

export default function CikisDugmesi({ className = "" }: { className?: string }) {
  const router = useRouter();
  async function cikis() {
    await tarayiciIstemcisi().auth.signOut();
    router.replace("/giris");
    router.refresh();
  }
  return (
    <button type="button" onClick={cikis} className={className}>
      Çıkış
    </button>
  );
}
