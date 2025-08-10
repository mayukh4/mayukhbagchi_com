# mayukhbagchi.com

A modern personal website for Mayukh Bagchi — Astronomy & Astrophysics. Built with Next.js App Router, React 19, and Tailwind CSS v4. Includes a blog, CV, conference travel, research, outreach, contact, admin panel, and YouTube analytics integrations.

- Live site: https://mayukhbagchi.com
- Repository: https://github.com/mayukh4/mayukhbagchi_com

## Features

- Blogs with Markdown rendering and image support
- Static pages: About, CV, Research, Outreach, Conference Travel
- Contact form with email delivery
- Admin area for managing posts and uploads
- YouTube analytics import, stats, and webhooks
- Indie/Stripe basics prepared for future use
- Clean, responsive UI with dark/light theme

## Tech Stack

- Framework: Next.js 15 (App Router)
- UI: React 19, Tailwind CSS v4, `lucide-react`, `framer-motion`
- Auth: NextAuth v4 with Supabase Adapter
- Data/Backend: Supabase JS v2, Next.js Route Handlers
- Emails: Resend or Nodemailer
- Payments: Stripe SDK
- Google/YouTube: `googleapis`, `@google/generative-ai`, `youtube-transcript`
- Viz/Math: `d3-geo`, `topojson-client`, `fft.js`
- Tooling: TypeScript 5, ESLint 9 (flat config)

A more detailed, versioned breakdown with best practices is maintained in the Cursor rule: `.cursor/rules/stack-and-versions.mdc`.

## Getting Started

Prereqs:
- Node.js >= 18.18 (recommended: Node 20 LTS)

Install & run:

```bash
cd site
npm install
npm run dev
```

The app will start on `http://localhost:3000`.

## Environment Variables

Create a `.env.local` in `site/` (this repo’s `.gitignore` prevents it from being committed). Variables commonly used by features in this project:

Authentication (NextAuth):
- `NEXTAUTH_URL` = http://localhost:3000 (dev) or your production URL
- `NEXTAUTH_SECRET` = strong random string

Supabase (server-only keys must never be exposed to the client):
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE` (server-only)

Email (choose one provider or keep both wired for flexibility):
- Resend: `RESEND_API_KEY`
- Nodemailer SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_SECURE` (true/false)

Stripe (if/when payments are enabled):
- `STRIPE_SECRET_KEY` (server-only)
- `STRIPE_WEBHOOK_SECRET` (server-only)

Google / YouTube:
- `GOOGLE_APPLICATION_CREDENTIALS` (path or JSON for service accounts; server-only)
- `YOUTUBE_API_KEY` (if using API key flow)

Gemini (Generative AI):
- `GOOGLE_GENERATIVE_AI_API_KEY` (server-only)

Contact form / Mail settings:
- Provide the required values for your selected provider (Resend or SMTP).

Security notes:
- Never inject server-only secrets into client components.
- Webhook handlers must verify signatures (e.g., Stripe).

## Scripts

From `site/`:
- `npm run dev` — Run the development server (Turbopack)
- `npm run build` — Production build
- `npm run start` — Start the production server
- `npm run lint` — Lint with ESLint 9

## Directory Structure (key paths)

```
site/
  src/
    app/
      page.tsx               # Home
      about/page.tsx
      blogs/page.tsx
      blogs/[slug]/page.tsx
      conference-travel/page.tsx
      contact/page.tsx
      cv/page.tsx
      outreach/page.tsx
      research/page.tsx
      api/                   # Route handlers (server)
        admin/
          login/route.ts
          logout/route.ts
          posts/route.ts
          posts/[id]/route.ts
          upload-image/route.ts
        indie/sales/route.ts
        send-contact/route.ts
        youtube/
          available/route.ts
          channel-stats/route.ts
          import/route.ts
          webhook/route.ts
          sync/route.ts
          stats/route.ts
          process-video.ts
    components/              # UI components
    lib/                     # Auth, Supabase, YouTube helpers
    middleware.ts            # (if used)
  public/                    # Static assets, CV PDF, images
```

## Deployment

- Recommended: Deploy the `site/` app on Vercel.
- Ensure all required environment variables are configured in the platform.
- Set `NEXTAUTH_URL` to the production URL.
- Keep server-only keys (Supabase service role, Stripe secret, webhooks, Google credentials, Gemini API) in server-side environment.

## Security & Privacy

- `.gitignore` excludes `.env*`, `.cursor/`, and private notes.
- Avoid exposing any server-only credentials in client code.
- Verify webhook signatures (Stripe) and secure all admin endpoints.
- Prefer RLS with Supabase and never use service role on the client.

## Contributing

Issues and PRs are welcome. For significant changes, please open an issue first to discuss what you’d like to change.

## License

Copyright © Mayukh Bagchi. All rights reserved.

If you intend to contribute or reuse parts of this project, please open an issue to discuss licensing.

## Contact

- Website: https://mayukhbagchi.com
- GitHub: https://github.com/mayukh4
