# CLAUDE.md

## Proje
Mali müşavirlik bürosu için **Müşteri ve Evrak Takip** uygulaması.

## Çalışma Kuralları

### İletişim
- Kullanıcı yazılımcı değildir. Tüm açıklamaları **sade Türkçe** ile yap; teknik terim kullanman gerekirse kısaca ne anlama geldiğini açıkla.
- Emin olmadığın yerde tahmin yürütme, kullanıcıya sor.

### Arayüz
- Arayüzdeki tüm yazılar (butonlar, menüler, uyarılar, hata mesajları vb.) **Türkçe** olmalı.

### Değişiklik Süreci
- Büyük bir değişiklikten önce planını göster ve kullanıcının onayını bekle.
- Her çalışan adımdan sonra Git ile kayıt noktası (commit) oluşturmayı öner.

### Güvenlik
- Şifre, API anahtarı gibi gizli bilgileri **asla kodun içine yazma**; bunları `.env` dosyasında tut.
- `.env` dosyasını Git'e ekleme (`.gitignore` içinde olmalı).

### Veri
- Gerçek kişisel veri kullanma. Tüm örnek veriler (isim, TC kimlik no, vergi no, telefon, adres vb.) uydurma olmalı.
