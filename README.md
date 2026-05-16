# Portfolio Page

Portfolio and services website built with Next.js App Router, TypeScript, Tailwind CSS v4, and Firebase (Firestore + Auth + Admin SDK).

## Current Status

- Phase 1 foundation/scaffolding is complete.
- Phase 2 public pages/content wiring is complete.
- Phase 3 admin authentication and admin panel implementation is complete.
- Current focus is contact form backend implementation.

## Stack

- Next.js 16.2.6 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Firebase client SDK + Firebase Admin SDK
- next-themes
- Vitest

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root with these variables:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

3. Start development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - run ESLint
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode

## Project Structure

- `src/app/(public)/` - public routes/layout
- `src/app/admin/` - admin routes
- `src/components/layout/` - header, footer, theme provider/toggle
- `src/lib/firebase/` - Firebase client/admin/firestore helpers
- `src/lib/types.ts` - shared Firestore domain types
- `middleware.ts` - `/admin/*` auth gate

## Notes

- Tailwind theme tokens are defined in `src/app/globals.css` using `@theme inline`.
- Middleware currently performs a fast-path session cookie presence check; full server-side verification is expected in later admin-phase work.
