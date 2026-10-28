# NapierAtlas

**A free, informational guide to turning Napier grass into renewable Bio-CNG.**

NapierAtlas explains how Napier grass goes from the field to the digester to the fuel cylinder. It lets visitors compare five Napier varieties, see how often each one can be harvested, and estimate how much biomass, methane and Bio-CNG their land could produce. Every strain figure links to the published study or official page it comes from.

The site is non-commercial: no products for sale, no sign-ups and no contact forms.

---

## Features

| Feature | What it does |
|---|---|
| **Animated hero** | A live SVG diagram of the process (grass → digester → purifier → Bio-CNG cylinder) beside four key-fact cards with counting numbers. |
| **How It Works** | Six clickable steps from cultivation to compressed Bio-CNG, with three facts for each step. |
| **Cultivation lifecycle** | Pick a strain to see its growth milestones and a five-year harvest calendar. |
| **Strain explorer** | Cards for all five strains with search, a soil filter and sorting. Compare up to three strains side by side on a radar chart and table. |
| **Strain pages** | One page per strain with its key figures, highlights, soils, water needs and a numbered list of **sources**. |
| **Bio-CNG estimator** | Choose land size, soil, water supply and goal to get the recommended strain, fresh biomass, methane, Bio-CNG per day, fossil CO₂ avoided and a 5-year chart. |
| **Save & share** | Saves an estimate to the database and opens a page with a shareable link. |
| **Save as CSV / PDF** | Downloads the estimate as a spreadsheet, or prints a clean report that the browser can save as a PDF. |
| **View history** | Each visitor gets a private history link listing their saved estimates, which works on any device without logging in. Estimates can be opened, downloaded or removed. |
| **Loading and error pages** | A placeholder layout while data loads, and a friendly error page with "Try again". |

Motion respects the visitor's *reduce motion* setting, and the layout adapts from phones to wide screens.

---

## Tech stack

