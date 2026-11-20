// Sunucu tarafı Supabase bağlantısı: giriş yapan kullanıcının oturumuyla çalışır,
// bu yüzden veritabanındaki güvenlik kuralları (RLS) her istekte uygulanır.
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function sunucuIstemcisi() {
  const cerezler = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cerezler.getAll(),
        setAll: (liste) => {
          try {
            liste.forEach(({ name, value, options }) => cerezler.set(name, value, options));
          } catch {
            // Oturum yenilemesi proxy.ts içinde yapılır.
          }
        },
      },
    },
  );
}
