# American Logistics — americanlogistics.online

Static React + Vite site.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # outputs dist/public
```

## Deploy
Netlify / Vercel / Cloudflare Pages: build command `pnpm build`, output directory `dist/public`.

## Contact form
Set `VITE_FORM_ENDPOINT` (for example a Formspree URL) in `.env` or in your host's environment variables.
Without it, the form opens the visitor's email app addressed to the contact email.

## Things to keep up to date (client/src/pages/Home.tsx)
- `PHONE`, `EMAIL`, `SITE_URL` near the top of the file
- `PHOTOS` — swap image files in `client/public/images/` (keep the same names or update the paths)
- `EQUIPMENT`, `SERVICES`, `WHY`, `STEPS` content arrays
- `client/index.html` structured data (phone, email)
