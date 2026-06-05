# GitHub'a İlk Yükleme Rehberi

## 1. GitHub'da Repo Oluştur
- github.com → **New repository**
- Repository name: `asel-teknoloji`
- **Private** seçin
- "Add a README file" kutusunu **İŞARETLEMEYİN**
- **Create repository**

## 2. Git Kur (eğer kurulu değilse)
PowerShell (yönetici):
```
winget install --id Git.Git -e --source winget
```
Kurulum sonrası terminali yeniden başlatın.

## 3. Terminali Aç ve Komutları Çalıştır
```powershell
cd D:\Calismalar\AselTeknoloji

git init
git config user.email "onur40altintas@gmail.com"
git config user.name "Onur Altıntaş"

git add .
git status  # appsettings.json GÖZÜKMEMELI
git commit -m "initial commit: AselTeknoloji full-stack app"

git branch -M main
git remote add origin https://github.com/KULLANICIADINIZ/asel-teknoloji.git
git push -u origin main
```
> `KULLANICIADINIZ` yerine GitHub kullanıcı adınızı yazın.

## 4. Sunucuya Aldıktan Sonra
`appsettings.example.json` dosyasını kopyalayarak `appsettings.json` oluşturun:
```
cp appsettings.example.json appsettings.json
# Sonra gerçek değerleri doldurun
```

## Önemli Not
`appsettings.json` (veritabanı şifresi + JWT anahtarı içerir) `.gitignore`'a
eklendiğinden GitHub'a **yüklenmez**. Güvende.
