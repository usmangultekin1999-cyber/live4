# ErosMaç Cloudflare Worker Yayın Sitesi

Cloudflare Workers üzerinde GitHub bağlantısıyla çalışacak React/Vite arayüzü. Maç listesi ve yayın adresleri API'den çekilir; API anahtarı tarayıcıya gömülmez, Worker ortam değişkeninde saklanır.

> Not: Bu proje yalnızca yayın haklarına sahip olduğunuz veya kullanma izniniz olan yayın kaynakları için hazırlanmıştır.

## Özellikler

- API proxy: `/api/matches`
- API anahtarı frontend'e yazılmaz; `MATCH_API_KEY` Cloudflare değişkeninden okunur.
- Kategori filtreleri, takım/lig araması, otomatik yenileme ve responsive kart tasarımı vardır.
- Player HLS, DASH ve MP4/WebM gibi direkt video kaynaklarını destekler.
- Video player açamazsa iframe fallback modunu dener.

## Dosya yapısı

```txt
worker/index.js             Cloudflare Worker API proxy + static asset router
src/App.jsx                 Ana uygulama
src/components              Kart, kategori ve player bileşenleri
src/styles.css              Görsel tasarım
public/_headers             Güvenlik başlıkları
wrangler.toml               Worker deploy ayarı
```

## Cloudflare Worker Git deploy

Cloudflare ekranında görünen alanları şöyle bırak:

- Project name: `live3`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

Worker deploy için `wrangler.toml` içindeki `[assets] directory = "./dist"` ayarı Vite build çıktısını Cloudflare Worker Static Assets olarak yayınlar.

## Environment variables

Cloudflare'da Worker projesine şu değişkenleri ekle:

- `MATCH_API_KEY` = kendi API anahtarın
- `MATCH_API_URL` = `https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php` *(opsiyonel; varsayılan zaten budur)*

API anahtarını `.env`, `.dev.vars` veya GitHub dosyasına koyma.

## Yerel çalıştırma

```bash
npm install
npm run build
npx wrangler dev
```

Yerelde API anahtarı için `.dev.vars` dosyası oluştur:

```txt
MATCH_API_KEY="API_ANAHTARIN"
MATCH_API_URL="https://adbf5a778175ee757c34d0eba4e932bc.sbs/erosmac/api.php"
```

## Player notları

Player şu sırayla çalışır:

1. `.mp4`, `.webm`, `.ogg` gibi direkt video kaynakları native `<video>` ile açılır.
2. `.mpd` kaynakları DASH player ile açılır.
3. Diğer kaynaklar önce HLS player ile denenir.
4. HLS player kaynağı okuyamazsa iframe fallback açılır.

Yayın kaynağı CORS, DRM veya domain izinleri nedeniyle tarayıcıya izin vermiyorsa frontend tarafında bunu aşmak mümkün değildir; yayın servisinde izinlerin düzenlenmesi gerekir.
