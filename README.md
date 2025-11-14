# YoutubeAnime

A Next.js application with Supabase authentication featuring a protected Feed page.

## Features

- User authentication (Login/Sign Up) using Supabase
- Protected Feed page accessible only to authenticated users
- Automatic redirects based on authentication status
- Create Scenes feature: Extract characters and descriptions from scripts using Claude AI
- Modern black and white UI design

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your Supabase project:
   - Go to [Supabase](https://supabase.com) and create a new project
   - Get your project URL and anon key from the project settings

3. Set up your Anthropic API key:
   - Go to [Anthropic Console](https://console.anthropic.com/) and create an API key

4. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Create Scenes Feature

The Create Scenes feature allows you to extract characters and scene descriptions from scripts using Claude AI:

1. Navigate to the Feed page
2. Click the "Create Scenes" button
3. Paste your script in the text area
4. Click "Extract Scenes"
5. View the extracted characters and scene descriptions in JSON format

The extracted data includes:
- **Characters**: Name and description of each character
- **Scenes**: Scene number, description, characters involved, and location

## Project Structure

- `app/` - Next.js app router pages
  - `page.tsx` - Login/Sign Up page
  - `feed/page.tsx` - Protected Feed page
  - `feed/create-scenes/page.tsx` - Script input and scene extraction page
  - `api/extract-scenes/route.ts` - API route for Claude AI integration
- `lib/supabase/` - Supabase client utilities
- `components/` - React components
- `middleware.ts` - Route protection middleware

## Authentication Flow

- Unauthenticated users are redirected to the login page
- Authenticated users can access the Feed page
- Authenticated users visiting the login page are redirected to Feed
- Logout functionality is available on the Feed page

