# ZeroWaste Connect

Hackathon-ready full-stack web app to connect food donors with NGOs and reduce food waste with AI-powered urgency and safety insights.

## Stack
- Next.js 14 (App Router + API routes, Node runtime)
- React + Tailwind CSS
- shadcn/ui-style components + Radix UI tabs
- Firebase Authentication (Google), Firestore, Storage
- Zod validation
- Gemma API integration for food safety analysis
- Vercel deploy-ready

## Features
1. Google login and role switching (`donor` / `ngo`).
2. Donor dashboard:
   - Create donation
   - Upload image
   - Quantity, deadline, food type, location
   - Live status tracking
3. NGO dashboard:
   - Real-time donation feed
   - Urgency badge (LOW/MEDIUM/HIGH)
   - Accept pickup / mark collected
4. AI integration:
   - Calls `/api/ai/analyze` on donation create
   - Stores `safeConsumptionTime`, `urgencyLevel`, `storageAdvice`
5. Impact dashboard:
   - Total meals saved
   - CO₂ reduced
   - Donations today
6. Demo mode button for mock data generation.

## Folder Structure

```text
.
├── app/
│   ├── api/ai/analyze/route.ts      # Gemma integration endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                     # Unified donor/NGO dashboard UI
├── components/
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── tabs.tsx
├── lib/
│   ├── donations.ts                 # Firestore + Storage operations
│   ├── firebase.ts                  # Firebase init/auth/db/storage
│   ├── schemas.ts                   # Zod validation
│   └── utils.ts
├── providers/
│   ├── auth-provider.tsx
│   └── theme-provider.tsx
├── types/
│   └── donation.ts
├── .env.example
└── README.md
```

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Firebase setup
- Enable **Google** sign-in in Firebase Authentication.
- Create Firestore database.
- Enable Firebase Storage.

## Gemma setup
- Add `GEMMA_API_KEY` in `.env.local`.
- If key is missing or request fails, API route falls back to safe defaults.

## Deploy (Vercel)
- Import this repo in Vercel.
- Add all environment variables from `.env.example`.
- Deploy.