- **[Next.js 16](https://nextjs.org)** (App Router, Turbopack, Cache Components) with **React 19** and **TypeScript**
- **[Tailwind CSS 4](https://tailwindcss.com)** for styling
- **[Prisma 6](https://www.prisma.io)** with **MongoDB** (MongoDB Atlas)
- **[Framer Motion](https://motion.dev)** for card and number animations; CSS keyframes for the hero diagram
- **[Recharts](https://recharts.org)** for the 5-year projection and the comparison radar chart
- **[Lucide](https://lucide.dev)** icons and **clsx**

---

## Getting started

### Requirements

- Node.js 20 or newer
- A MongoDB database. A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works.

### 1. Install

```bash
npm install
```

### 2. Connect the database

Create a `.env` file in the project root:

```bash
DATABASE_URL="mongodb+srv://<user>:<password>@<cluster>.mongodb.net/napier_grass_db?retryWrites=true&w=majority"
```

`.env` files are git-ignored, so your credentials stay out of the repository.

### 3. Generate the Prisma client and load the strain data

```bash
npx prisma generate
npx tsx --env-file=.env prisma/seed.ts
```

The seed adds or updates the five strains in place, so saved estimates and visitors' history are kept. It is safe to run again.

### 4. Run

```bash
npm run dev       # development server at http://localhost:3000
npm run build     # production build
npm run start     # serve the production build
npm run lint      # ESLint
```

---

## Project structure

```
prisma/
  schema.prisma          Database models: NapierStrain, SimulationLog
  seed.ts                The five strains, each with its published sources
src/
  app/
    page.tsx             Home page (hero, How It Works, lifecycle, strains, estimator)
    strains/[slug]/      Strain detail pages
    simulation/[id]/     Saved estimate page
    history/             /history and /history/[key]: a visitor's saved estimates
    api/strains/         GET  /api/strains
    api/simulations/     POST /api/simulations
    actions.ts           Server actions: save an estimate, remove one, clear history
    loading.tsx, error.tsx
  components/            UI sections and pieces (HeroBento, StrainExplorer, YieldSimulator, Footer, …)
  lib/
    simulator.ts         Estimator maths, shared by the browser and the server
    strains.ts           Cached database queries
    simulations.ts       Validates and saves estimates
    history.ts           The private history key kept in the browser
    estimate-export.ts   CSV and printable-report data
```

---

## API

### `GET /api/strains`

Returns every strain. Optional filters:

| Query | Example | Effect |
|---|---|---|
| `q` | `?q=pakchong` | Matches name, scientific name, origin or "best for" |
| `soil` | `?soil=Red%20Soil` | Only strains suited to that soil |

```json
{ "count": 1, "strains": [ { "name": "Super Napier (Pakchong-1)", "slug": "super-napier-pakchong-1", "...": "..." } ] }
```

### `POST /api/simulations`

Runs and saves an estimate. The server always recalculates the figures, so clients cannot submit their own results.

```json
{ "landAcres": 10, "soilType": "Black Cotton", "irrigationLevel": "Assured Drip / Borewell", "primaryGoal": "BIO_CNG_BIOMASS" }
```

Returns `201` with the saved estimate's `id`, `url`, recommended strain, figures and 5-year projection; `400` for invalid JSON; `422` for invalid inputs.

| Field | Allowed values |
|---|---|
| `landAcres` | 0.5 – 500 |
| `soilType` | Black Cotton, Loamy, Red Soil, Alluvial, Sandy Loam, Marginal Lands |
| `irrigationLevel` | `Assured Drip / Borewell`, `Moderate Canal / Rainfed + Supplemental`, `Rainfed Only` |
| `primaryGoal` | `BIO_CNG_BIOMASS`, `DUAL_PURPOSE`, `DAIRY_FODDER` |

---

## How the estimator works

All maths lives in [`src/lib/simulator.ts`](src/lib/simulator.ts).

1. **Yield per acre** = the strain's fresh yield × the water-supply factor × the soil factor.
2. **Recommended strain:** each strain is scored on protein output (for fodder) and methane output (for Bio-CNG), weighted by the chosen goal.
3. **Methane** = fresh tons × the Bio-CNG share × dry matter % × 86.2% organic share × the strain's methane per ton of organic matter.
4. **Bio-CNG per day** = methane × 0.72 kg/m³ ÷ 365. **Fossil CO₂ avoided** = Bio-CNG mass × 2.75.
5. **5-year projection:** year 1 loses the establishment period before the first cut; later years use the full yield.

| Assumption | Value | Basis |
|---|---|---|
| Organic share of dry matter | 86.2% | Feedipedia: ash averages 13.8% of Napier dry matter |
| Moderate water / rainfed | 82% / 60% of full yield | Model assumption |
| Soil the strain isn't suited to | 80% of full yield | Model assumption |
| Green fodder per cow | ~40 kg a day | Model assumption |
| Stem cuttings | 11,000 per acre (about 2 × 2 ft spacing) | Arithmetic from spacing |

These assumptions are also listed under the estimator on the site.

---

## Data and sources

Strain data lives in [`prisma/seed.ts`](prisma/seed.ts) and is stored in MongoDB. Each strain has a `sources` list, shown at the bottom of its page. The sources include:

- **TNAU Agritech:** hybrid Napier planting, first cut at 75–80 days, re-cut every 45 days, irrigation every 10 days
- **Philippine Carabao Center:** Super Napier (Pakchong-1) yield and protein, as reported by its breeder
- **Journal of Tropical Agriculture (KAU), ICAR and other Indian journals:** CO (BN) 5 yields and nutrition
- **Peer-reviewed studies (PubMed Central, J-STAGE, Thai journals):** methane potential, dwarf and purple Napier, King grass
- **Feedipedia (INRAE, CIRAD, AFZ, FAO):** composition, ash content and yield ranges
- **Bureau of Indian Standards IS 16087 and the SATAT scheme:** Bio-CNG quality (≥ 90% methane) and storage at about 250 bar

Notes on the data:

- Yields are **fresh fodder per acre per year** (1 hectare = 2.47 acres).
- Methane figures are **lab results per ton of organic matter**. Published values for pure Napier grass are about 120–250 m³.
- Super Napier's 200 t/acre is the **breeder's best-case figure**, so the estimator recommends it in most cases.
- Plant heights, suitable soils and some dry-matter values are typical figures, not strain-specific measurements.
- The five-year harvest calendar is an example period. No source given here fixes a stand's lifespan.

---

## Saved estimates and history

- **Save & share** stores an estimate with a private **history key**, a random 20-character code created in the visitor's browser the first time they save.
- **View History** opens `/history/<key>`. Opening that link on another device shows the same list and makes it that device's history too.
- There are no accounts. Anyone with a history link can see its estimates, and a lost link cannot be recovered after clearing browser data.
- History pages are excluded from search engines.

---

## Deploying to Vercel

1. Import the repository in [Vercel](https://vercel.com/new).
2. Add **`DATABASE_URL`** under *Project → Settings → Environment Variables*.
3. In MongoDB Atlas, open *Network Access* and allow `0.0.0.0/0`, because Vercel's servers do not use fixed IP addresses.
4. Deploy. Strain data is cached for up to an hour, so database changes appear on the live site within that time.

> **Before deploying:** Prisma recommends adding `"postinstall": "prisma generate"` to `package.json` so Vercel always builds with an up-to-date client. `prisma.config.ts` also loads `dotenv`, which is not listed in `package.json`.
