# YoutubeAnime

A Next.js application with Supabase authentication featuring a protected Feed page.

## Features

- User authentication (Login/Sign Up) using Supabase
- Protected Feed page accessible only to authenticated users
- Automatic redirects based on authentication status
- Modern UI with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your Supabase project:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Get your project URL and anon key from the project settings

3. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/` - Next.js app router pages
  - `page.tsx` - Login/Sign Up page
  - `feed/page.tsx` - Protected Feed page
- `lib/supabase/` - Supabase client utilities
- `components/` - React components
- `middleware.ts` - Route protection middleware

## Authentication Flow

- Unauthenticated users are redirected to the login page
- Authenticated users can access the Feed page
- Authenticated users visiting the login page are redirected to Feed
- Logout functionality is available on the Feed page

