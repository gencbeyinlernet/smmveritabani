# Müşteri ve Evrak Takip · Novarge

Mali müşavirlik bürosu için müşteri, aylık evrak ve beyanname takip uygulaması.
Next.js + Supabase ile çalışır; Vercel'de yayımlanmaya hazırdır.

## Özellikler

- Kullanıcı adı ve şifre ile giriş; yeni kayıtlar yönetici onayından sonra kullanılabilir
- Müşteri listesi: ekleme, düzenleme, arama, süzme
- Aylık evrak takibi ve geliş tarihi
- KDV, Muhtasar ve Geçici Vergi beyanname durumları
- Ana sayfa özeti ve "evrakı gelmeyenler" Excel raporu
- Yönetici paneli: onaylama, yetki verme, şifre yenileme, kullanıcı silme

## 1) Veritabanı kurulumu (Supabase)

Supabase > **SQL Editor** > **New query** içine `sql-kod.txt` dosyasının tamamını yapıştırıp **Run**'a basın.

## 2) Bilgisayarda çalıştırma

1. `.env.example` dosyasını kopyalayıp adını `.env.local` yapın ve değerleri doldurun.
2. `npm install` (yalnızca ilk sefer)
3. `npm run dev`
4. Tarayıcıda http://localhost:3000

## 3) Vercel'de yayımlama

1. https://vercel.com adresinde GitHub hesabınızla giriş yapın.
2. **Add New… > Project** > bu depoyu (`smmveritabani`) seçip **Import**'a basın.
3. **Environment Variables** bölümüne şu iki değeri ekleyin
   (Supabase > Project Settings > API):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**'a basın. Birkaç dakika sonra uygulamanın internet adresi verilir.

## Güvenlik notları

- `.env` / `.env.local` dosyaları Git'e eklenmez; gizli bilgiler yalnızca orada ve Vercel ayarlarında tutulur.
- Veritabanı tablolarında satır düzeyinde güvenlik (RLS) açıktır: yalnızca giriş yapmış ve onaylanmış kullanıcılar veriye erişebilir.
- Depodaki örnek müşteri verileri uydurmadır.
