# 🐝 Čebelarski Pomočnik

Sodobna aplikacija za upravljanje čebeljaka z AI analizo slik, tehtnicami in sledenjem bolezni.

## ✨ Funkcionalnosti

### 📸 AI Analiza Slik
- Avtomatska detekcija bolezni čebel
- Prepoznavanje matice (queen detection)
- Analiza zdravja čebeljega roja
- Podrobna poročila z priporočili

### 🏘️ Upravljanje Panjev
- Dodajanje in urejanje panjev
- Sledenje statusu panja (aktiven, šibek, bolnih, itd.)
- Lokacije in opombe
- Zadnja inspekcija

### 📊 Inspekcije
- Podrobni zapisi inspekcij
- S fotografijami in AI analizo
- Podatki o številu čebel, medu, osemenju
- Zgodovina vseh inspekcij

### ⚖️ Daljinske Tehtnice
- Integracija z daljinskimi tehtnicami
- Samodejno branje uteži
- Graf teže v času
- Analiza trendov

### 🦠 Baza Bolezni
- Informacije o pogostih boleznih
- Simptomi, zdravljenje in preventiva
- Integracija z AI analizo

### 📱 PWA (Progressive Web App)
- Namestitev kot aplikacija na telefon
- Deluje brez interneta (delno)
- Hitra in responzivna

## 🚀 Hitri začetek

### Lokalni razvoj

```bash
# Namestite odvisnosti
bun install

# Zaženite razvojni strežnik
bun run dev
```

Aplikacija bo dostopna na: http://localhost:3000

### Namestitev na telefon

Glejte: [DEPLOY_NAVODILA.md](./DEPLOY_NAVODILA.md)

## 🛠️ Tehnologije

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Database**: Prisma ORM + SQLite
- **AI**: z-ai-web-dev-sdk
- **Deployment**: Vercel (priporočeno)

## 📂 Struktura projekta

```
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Glavna stran
│   │   ├── layout.tsx    # Layout
│   │   └── api/          # API končne točke
│   ├── components/       # React komponente
│   │   └── ui/          # shadcn/ui komponente
│   ├── lib/             # Pomožne knjižnice
│   └── hooks/           # React hooks
├── prisma/              # Prisma nastavitve
├── db/                  # SQLite baza
├── public/              # Statične datoteke
│   ├── manifest.json     # PWA manifest
│   ├── icon-192.png     # Aplikacijska ikona
│   └── icon-512.png     # Aplikacijska ikona (XL)
└── DEPLOY_NAVODILA.md   # Navodila za deploy
```

## 🌐 API Končne Točke

### Panji
- `GET /api/hives` - Pridobi vse panje
- `POST /api/hives` - Dodaj nov panj

### Inspekcije
- `GET /api/inspections?hiveId=...` - Pridobi inspekcije za panj
- `POST /api/inspections` - Dodaj novo inspekcijo

### Slike
- `POST /api/inspection-images` - Dodaj sliko k inspekciji
- `POST /api/analyze-image` - Analiziraj sliko z AI

### Tehtnice
- `GET /api/scales` - Pridobi tehtnice
- `POST /api/scales` - Dodaj novo tehtnico
- `POST /api/scales/read` - Preberi težo

### Workflow
- `POST /api/workflow/inspection` - Popoln workflow: poslikaj → analiziraj → shrani → priporočila

## 🔧 Nastavitve

### Environment Variables

Kopirajte `.env.example` v `.env`:

```bash
cp .env.example .env
```

Nastavite spremenljivke:

```env
ZAI_API_KEY=your_api_key_here
DATABASE_URL="file:../db/custom.db"
```

### Prisma

```bash
# Push nastavitev v bazo
bun run db:push

# Generiraj Prisma Client
bun run db:generate
```

## 📱 Namestitev na telefon

Aplikacija deluje kot PWA (Progressive Web App).

### Android (Chrome)
1. Odprite v Chrome
2. Menu (⋮) → Dodaj na začetni zaslon

### iOS (Safari)
1. Odprite v Safari
2. Share → Dodaj na začetni zaslon

Več informacij: [DEPLOY_NAVODILA.md](./DEPLOY_NAVODILA.md)

## 🎨 UI/UX

- 🎨 Modern, minimalisten dizajn
- 📱 Popolnoma responziv
- 🌓 Podpora za temni način
- ⚡ Hitre prehode in animacije
- ♿ Dostopnost (ARIA, keyboard nav)

## 🤝 Prispevki

Pripravljeni na prispevke!

1. Fork-ajte projekt
2. Ustvarite feature branch (`git checkout -b feature/MyFeature`)
3. Commit-ajte spremembe (`git commit -m 'Add some MyFeature'`)
4. Push-ajte na branch (`git push origin feature/MyFeature`)
5. Odprite Pull Request

## 📄 Licenca

MIT License - prosti za uporabo in spremembe

## 🐞 Težave?

Za težave v razvoju:
1. Preverite `dev.log` v projektni mapi
2. Zaženite `bun run lint` za preverjanje kode
3. Preverite .env nastavitve

## 📞 Podpora

Če imate vprašanja ali predloge:
- Odprite Issue na GitHubu
- Pišite na support@cebelar.si (primer)

---

**Narejeno z ❤️ za slovenske čebelare**

*Next.js 16 • TypeScript • Tailwind CSS • Prisma • z-ai-web-dev-sdk*
