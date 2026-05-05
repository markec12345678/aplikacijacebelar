# 🐝 Čebelarski Pomočnik - Navodila za namestitev na telefon

## 📱 Možnosti za uporabo na telefonu

### 1. **Deploy na Vercel (Brezplačno)** - Priporočeno ✅

To je najenostavnejši način za uporabo aplikacije na telefonu!

---

## 🚀 NAVODILA: Deploy na Vercel

### Korak 1: Ustvarite račun na Vercel

1. Odprite spletni stran: https://vercel.com
2. Kliknite na **"Sign Up"**
3. Ustvarite račun z:
   - GitHub računom (priporočeno)
   - Ali z Google/Email računom

---

### Korak 2: Povežite projekt z GitHub

#### Možnost A: Če imate projekt na GitHub

1. Prenesite projekt iz te seje na vaš računalnik:
   ```bash
   # Če imate Git, najprej ustvarite nov repozitorij na GitHub
   # Nato push-ajte projekt
   ```

2. Na Vercel:
   - Kliknite na **"Add New..."** → **"Project"**
   - Izberite vaš GitHub repozitorij
   - Kliknite **"Import"**

#### Možnost B: Ročni upload (brez GitHubja)

1. Namestite **Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. Iz projektnega mape:
   ```bash
   cd /home/z/my-project
   vercel login
   ```

3. Deploy-ajte:
   ```bash
   vercel --prod
   ```

---

### Korak 3: Konfiguracija na Vercelu

1. Vercel samodejno zazna Next.js projekt
2. Nastavitve so običajno OK po privzetih vrednostih:
   - **Framework Preset**: Next.js
   - **Build Command**: `bun run build`
   - **Output Directory**: `.next`
   - **Install Command**: `bun install`

3. Kliknite **"Deploy"**

---

### Korak 4: Počakajte na deploy (2-3 minute)

Vercel bo:
- Namestil odvisnosti
- Zgradil aplikacijo
- Deploy-al na CDN

---

### Korak 5: Dobil boste URL

Po uspešnem deployu boste dobili URL kot:
```
https://vas-projekt.vercel.app
```

To je vaša spletna aplikacija!

---

## 📱 Namestitev na telefon

### Android (Chrome)

1. Odprite aplikacijo v Chrome browserju
2. Obiščite: `https://vas-projekt.vercel.app`
3. Kliknite na **⋮** (tri pike) v zgornjem desnem kotu
4. Kliknite **"Dodaj na začetni zaslon"** ali **"Add to Home Screen"**
5. Potrdite z **"Dodaj"**

**Aplikacija bo sedaj kot ikona na začetnem zaslonu!** 🎉

### iOS (Safari)

1. Odprite aplikacijo v Safari
2. Obiščite: `https://vas-projekt.vercel.app`
3. Kliknite na **Share** (polje z puščico navzgor) na dnu
4. Povlecite navzdol in kliknite **"Dodaj na začetni zaslon"** ("Add to Home Screen")
5. Kliknite **"Dodaj"** ("Add")

**Aplikacija bo sedaj kot ikona na začetnem zaslonu!** 🎉

---

## 🔄 Nadgradnje aplikacije

Ko želite posodobiti aplikacijo:

1. Naredite spremembe v projektu
2. Push na GitHub (ali spet zaženite `vercel --prod`)
3. Vercel samodejno deploy-a posodobitve
4. Aplikacija na telefonu se osveži ob naslednjem odpiranju

---

## 💾 Kaj se shrani na telefon?

**Če ste aplikacijo namestili kot PWA:**
- ✓ Deluje brez internetne povezave (delno)
- ✓ Hitrejša kot spletna stran
- ✓ Izgleda kot prava aplikacija
- ✓ Ime svojo ikono

**Vendar:**
- Podatki (panji, inspekcije, slike) so shranjeni v spletni bazi
- Potrebujete internetno povezavo za:
  - Dodajanje panjev
  - AI analizo slik
  - Shranjevanje inspekcij
  - Branje tehtnic

---

## ⚠️ Pomembne opombe

### 1. Baza podatkov

Trenutno aplikacija uporablja lokalno SQLite bazo (file-based).
Za produkcijo vam svetujem:
- Uporabite **Supabase** (brezplačni plan)
- Ali **PostgreSQL** hosting

### 2. AI funkcionalnost

AI analiza slik zahteva API ključ za z-ai-web-dev-sdk.
Preverite, ali je konfiguriran v `.env` datoteki.

### 3. Tehtnice

Tehtnice delujejo le, če:
- Imate daljinsko tehtnico z dostopom preko IP naslova
- Tehtnica je dostopna iz interneta (ne samo lokalnega omrežja)

---

## 🔧 Dodatne možnosti

### A. Namestitev brez Git

Če nimate GitHub računa:

1. **Prenesite Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login na Vercel:**
   ```bash
   vercel login
   ```

3. **Iz projektnega mape zaženete:**
   ```bash
   cd /home/z/my-project
   vercel
   ```

4. sledite navodilom v terminalu

5. **Za produkcijo:**
   ```bash
   vercel --prod
   ```

### B. Custom Domain

Če želite svojo domeno:

1. Na Vercelu: Project → Settings → Domains
2. Dodajte svojo domeno (npr. `cebelar-moj.si`)
3. Sledite navodilom za DNS nastavitve

---

## 🎯 Hitri pregled korakov

```bash
# 1. Login na Vercel
vercel login

# 2. Deploy na produkcijo
cd /home/z/my-project
vercel --prod

# 3. Odprite URL v telefonu
# https://vas-projekt.vercel.app

# 4. Dodajte na začetni zaslon
# Android: Chrome → ⋮ → Dodaj na začetni zaslon
# iOS: Safari → Share → Dodaj na začetni zaslon
```

---

## 💡 Nasveti

### Za Hitri Test:
Uporabite `vercel` namesto `vercel --prod` za testno različico.

### Za Avtomatizacijo:
Povežite GitHub repozitorij z Vercelom za avtomatski deploy pri vsakem push-u.

### Za Monitoring:
Vercel nudi:
- Real-time analytics
- Error tracking
- Performance monitoring

---

## 🆘 Težave?

### "Deploy ni uspel"
- Preverite, ali ste v pravi mapi projekta
- Preverite, ali so vse odvisnosti nameščene: `bun install`

### "Aplikacija se ne odpira na telefonu"
- Preverite internetno povezavo
- Počakajte 1-2 minute, dokler se Vercel CDN osveži
- Poskusite osvežiti stran (pull-to-refresh)

### "Ni gumba za namestitev"
- Uporabite Chrome (Android) ali Safari (iOS)
- Preverite, da je HTTPS URL
- Nekateri brskalniki zahtevajo več obiskov strani

---

## 📞 Podpora

Za več pomoči:
- Vercel dokumentacija: https://vercel.com/docs
- Next.js PWA: https://nextjs.org/docs/app/api-reference/components/font

---

**Veseli se vaše Čebelarske aplikacije! 🐝🍯**

*Made with ❤️ for Slovenian beekeepers*
