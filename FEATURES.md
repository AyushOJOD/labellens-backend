# LabelLens Backend - Feature Log & Architecture

This document tracks all features, capabilities, and regulatory benchmarks implemented in the LabelLens backend. It is continuously updated whenever changes or new features are introduced.

---

## 📌 Feature History

### 1. Multimodal Nutrition Label Extraction (Gemini 3 Flash)
- **Files**: `src/modules/analysis/analysis.vision.service.ts`, `src/modules/analysis/analysis.schema.ts`
- **What it does**:
  - Ingests nutrition label images (JPEG, PNG, WebP) up to 5 MB.
  - Verifies binary image magic numbers using `file-type` to prevent spoofing.
  - Prompts Gemini Vision (`gemini-3-flash-preview`) with structured JSON schemas.
  - Extracts 12 nutritional metrics: Calories, Total Fat, Saturated Fat, Trans Fat, Monounsaturated Fat, Polyunsaturated Fat, Carbohydrates, Total Sugars, Added Sugars, Protein, Dietary Fiber, and Sodium.
  - Extracts metadata: Product name, category, product form (`solid` | `liquid`), nutrition basis (`per_serving` | `per_100g` | `per_100ml`), and serving size.

### 2. Serving Size Normalizer
- **Files**: `src/modules/analysis/analysis.normalizer.ts`, `src/modules/analysis/analysis.normalizer.test.ts`
- **What it does**:
  - Automatically scales confusing `per_serving` declarations (e.g. 15g serving, 30g pack) into standardized `per_100g` or `per_100ml` values.
  - Ensures mathematical parity so Indian consumers can compare products apples-to-apples.

### 3. Indian Food Benchmarks (FSSAI HFSS & ICMR-NIN 2024 Guidelines)
- **Files**: `src/modules/analysis/profiles/profiles.json`, `src/modules/analysis/analysis.service.ts`, `src/modules/analysis/analysis.service.test.ts`
- **What it does**:
  - Implements category-specific high-risk cutoffs for Indian packaged food:
    - **Namkeen & Chips** (`namkeen_snacks`): Saturated fat > 8g/100g, Total fat > 25g/100g, Sodium > 500mg/100g.
    - **Packaged Beverages** (`beverages`): Sugar > 5g/100ml (FSSAI HFSS liquid threshold).
    - **Instant Noodles & RTE** (`instant_foods`): Sodium > 650mg/100g, Saturated fat > 5g/100g.
    - **Biscuits & Bakery** (`biscuits`): Sugar > 20g/100g, Saturated fat > 5g/100g, Sodium > 600mg/100g.
    - **Chocolates & Sweets** (`sweets_confectionery`): Sugar > 25g/100g, Saturated fat > 10g/100g.
    - **Breakfast Cereals** (`breakfast_cereals`): Sugar > 15g/100g, Sodium > 350mg/100g.
    - **Dairy** (`dairy`): Sugar > 8g/100g, Saturated fat > 4g/100g.
    - **Sauces & Condiments** (`sauces_condiments`): Sugar > 20g/100g, Sodium > 800mg/100g.
    - **General Solid / Liquid fallbacks**: FSSAI baseline thresholds for other packaged products.
  - **Category Aliasing**: Smart mapper that matches real-world labels (e.g., `bhujia`, `sev`, `chips`, `kurkure`, `maggi`, `cold drink`) to the correct nutritional profile. Single-ingredient cooking oils (`mustard_oil`, etc.) safely return `needs_review`.
  - **Consumer Metric Enrichments**:
    - Calculates teaspoons of sugar (`~X tsp sugar per 100g/100ml`).
    - Calculates daily sodium percentage against ICMR's 2,000 mg/day ceiling (`~X% of ICMR daily sodium limit`).
    - Enforces FSSAI zero trans fat threshold (`> 0.2g / 100g`).

### 4. Open Food Facts Barcode Client & Seed Repository
- **Files**: `src/modules/products/open-food-facts.client.ts`, `src/modules/products/products.repository.ts`
- **What it does**:
  - Provides Open Food Facts API integration and local seed product lookups as a fallback and reference database.

### 5. Automated Vitest Suite
- **Status**: 45 passing tests across 5 test suites verifying MIME verification, image uploads, normalizer math, profile evaluations, and Indian category benchmarks.

