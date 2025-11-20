'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Character {
  name: string
  description: string
}

interface Scene {
  sceneNumber: number
  description: string
  characters: string[]
  location: string
}

interface GenerateData {
  characters: Character[]
  scenes: Scene[]
  images: string[]
}

interface MediaItem {
  type: 'image' | 'video'
  url: string
  sceneText: string
  sceneIndex: number
}

interface ApiScene {
  text: string
  keywords?: string[]
  media?: Array<{
    type: 'image' | 'video'
    resource?: {
      url?: string
      video_link?: string
      image_link?: string
    }
  }>
}

export default function GenerateAnimePage() {
  const [data, setData] = useState<GenerateData | null>(null)
  const [loading, setLoading] = useState(false)
  const [scenes, setScenes] = useState<ApiScene[]>([])
  const [media, setMedia] = useState<MediaItem[]>([])
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [scripts, setScripts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [script, setScript] = useState('')

  useEffect(() => {
    // Get data from sessionStorage instead of URL to avoid size limits
    try {
      const storedData = sessionStorage.getItem('animeGenerationData')
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setData(parsedData)
        
        // Create script from scenes - combine all scene descriptions into one script
        if (parsedData.scenes && parsedData.scenes.length > 0) {
          const scriptText = parsedData.scenes
            .map((scene: Scene) => scene.description)
            .join('. ')
          setScript(scriptText)
        } else if (parsedData.script) {
          // If there's a script from the original extraction, use it
          setScript(parsedData.script)
        }
      } else {
        setError('No character data found. Please go back and sketch your characters first.')
      }
    } catch (error) {
      console.error('Failed to parse data:', error)
      setError('Failed to load character data. Please go back and try again.')
    }
  }, [])

  const handleGenerate = async () => {
    if (!script.trim()) return

    setLoading(true)
    setError(null)
    setScenes([])
    setMedia([])
    setAudioUrl(null)
    setScripts([])

    try {
      const response = await fetch('/api/generate-anime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: script,
          dimension: '16:9',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate anime')
      }

      const result = await response.json()
      setScenes(result.scenes || [])
      setMedia(result.media || [])
      setAudioUrl(result.audio || null)
      setScripts(result.scripts || [])
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!data) {
    return (
      <div className="feed-container">
        <div className="feed-wrapper">
          <div className="feed-card">
            <p className="feed-card-text">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="feed-container">
      <div className="feed-wrapper">
        <header className="feed-header">
          <div className="feed-header-content">
            <h1 className="feed-title">
              Generate Anime
            </h1>
            <p className="feed-subtitle">
              Create Video from Script using RapidAPI
            </p>
          </div>
          <Link href="/feed/create-scenes/sketch" className="back-button">
            Back
          </Link>
        </header>

        <div className="feed-content">
          {/* Script Display */}
          <div className="feed-card">
            <h2 className="result-title">Script</h2>
            <div className="script-display">
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="script-textarea"
                rows={10}
                placeholder="Enter or edit your script here..."
              />
            </div>
          </div>

          {/* Character Images Preview */}
          <div className="feed-card">
            <h2 className="result-title">Character Images</h2>
            <div className="characters-preview-grid">
              {data.characters.map((character, index) => (
                <div key={index} className="character-preview-item">
                  <h3 className="character-name">{character.name}</h3>
                  {data.images[index] && (
                    <img
                      src={data.images[index]}
                      alt={character.name}
                      className="character-preview-image"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="feed-card">
            <button
              onClick={handleGenerate}
              disabled={loading || !script.trim()}
              className="generate-anime-button"
            >
              {loading ? 'Generating Anime...' : 'Generate Anime Video'}
            </button>
            {error && (
              <div className="script-error" style={{ marginTop: '1rem', whiteSpace: 'pre-line' }}>
                {error}
              </div>
            )}
          </div>

          {/* Generated Scripts */}
          {scripts.length > 0 && (
            <div className="feed-card">
              <h2 className="result-title">Generated Script Lines</h2>
              <div className="script-display">
                {scripts.map((line, index) => (
                  <p key={index} className="feed-card-text" style={{ marginBottom: '0.5rem' }}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Generated Scenes with Media */}
          {scenes.length > 0 && (
            <div className="feed-card">
              <h2 className="result-title">Generated Scenes</h2>
              <div className="videos-grid">
                {scenes.map((scene, sceneIndex) => (
                  <div key={sceneIndex} className="video-item">
                    <h3 className="character-name" style={{ marginBottom: '1rem' }}>
                      Scene {sceneIndex + 1}
                    </h3>
                    <p className="feed-card-text" style={{ marginBottom: '1rem' }}>
                      {scene.text}
                    </p>
                    {scene.media && scene.media.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                        {scene.media.map((item, itemIndex) => {
                          const mediaUrl = item.resource?.video_link || item.resource?.image_link || item.resource?.url
                          if (!mediaUrl) return null

                          return (
                            <div key={itemIndex} style={{ border: '1px solid var(--foreground)', borderRadius: '8px', overflow: 'hidden' }}>
                              {item.type === 'video' ? (
                                <video
                                  src={mediaUrl}
                                  controls
                                  style={{ width: '100%', height: 'auto', display: 'block' }}
                                >
                                  Your browser does not support the video tag.
                                </video>
                              ) : (
                                <img
                                  src={mediaUrl}
                                  alt={scene.text}
                                  style={{ width: '100%', height: 'auto', display: 'block' }}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audio */}
          {audioUrl && (
            <div className="feed-card">
              <h2 className="result-title">Background Audio</h2>
              <audio controls style={{ width: '100%', marginTop: '1rem' }}>
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
              <a
                href={audioUrl}
                download="background-audio.mp3"
                className="download-video-button"
                style={{ display: 'inline-block', marginTop: '1rem' }}
              >
                Download Audio
              </a>
            </div>
          )}

          {/* RapidAPI Info */}
          <div className="feed-card">
            <h2 className="result-title">About RapidAPI</h2>
            <div className="free-alternatives">
              <p className="feed-card-description">
                Using RapidAPI Text-to-Video API:
              </p>
              <ul className="alternatives-list">
                <li>
                  <strong>Free Tier:</strong> Get started with free credits at{' '}
                  <a href="https://rapidapi.com/hub" target="_blank" rel="noopener noreferrer" className="external-link">
                    rapidapi.com/hub
                  </a>
                </li>
                <li>
                  <strong>API Key:</strong> Set your RapidAPI key in environment variable <code>RAPIDAPI_KEY</code>
                </li>
                <li>
                  <strong>Features:</strong> Automatically finds relevant images and videos for your script, generates scene-by-scene breakdown
                </li>
                <li>
                  <strong>Output:</strong> Returns scenes with associated media (images/videos) and background audio
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
