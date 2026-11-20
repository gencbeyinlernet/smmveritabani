"use client";

import { useSyncExternalStore } from "react";

const bosAbone = () => () => {};

/**
 * İçeriği yalnızca tarayıcıda gösterir.
 * "Bu ay" gibi bugünün tarihine bağlı hesaplar sunucuda değil,
 * kullanıcının bilgisayarındaki tarihe göre yapılsın diye kullanılır.
 */
export default function TarayicidaGoster({ children }: { children: React.ReactNode }) {
  const tarayicida = useSyncExternalStore(bosAbone, () => true, () => false);
  if (!tarayicida) return <p className="text-sm text-gray-500">Yükleniyor…</p>;
  return <>{children}</>;
}