### 6. Ingredient List OCR & Additive / Palm Oil Detector
- **Files**: `src/modules/analysis/analysis.ingredients.service.ts`, `src/modules/analysis/analysis.ingredients.service.test.ts`, `src/modules/analysis/analysis.types.ts`, `src/modules/analysis/analysis.schema.ts`, `src/modules/analysis/analysis.vision.service.ts`
- **What it does**:
  - Gemini Vision prompt updated to extract the printed `ingredientsText` alongside the numeric table.
  - **Palm Oil / Palmolein Detector**: Identifies `palmolein`, `palm oil`, `fractionated palm oil`, `palm kernel oil`, and `hydrogenated vegetable fat (vanaspati)`.
  - **Hidden Sugar Detector**: Flags hidden glycemic spikes such as `maltodextrin`, `invert sugar syrup`, `liquid glucose`, `dextrose`, and `high fructose corn syrup`.
  - **INS / E-Number Decoder**: Decodes 20+ common Indian packaged food additives across:
    - Artificial Sweeteners: *INS 955 (Sucralose), INS 950 (Acesulfame K), INS 951 (Aspartame), INS 954 (Saccharin), INS 960 (Stevia)*.
    - Synthetic Food Colors: *INS 102 (Tartrazine), INS 110 (Sunset Yellow), INS 122 (Carmoisine), INS 124 (Ponceau 4R), INS 127 (Erythrosine), INS 133 (Brilliant Blue), INS 150d (Caramel IV)*.
    - Flavor Enhancers: *INS 621 (MSG), INS 627, INS 631, INS 635*.
    - Preservatives: *INS 211 (Sodium Benzoate), INS 202 (Potassium Sorbate), INS 282 (Calcium Propionate), INS 220-224 (Sulphites)*.
    - Emulsifiers / Thickeners: *INS 322 (Lecithin), INS 407 (Carrageenan), INS 412 (Guar Gum), INS 415 (Xanthan Gum), INS 471*.
  - **Allergen Detection**: Flags wheat/gluten, milk/dairy, soy, peanuts, tree nuts, sesame, mustard, and sulphites.
  - **Unit Tests**: 6 dedicated unit tests verifying palm oil, hidden sugars, sweeteners, colors, and allergens.

### 7. Barcode Lookup & Analysis API
- **Files**: `src/modules/barcode/barcode.service.ts`, `src/modules/barcode/barcode.routes.ts`, `src/modules/barcode/barcode.service.test.ts`, `src/app.ts`
- **What it does**:
  - Exposes `GET /api/barcode/:barcode` and `POST /api/barcode` endpoints for instant product lookups.
  - Prioritizes the local seed product catalog, followed by the global Open Food Facts API with user-agent compliance.
  - Automatically translates Open Food Facts nutriments (calories, fat, saturated fat, trans fat, sugar, sodium) and category tags into standardized `ProductAnalysisInput`.
  - Runs the product through the **Indian FSSAI HFSS & ICMR-NIN 2024 Benchmark Engine** and the **Ingredient & Palm Oil Detector**.
  - Returns the exact same analysis payload as the AI photo pipeline so the frontend can seamlessly render the exact same rich traffic-light report.
  - 53 total unit tests passing across 7 test suites.

### 9. Barcode Scanner State Reset & Timeout Guard
- **Files**: `src/features/barcode/BarcodeScannerModal.tsx`, `labellens-backend/src/modules/products/open-food-facts.client.ts`
- **What was fixed**:
  - Resolved loading freeze bug where closing or pressing Back during a barcode search left `isScanning` stuck as `true`.
  - Added an active `useEffect` listener to immediately abort pending network requests and reset `isScanning: false`, `manualCode: ""`, and `torchEnabled: false` whenever the modal closes.
  - Added a visible **"Cancel Search"** button directly on the loading spinner overlay so users can cancel searches instantly without closing the camera.
  - Implemented 6s backend and 7s client-side timeouts using `AbortController` so network stalls on Open Food Facts never hang the UI indefinitely.

