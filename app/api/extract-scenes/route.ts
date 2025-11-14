import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { script } = await request.json()

    if (!script || typeof script !== 'string') {
      return NextResponse.json(
        { error: 'Script is required' },
        { status: 400 }
      )
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key is not configured' },
        { status: 500 }
      )
    }

    // Model selection - configurable via environment variable, defaults to Claude Haiku 3.5
    // Available models based on your rate limits:
    // - 'claude-3-5-haiku-20241022' (Haiku 3.5) - 50K input, 10K output tokens/min
    // - 'claude-3-7-sonnet-20250219' (Sonnet 3.7) - 20K input, 8K output tokens/min
    // - 'claude-3-opus-20240229' (Opus) - 30K input, 8K output tokens/min
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022'
    
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Analyze the following script and extract all characters and their descriptions. Return the result as a JSON object with the following structure:
{
  "characters": [
    {
      "name": "Character Name",
      "description": "Physical and personality description"
    }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "description": "Scene description",
      "characters": ["Character Name"],
      "location": "Location description"
    }
  ]
}

Script:
${script}

Please return ONLY valid JSON, no additional text or markdown formatting.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse the JSON response
    let extractedData
    try {
      // Remove any markdown code blocks if present
      const jsonText = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      extractedData = JSON.parse(jsonText)
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the text
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Failed to parse JSON from Claude response')
      }
    }

    return NextResponse.json(extractedData)
  } catch (error: any) {
    console.error('Error extracting scenes:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to extract scenes' },
      { status: 500 }
    )
  }
}

