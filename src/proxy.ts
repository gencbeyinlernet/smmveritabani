// SAYFA KORUMASI: Her istekten önce çalışır.
// - Giriş yapmamış kişi yalnızca giriş/kayıt sayfalarını görebilir.
// - Onaylanmamış kullanıcı "onay bekliyor" sayfasına yönlendirilir.
// - Yönetici paneline yalnızca yöneticiler girebilir.
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ACIK_SAYFALAR = ["/giris", "/kayit"];

/** Supabase ayarları eksikse çökmek yerine ne yapılacağını anlatan sayfa. */
function ayarEksikSayfasi() {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kurulum eksik</title></head>
<body style="font-family:system-ui,sans-serif;background:#f5f7fb;color:#1e293b;display:grid;place-items:center;min-height:100vh;margin:0;padding:16px">
<div style="max-width:520px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
<h1 style="margin:0 0 8px;font-size:20px">Veritabanı ayarları eksik</h1>
<p style="color:#475569;line-height:1.6">Uygulama Supabase bağlantı bilgilerini bulamadı. Vercel'de proje sayfasında
<b>Settings → Environment Variables</b> bölümüne şu iki değeri ekleyin:</p>
<ul style="line-height:1.8"><li><code>NEXT_PUBLIC_SUPABASE_URL</code></li><li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li></ul>
<p style="color:#475569;line-height:1.6">Ardından <b>Deployments</b> sekmesinde son yayının yanındaki <b>⋯ → Redeploy</b> ile yeniden yayımlayın.</p>
</div></body></html>`;
  return new NextResponse(html, { status: 503, headers: { "content-type": "text/html; charset=utf-8" } });
}

export async function proxy(istek: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnahtar = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnahtar) {
    console.error("Supabase ortam değişkenleri eksik: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return ayarEksikSayfasi();
  }

  let yanit = NextResponse.next({ request: istek });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnahtar,
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