### 10. Self-Growing Persistent Auto-Cache System (Dynamic Database Expansion)
- **Files**: `src/modules/products/products.cache.ts`, `src/modules/products/products.cache.test.ts`, `data/products.cache.json`, `src/modules/barcode/barcode.service.ts`, `src/modules/analysis/analysis.routes.ts`
- **What it does**:
  - **Zero-Setup Database Expansion**: Provides a lightning-fast in-memory and persistent file-backed JSON database (`data/products.cache.json`) that grows automatically with every scan—avoiding heavy MongoDB/SQL setup overhead during development.
  - **Instant 0ms Latency**: Checks the in-memory map first; cached staples resolve in < 1ms without hitting external network APIs.
  - **Crowdsourced Auto-Learning**:
    - When any user queries a product via Open Food Facts, the enriched Indian nutritional analysis is automatically committed to the local database.
    - When any user uploads a nutrition label photo with a barcode, the backend automatically caches the extracted analysis under that barcode.
    - Subsequent scans of the same product by any user return the cached result instantly.
  - **Self-Seeding Indian Staples**: Pre-configured with 13 popular Indian supermarket products (Parle-G, Maggi Masala Noodles, Lay's India's Magic Masala, Kurkure Masala Munch, Haldiram's Aloo Bhujia, Cadbury Dairy Milk, Coca-Cola, Thums Up, Frooti, Britannia Good Day, Amul Taaza Toned Milk, Kissan Tomato Ketchup, Cadbury Oreo).
  - **Resilient File Handling**: Includes UTF-8 BOM removal (`\uFEFF`) and non-blocking asynchronous disk flushes so the database never corrupts on cross-platform environments.
  - **57 Total Vitest Tests Passing** across 8 test suites.


### 11. Production Build & Render Cloud Deployment Pipeline
- **Files**: ender.yaml, scripts/copy-assets.js, package.json
- **What it does**:
  - Added cross-platform asset copy script (scripts/copy-assets.js) to bundle non-TS JSON assets (profiles.json, products.seed.json) into dist upon 
pm run build.
  - Added Render Blueprint (ender.yaml) targeting Singapore region for optimal low latency in India.
  - Automatically provisions Node.js environment, runs 
pm install && npm run build, and monitors /api/health.

### 12. Support for Personalized Profile Health Matching
- **Files**: Integrates with frontend src/features/profile/ProfileView.tsx and src/utils/profile-storage.ts
- **What it does**:
  - Leverages detailed ingredient taxonomy (palm oil, INS code classification, glycemic index spikes, allergen detection) to power client-side personalized health guards.

---

### 13. Mobile App & APK Size Optimization (Frontend Integration)
- **Files**: `labellens-frontend/app.json`, `labellens-frontend/eas.json`, `labellens-frontend/package.json`
- **What it does**:
  - Integrated `expo-build-properties` to configure ProGuard / R8 code shrinking and resource shrinking (`enableProguardInReleaseBuilds`, `enableShrinkResourcesInReleaseBuilds`).
  - Enforced Hermes bytecode compilation (`"jsEngine": "hermes"`) to avoid shipping raw JS bundles and lower runtime RAM and disk consumption.
  - Enabled targeted CPU architecture compilation (`arm64-v8a`, `armeabi-v7a`), stripping bulky x86/x86_64 emulator binaries to reduce APK download size from ~70MB down to ~15MB–20MB.
  - Configured `eas.json` with multi-profile builds (`preview` APK, `preview-arm64` APK, and `production` AAB).

---

## 📋 Upcoming Roadmap & TODO List

- [ ] **MongoDB Atlas Integration (Priority for Public Launch)**
  - **Context**: Currently using the in-memory + persistent auto-cache (\data/products.cache.json\) on Render. While the container is active, user scans expand the database in real-time. However, Render's free tier ephemeral disk resets runtime file writes on container sleep or redeploy.
  - **Action**: Connect the backend to a free MongoDB Atlas cluster (M0 sandbox 512MB holds ~200,000 products) so crowdsourced scans persist permanently across all server restarts and redeployments.
- [x] **Standalone Android APK Distribution (\eas build\)**
  - Package an installable \.apk\ for testers who don't use Expo Go.
- [ ] **Product Health Comparison Mode (Explore Tab)**
  - Allow side-by-side comparison of two scanned products (e.g., Maggi vs. Yippee or Parle-G vs. Marie Gold) to highlight the healthier choice.
