# YoutubeAnime

A Next.js application with Supabase authentication featuring a protected Feed page.

## Features

- User authentication (Login/Sign Up) using Supabase
- Protected Feed page accessible only to authenticated users
- Automatic redirects based on authentication status
- Create Scenes feature: Extract characters and descriptions from scripts using Claude AI
- Sketch Characters: Draw character designs on a canvas and save as PNG
- Generate Anime: Create animated videos from character drawings and scripts using AI
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

4. Set up your RapidAPI key (required for video generation):
   - Go to [RapidAPI](https://rapidapi.com/hub) and sign up for a free account
   - Navigate to your account dashboard
   - Subscribe to the "Text-to-Video" API (or use the provided API key)
   - Copy your RapidAPI key from the dashboard
   - Note: Free tier includes limited credits, upgrade for more usage

5. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
RAPIDAPI_KEY=your_rapidapi_key
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Complete Workflow

### 1. Extract Characters from Script
1. Navigate to the Feed page
2. Click the "Create Scenes" button
3. Paste your script in the text area
4. Click "Extract Scenes"
5. View the extracted characters and scene descriptions in JSON format

### 2. Sketch Characters
1. After extracting scenes, click "Sketch the characters"
2. Draw each character on the canvas
3. Adjust line width as needed
4. Click "Next" to save and move to the next character
5. Complete all characters to unlock the "Generate Anime" button

### 3. Generate Anime Video
1. After sketching all characters, click "Generate Anime"
2. Review and edit the script if needed (the script will be sent to RapidAPI)
3. Click "Generate Anime Video"
4. Wait for RapidAPI to process your script (may take a few seconds)
5. View the generated scenes with associated images/videos
6. Download the background audio if available

## Video Generation with RapidAPI

The app uses RapidAPI Text-to-Video API for video generation:

1. **API Service**: Uses RapidAPI's text-to-video service to process scripts
2. **Features**: 
   - Automatically breaks down scripts into scenes
   - Finds relevant images and videos for each scene
   - Generates background audio
   - Returns structured scene data with media
3. **Setup**: Requires a RapidAPI key (get one at [rapidapi.com/hub](https://rapidapi.com/hub))
4. **Output**: Returns scenes with associated media (images/videos) and audio URLs
5. **Dimension**: Supports 16:9 aspect ratio for YouTube-style videos

The app sends your script to RapidAPI, which processes it and returns scenes with relevant media that can be used to create anime videos.

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
  - `feed/create-scenes/sketch/page.tsx` - Character sketching page with canvas
  - `feed/create-scenes/generate/page.tsx` - Anime video generation page
  - `api/extract-scenes/route.ts` - API route for Claude AI integration
  - `api/generate-anime/route.ts` - API route for RapidAPI text-to-video integration
- `lib/supabase/` - Supabase client utilities
- `components/` - React components
- `middleware.ts` - Route protection middleware

## Authentication Flow

- Unauthenticated users are redirected to the login page
- Authenticated users can access the Feed page
- Authenticated users visiting the login page are redirected to Feed
- Logout functionality is available on the Feed page

