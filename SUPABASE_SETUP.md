# Supabase setup

## 1) Create a Supabase project
- Create a new project in Supabase.
- In **Project Settings → API**, copy:
  - Project URL
  - `anon` public key

## 2) Add environment variables
Create a local env file (not committed) at `.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3) Auth settings
In Supabase **Authentication → Providers → Email**:
- Ensure **Email** provider is enabled.
- For development, you can disable email confirmations (optional) or keep enabled and use your inbox.

## 4) Run the app
From the project folder:

```
npm run dev
```

Then open:
- `http://localhost:3000/signup`
- `http://localhost:3000/login`
