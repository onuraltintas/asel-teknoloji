# Proje Gereksinim ve Geliştirme Dokümanı: ASEL TEKNOLOJİ

Bu doküman, **Asel Teknoloji** kurumsal ve dinamik web sitesinin **Claude (AI)** ile birlikte adım adım geliştirilmesi için hazırlanmış ana rehberdir. Geliştirme sürecinde Claude'a bu dokümandaki adımlar sırayla referans verilerek kod ürettirilecektir.

---

## 1. Proje Özeti & Teknoloji Yığını

* **Firma Adı:** Asel Teknoloji
* **Hizmet Alanları:** Güvenlik kamera sistemleri, yangın alarm sistemleri, internet altyapı sistemleri, etkileşimli tahta tamiri, X-Ray kapı geçiş sistemleri, bilgisayar satış ve tamiri, yazıcı satış/tamiri, fotokopi makinesi satış/tamiri.
* **Hedef:** Tamamen dinamik, admin panelli, SEO uyumlu, servis/arıza takibi yapabilen kurumsal web sitesi.
* **Teknoloji Yığını (Tech Stack):**
    * **Backend:** .NET 8.0 (C#) Web API
    * **Frontend:** Angular (v17/v18)
    * **Veritabanı:** PostgreSQL
    * **Kimlik Doğrulama:** JWT (JSON Web Token)
    * **Mimari:** Clean Architecture (Domain, Application, Infrastructure, WebAPI) veya Katmanlı Mimari (N-Tier)

---

## 2. Veritabanı Şeması (PostgreSQL)

Claude ile veritabanı katmanını oluştururken kullanılacak tablo yapıları ve ilişkileri:

### 2.1. Tablolar ve Alanlar

* **Users (Yöneticiler):** `Id` (Guid), `Username`, `Email`, `PasswordHash`, `CreatedAt`
* **Sliders:** `Id` (Int), `Title`, `SubTitle`, `ImageUrl`, `TargetUrl`, `DisplayOrder`, `IsActive`
* **Categories:** `Id` (Int), `Name`, `Slug` (SEO dostu URL), `IsActive`
* **Services:** `Id` (Int), `CategoryId` (FK), `Title`, `Slug`, `Description` (Rich Text), `ShortDescription`, `ImageUrl`, `IsActive`, `MetaTitle`, `MetaDescription`
* **TechnicalServices (Arıza/Talep Formu):** `Id` (Int), `CustomerName`, `CustomerPhone`, `CustomerEmail`, `DeviceType` (Yazıcı, Tahta, PC vb.), `IssueDescription`, `ServiceCode` (Benzersiz sorgulama kodu), `Status` (0: Beklemede, 1: İşlemde, 2: Parça Bekleniyor, 3: Tamamlandı, 4: İptal), `AdminNote`, `CreatedAt`
* **BlogPosts:** `Id` (Int), `Title`, `Slug`, `Content` (Rich Text), `ImageUrl`, `CreatedAt`, `IsActive`
* **Messages (İletişim Formu):** `Id` (Int), `FullName`, `Email`, `Phone`, `Subject`, `Body`, `IsRead`, `CreatedAt`
* **Settings:** `Id` (Int), `Title`, `Description`, `Keywords`, `LogoUrl`, `FaviconUrl`, `Phone`, `Email`, `Address`, `MapsEmbedCode`, `Facebook`, `Instagram`, `Linkedin`

---

## 3. Backend Geliştirme Yol Haritası (.NET Web API)

### Adım 1: Proje Kurulumu ve Veritabanı Bağlantısı
* Core, Data, Business ve API katmanlarının ayrılması.
* `Npgsql.EntityFrameworkCore.PostgreSQL` paketinin entegrasyonu.
* `DbContext` sınıfının ve Migration süreçlerinin yazılması.

### Adım 2: Core & Entity Yapıları
* BaseEntity (Id, CreatedAt, IsActive) tanımlanarak yukarıdaki tabloların nesneye yönelik (Entity) modellerinin oluşturulması.

### Adım 3: JWT tabanlı Authentication (Kimlik Doğrulama)
* `Microsoft.AspNetCore.Authentication.JwtBearer` entegrasyonu.
* Login endpoint'i, password hashing (BCrypt veya Identity) mekanizması.

### Adım 4: Controller'ların ve Repository'lerin Yazılması
* `SliderController`, `ServiceController`, `CategoryController`, `TechnicalServiceController`, `BlogPostController`, `MessageController`, `SettingController`.
* Tüm admin operasyonları için `[Authorize]` attribute'ünün eklenmesi. Ziyaretçi istekleri (GET) için `[AllowAnonymous]` yapılması.

---

## 4. Frontend Geliştirme Yol Haritası (Angular)

### Adım 1: Proje İskeleti ve Modüller
* `ng new asel-teknoloji-ui` ile projenin başlatılması.
* Modüllerin (veya Standalone Component yapısının) kurgulanması: `Layouts`, `UI (Ziyaretçi)`, `Admin (Yönetim Panel)`, `Core (Interceptors, Guards, Services)`.

### Adım 2: Servisler ve Interceptor
* API istekleri için `ApiService` ve `AuthService` yazılması.
* Giden her admin isteğine token eklemek için `JwtInterceptor` yapısının kurulması.
* Admin paneli rotalarını korumak için `AuthGuard` yazılması.

### Adım 3: Ziyaretçi Sayfalarının Tasarımı (UI Component'leri)
* **Home Component:** Slider bileşeni (Ngx-Bootstrap veya Swiper), Hizmet Kartları, Neden Biz?, Son Bloglar.
* **ServiceDetail Component:** Dinamik router parametresine göre (`/hizmet/:slug`) backend'den veriyi çeken ve gösteren yapı.
* **ServiceStatus Component (Cihaz Durum Sorgulama):** Müşterinin `ServiceCode` girerek cihazının durumunu, teknik servis aşamasını izleyebileceği interaktif arayüz.
* **Contact Component:** İletişim formu (Reactive Forms) ve validasyonlar.

### Adım 4: Admin Paneli Tasarımı
* Sidebar ve Navbar içeren temiz bir dashboard düzeni.
* CRUD Ekranları: Tablolu listeleme (DataTables veya basit HTML table + pagination), Ekleme/Düzenleme formları (zengin metin editörü entegrasyonu ile).

---

## 5. SEO, Google Görünürlüğü ve LLM Keşfedilebilirliği

Bu bölüm, sitenin hem arama motorlarında hem de yapay zeka modellerinde (ChatGPT, Gemini, Claude vb.) bulunabilirliğini artırmak için uygulanması gereken teknik ve içerik gereksinimlerini kapsamaktadır.

### 5.1. Backend – Teknik SEO Altyapısı

* **Sitemap.xml Endpoint'i:** `/sitemap.xml` yolunda dinamik XML sitemap üretilmesi. Tüm aktif hizmet sayfaları (`/hizmet/:slug`), blog yazıları ve statik sayfaların URL, `lastmod` ve `changefreq` değerleriyle dahil edilmesi. Controller otomatik üretmeli, Manuel güncelleme gerekmemeli.
* **Robots.txt Endpoint'i:** `/robots.txt` yolunda `User-agent`, `Disallow` (admin panel rotaları) ve `Sitemap` direktiflerini içeren statik yanıt.
* **Canonical URL Header'ı:** Her API yanıtında veya sayfa meta'sında canonical URL bilgisinin doğru şekilde iletilmesi.
* **Structured Data (JSON-LD) için API Desteği:** Frontend'in kolayca JSON-LD oluşturabilmesi için servis detay ve blog endpoint'lerinde `schema.org` uyumlu alan adları kullanılması (`name`, `description`, `image`, `datePublished` vb.).

### 5.2. Frontend – Angular SSR (Server-Side Rendering)

Angular'ın varsayılan CSR (Client-Side Rendering) yapısı Google tarafından indekslenemez. SEO için SSR zorunludur.

* **Angular Universal / `@angular/ssr` Entegrasyonu:** `ng add @angular/ssr` ile SSR'ın projeye eklenmesi. Ziyaretçi sayfaları (`HomeComponent`, `ServiceDetailComponent`, `BlogDetailComponent`, `ContactComponent`) sunucu tarafında render edilmeli.
* **`TransferState` Kullanımı:** Sunucuda çekilen API verisinin tarayıcıya aktarılması, çift istek yapılmaması için `TransferState` API'sinin kullanılması.
* **Admin paneli SSR dışında tutulmalıdır** — performans için `[Authorize]` gerektiren sayfalar CSR kalabilir.

### 5.3. Frontend – Meta Etiketleri ve Open Graph

Her sayfa için dinamik meta yönetimi `@angular/platform-browser` üzerindeki `Meta` ve `Title` servisleriyle yapılmalıdır.

* **Temel Meta Etiketleri:** `<title>`, `<meta name="description">`, `<meta name="keywords">` her sayfaya özel olarak ayarlanmalı. Değerler backend'deki `MetaTitle`, `MetaDescription` alanlarından gelmeli.
* **Open Graph Etiketleri:** `og:title`, `og:description`, `og:image`, `og:url`, `og:type` — sosyal medya paylaşımlarında önizleme için.
* **Twitter Card Etiketleri:** `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`.
* **Canonical Link:** `<link rel="canonical" href="...">` her sayfada doğru URL'ye işaret etmeli.

### 5.4. Structured Data (JSON-LD Schema.org)

Arama motorlarının ve LLM'lerin içeriği anlamlandırması için sayfaya gömülü JSON-LD blokları eklenmelidir.

* **`LocalBusiness` Schema:** Ana sayfa ve iletişim sayfasına firma adı, adres, telefon, e-posta, coğrafi koordinat ve çalışma saatlerini içeren `LocalBusiness` (veya daha spesifik `ElectronicsStore`) şeması eklenmelidir.
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Asel Teknoloji",
  "telephone": "+90-XXX-XXX-XXXX",
  "address": { "@type": "PostalAddress", "addressLocality": "...", "addressCountry": "TR" },
  "url": "https://aseltekno.com"
}
```
* **`Service` Schema:** Her hizmet detay sayfasına `Service` şeması eklenmelidir; `name`, `description`, `provider` (firma bilgisi) alanlarıyla.
* **`Article` / `BlogPosting` Schema:** Blog sayfalarına `datePublished`, `author`, `headline`, `image` alanlarını içeren şema eklenmelidir.
* **`FAQPage` Schema:** Sıkça sorulan sorular bölümü oluşturulursa (örn. "Teknik servis ne kadar sürer?") `FAQPage` şemasıyla işaretlenmelidir — Google arama sonuçlarında Featured Snippet'a girebilir.
* **`BreadcrumbList` Schema:** Hizmet ve blog detay sayfalarında ekmek kırıntısı navigasyonuna şema eklenmesi.

### 5.5. LLM Keşfedilebilirliği – llms.txt

LLM'lerin (ChatGPT, Claude, Gemini, Perplexity vb.) bir web sitesini tarayıp içeriğini anlayabilmesi için yeni bir standart olan `llms.txt` dosyası önerilmektedir.

* **`/llms.txt` Statik Dosyası:** Sitenin kök dizininde, sade Markdown formatında, firmanın ne yaptığını, hangi sayfalara erişilebileceğini ve önemli içerikleri özetleyen bir dosya yayınlanması.

Örnek içerik:
```
# Asel Teknoloji

