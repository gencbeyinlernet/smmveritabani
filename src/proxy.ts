// SAYFA KORUMASI: Her istekten önce çalışır.
// - Giriş yapmamış kişi yalnızca giriş/kayıt sayfalarını görebilir.
// - Onaylanmamış kullanıcı "onay bekliyor" sayfasına yönlendirilir.
// - Yönetici paneline yalnızca yöneticiler girebilir.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ACIK_SAYFALAR = ["/giris", "/kayit"];

export async function proxy(istek: NextRequest) {
  let yanit = NextResponse.next({ request: istek });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => istek.cookies.getAll(),
        setAll: (liste) => {
          liste.forEach(({ name, value }) => istek.cookies.set(name, value));
          yanit = NextResponse.next({ request: istek });
          liste.forEach(({ name, value, options }) => yanit.cookies.set(name, value, options));
        },
      },
    },
  );

  const yol = istek.nextUrl.pathname;
  const api = yol.startsWith("/api/");
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reddet = (durum: number, mesaj: string, hedef: string) => {
    const cevap = api
      ? NextResponse.json({ hata: mesaj }, { status: durum })
      : NextResponse.redirect(new URL(hedef, istek.url));
    yanit.cookies.getAll().forEach((c) => cevap.cookies.set(c));
    return cevap;
  };

  if (!user) {
    if (ACIK_SAYFALAR.includes(yol)) return yanit;
    return reddet(401, "Lütfen giriş yapın.", "/giris");
  }

  if (ACIK_SAYFALAR.includes(yol)) return reddet(400, "Zaten giriş yaptınız.", "/");
  if (yol === "/api/ben") return yanit;

  const { data: profil } = await supabase
    .from("profiller")
    .select("onayli, yonetici")
    .eq("id", user.id)
    .maybeSingle();

  if (!profil?.onayli) {
    if (yol === "/onay-bekliyor") return yanit;
    return reddet(403, "Hesabınız henüz onaylanmadı.", "/onay-bekliyor");
  }
  if (yol === "/onay-bekliyor") return reddet(400, "Hesabınız onaylı.", "/");

  if ((yol.startsWith("/yonetici") || yol.startsWith("/api/yonetici")) && !profil.yonetici)
    return reddet(403, "Bu bölüm yalnızca yöneticiler içindir.", "/");

  return yanit;
}

export const config = {
  // Next.js'in kendi dosyaları ve resim dosyaları (logo gibi) hariç her şey korunur.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)"],
};
