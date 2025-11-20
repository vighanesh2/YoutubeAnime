import { NextRequest, NextResponse } from 'next/server'

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ''
const RAPIDAPI_HOST = 'text-to-video.p.rapidapi.com'
const RAPIDAPI_URL = 'https://text-to-video.p.rapidapi.com/v3/process_text_and_search_media'

export async function POST(request: NextRequest) {
  try {
    const { script, dimension = '16:9' } = await request.json()

    if (!script || typeof script !== 'string') {
      return NextResponse.json(
        { error: 'Script is required' },
        { status: 400 }
      )
    }

    if (!RAPIDAPI_KEY) {
      return NextResponse.json(
        { error: 'RapidAPI key is not configured. Get a free key at https://rapidapi.com/hub' },
        { status: 500 }
      )
    }

    // Call RapidAPI text-to-video endpoint
    const response = await fetch(RAPIDAPI_URL, {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        script: script,
        dimension: dimension,
      }),
    })

    // Check content type before parsing
    const contentType = response.headers.get('content-type') || ''
    const responseText = await response.text()
    
    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`
      
      // Only try to parse JSON if content-type indicates JSON
      if (contentType.includes('application/json')) {
        try {
          const errorJson = JSON.parse(responseText)
          errorMessage = errorJson.message || errorJson.error || errorMessage
        } catch {
          errorMessage += ` - ${responseText.substring(0, 200)}`
        }
      } else {
        // If HTML response, provide helpful error
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          errorMessage = `Invalid API endpoint or authentication failed. The API returned HTML instead of JSON. Please check:\n1. Your RapidAPI key is correct\n2. You're subscribed to the Text-to-Video API\n3. The API endpoint is correct`
        } else {
          errorMessage += ` - ${responseText.substring(0, 200)}`
        }
      }

      // Handle specific error cases
      if (response.status === 401 || response.status === 403) {
        errorMessage = 'Invalid RapidAPI key. Please check your API key at https://rapidapi.com/hub'
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.'
      } else if (response.status === 402) {
        errorMessage = 'Insufficient credits. Please add credits to your RapidAPI account.'
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    // Check if response is JSON before parsing
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { 
          error: `API returned non-JSON response. Content-Type: ${contentType}. This usually means:\n1. Invalid API endpoint\n2. Authentication failed\n3. API subscription issue\n\nResponse preview: ${responseText.substring(0, 200)}` 
        },
        { status: 500 }
      )
    }

    const result = JSON.parse(responseText)

    // Extract videos and images from scenes
    const scenes = result.scenes || []
    const allMedia: Array<{ type: 'image' | 'video', url: string, sceneText: string, sceneIndex: number }> = []

    scenes.forEach((scene: any, index: number) => {
      const sceneText = scene.text || ''
      const media = scene.media || []
      
      media.forEach((item: any) => {
        if (item.type === 'video' && item.resource?.video_link) {
          allMedia.push({
            type: 'video',
            url: item.resource.video_link,
            sceneText,
            sceneIndex: index,
          })
        } else if (item.type === 'image' && item.resource?.url) {
          allMedia.push({
            type: 'image',
            url: item.resource.url,
            sceneText,
            sceneIndex: index,
          })
        }
      })
    })

    return NextResponse.json({
      scripts: result.scripts || [],
      scenes: scenes,
      media: allMedia,
      audio: result.audio?.url || null,
      message: `Generated ${scenes.length} scene(s) with ${allMedia.length} media items`,
    })
  } catch (error: any) {
    console.error('Error generating anime:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate anime video. Please check your RapidAPI key and try again.' },
      { status: 500 }
    )
  }
}