> Güvenlik kamera, yangın alarm, internet altyapı sistemleri, teknik servis ve bilişim çözümleri sunan kurumsal teknoloji firması.

## Hizmetler
- [Güvenlik Kamera Sistemleri](/hizmet/guvenlik-kamera)
- [Yangın Alarm Sistemleri](/hizmet/yangin-alarm)
- [Internet Altyapı Sistemleri](/hizmet/internet-altyapi)
- [Etkileşimli Tahta Tamiri](/hizmet/etkilesimli-tahta)
- [X-Ray Kapı Geçiş Sistemleri](/hizmet/x-ray-kapi)
- [Bilgisayar Satış ve Tamiri](/hizmet/bilgisayar)
- [Yazıcı / Fotokopi Satış ve Tamiri](/hizmet/yazici-fotokopi)

## Teknik Servis Takibi
Cihaz durumunuzu sorgulamak için: [/servis-takip](/servis-takip)

## İletişim
[/iletisim](/iletisim)
```

* **`/llms-full.txt` (Opsiyonel):** Tüm hizmet açıklamalarını, blog içeriklerini ve SSS'yi kapsayan tam içerik versiyonu. Backend'den dinamik olarak üretilip önbelleğe alınabilir.

### 5.6. Performans ve Core Web Vitals

Google'ın sıralama algoritması Core Web Vitals metriklerini doğrudan kullanmaktadır.

* **Lazy Loading:** Angular route'larında `loadComponent` / `loadChildren` ile sayfa bileşenleri lazy load edilmelidir.
* **Görsel Optimizasyonu:** Tüm görseller WebP formatına dönüştürülmeli, `srcset` ile responsive boyutlar sunulmalı, `loading="lazy"` attribute'ü eklenmelidir.
* **Bundle Boyutu:** `ng build --configuration production` çıktısı analiz edilmeli (`webpack-bundle-analyzer`), gereksiz bağımlılıklar kaldırılmalıdır.
* **HTTP Caching Header'ları:** .NET API üzerinden statik dosyalar için `Cache-Control`, görseller için uzun süreli önbellek header'ları ayarlanmalıdır.
* **Nginx Gzip/Brotli Sıkıştırma:** Sunucuda metin tabanlı dosyalar için sıkıştırma aktif edilmelidir.

### 5.7. Google Araçları Entegrasyonu

* **Google Search Console:** Site canlıya alındıktan sonra `google-site-verification` meta etiketi veya DNS TXT kaydıyla doğrulama yapılmalı, sitemap.xml gönderilmelidir.
* **Google Analytics 4 (GA4):** Angular projesine `gtag.js` entegre edilmeli, router olaylarına bağlı sayfa görüntüleme takibi yapılmalıdır.
* **Google My Business:** Firma fiziksel konumu varsa Google İşletme Profili oluşturulup yönetilmelidir — yerel aramalar için kritiktir.

---

## 6. Claude Cowork İletişim Kalıpları (Prompt Şablonları)

Claude ile çalışırken en verimli sonucu almak için aşağıdaki şablon komutları kopyalayıp kullanabilirsiniz:

### Backend için Örnek Prompt:
> "Sana verdiğim mimariye uygun olarak, .NET 8.0 Web API projesinde PostgreSQL kullanan `TechnicalServices` tablosu için Controller ve Business mantığını yazmanı istiyorum. Müşteriler dışarıdan arıza kaydı oluşturabilmeli (`AllowAnonymous`), ancak admin panelinden bu kayıtlar listelenebilmeli, durumları güncellenebilmeli ve admin notu eklenebilmeli (`Authorize`). DTO (Data Transfer Object) yapılarını ve EF Core LINQ sorgularını içerecek şekilde kodu üretir misin?"

### Frontend için Örnek Prompt:
> "Angular projemizde, teknik servis cihaz durum sorgulama ekranı (`ServiceStatusComponent`) hazırlıyoruz. Kullanıcı bir input alanına `ServiceCode` girecek, butona bastığında API'ye istek atılacak ve gelen cihaz durumuna göre (0: Beklemede, 1: Tamamlandı vb.) aşamalı bir durum çubuğu (stepper/progress bar) gösterilecek. HTML, TS ve CSS kodlarını clean-code prensiplerine uygun olarak yazar mısın?"

---

## 7. Canlıya Alım (Deployment) Kontrol Listesi

* [ ] PostgreSQL veritabanı yedeğinin uzak sunucuya (Ubuntu/Windows Server) yüklenmesi.
* [ ] .NET Web API projesinin production modunda publish edilmesi ve `appsettings.json` üzerindeki canlı veritabanı connection string'inin güvenli şekilde ayarlanması.
* [ ] Angular projesinin `ng build --configuration production` komutuyla derlenip Nginx veya IIS üzerinde yapılandırılması.
* [ ] SSL (Certbot / Let's Encrypt) kurulumunun tamamlanarak tüm trafiğin HTTPS'e yönlendirilmesi.
* [ ] `/sitemap.xml` ve `/robots.txt` endpoint'lerinin tarayıcıdan doğrulanması.
* [ ] `/llms.txt` dosyasının kök dizinde erişilebilir olduğunun kontrolü.
* [ ] Google Search Console'a site eklenmesi ve sitemap.xml gönderilmesi.
* [ ] GA4 izleme kodunun production ortamında çalıştığının doğrulanması.
* [ ] [PageSpeed Insights](https://pagespeed.web.dev) üzerinden Core Web Vitals skorlarının ölçülmesi (hedef: LCP < 2.5s, CLS < 0.1, INP < 200ms).
* [ ] Structured Data (JSON-LD) için [Google Rich Results Test](https://search.google.com/test/rich-results) araçıyla doğrulama yapılması.
* [ ] Nginx'te Gzip/Brotli sıkıştırmanın ve statik dosya cache header'larının aktif edilmesi.
