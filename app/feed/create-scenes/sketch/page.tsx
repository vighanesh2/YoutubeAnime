'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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

interface ExtractedData {
  characters: Character[]
  scenes: Scene[]
}

export default function SketchCharactersPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const savedDrawingsRef = useRef<{ [key: string]: string }>({})
  const [data, setData] = useState<ExtractedData | null>(null)
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [savedDrawings, setSavedDrawings] = useState<{ [key: string]: string }>({})
  const [lineWidth, setLineWidth] = useState(2)

  // Keep ref in sync with state
  useEffect(() => {
    savedDrawingsRef.current = savedDrawings
  }, [savedDrawings])

  useEffect(() => {
    const dataParam = searchParams.get('data')
    if (dataParam) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(dataParam))
        setData(parsedData)
      } catch (error) {
        console.error('Failed to parse data:', error)
      }
    }
  }, [searchParams])

  // Initialize canvas and load character drawing when character changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    if (canvas.width !== 800 || canvas.height !== 600) {
      canvas.width = 800
      canvas.height = 600
    }

    // Set drawing styles
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load saved drawing or clear canvas when character changes
    const character = data.characters[currentCharacterIndex]
    if (character) {
      const savedDrawing = savedDrawingsRef.current[character.name]
      if (savedDrawing) {
        // Load saved drawing if it exists
        const img = new Image()
        img.onload = () => {
          ctx.fillStyle = '#000000'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        img.src = savedDrawing
      } else {
        // Clear canvas for new character
        ctx.fillStyle = '#000000'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [currentCharacterIndex, data])

  // Update line width without reloading canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.lineWidth = lineWidth
  }, [lineWidth])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const saveDrawing = () => {
    const canvas = canvasRef.current
    if (!canvas || !data) return

    const character = data.characters[currentCharacterIndex]
    if (!character) return

    // Convert canvas to PNG
    const imageData = canvas.toDataURL('image/png')
    
    // Save to state
    setSavedDrawings(prev => ({
      ...prev,
      [character.name]: imageData
    }))
  }

  const handleNext = () => {
    if (!data) return

    // Save current drawing first
    const canvas = canvasRef.current
    if (canvas && data.characters[currentCharacterIndex]) {
      const character = data.characters[currentCharacterIndex]
      const imageData = canvas.toDataURL('image/png')
      setSavedDrawings(prev => ({
        ...prev,
        [character.name]: imageData
      }))
    }

    // Move to next character (canvas will be cleared/loaded by useEffect)
    if (currentCharacterIndex < data.characters.length - 1) {
      setCurrentCharacterIndex(currentCharacterIndex + 1)
    }
  }

  const currentCharacter = data?.characters[currentCharacterIndex]
  const isLastCharacter = data ? currentCharacterIndex === data.characters.length - 1 : false
  const allCharactersDrawn = data ? data.characters.every(char => savedDrawings[char.name]) : false

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
              Sketch Characters
            </h1>
            <p className="feed-subtitle">
              Character {currentCharacterIndex + 1} of {data.characters.length}
            </p>
          </div>
          <Link href="/feed/create-scenes" className="back-button">
            Back
          </Link>
        </header>

        <div className="feed-content">
          {/* Character Boxes */}
          <div className="feed-card">
            <h2 className="result-title">Characters</h2>
            <div className="characters-grid">
              {data.characters.map((character, index) => (
                <div
                  key={index}
                  className={`character-box ${index === currentCharacterIndex ? 'active' : ''} ${savedDrawings[character.name] ? 'completed' : ''}`}
                >
                  <h3 className="character-name">{character.name}</h3>
                  <p className="character-description">{character.description}</p>
                  {savedDrawings[character.name] && (
                    <div className="character-checkmark">✓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Drawing Canvas */}
          <div className="feed-card">
            <div className="canvas-container">
              <div className="canvas-header">
                <h3 className="canvas-title">
                  Draw: {currentCharacter?.name}
                </h3>
                <div className="canvas-controls">
                  <button
                    onClick={clearCanvas}
                    className="canvas-button"
                  >
                    Clear
                  </button>
                  <div className="line-width-control">
                    <label>Line Width:</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={lineWidth}
                      onChange={(e) => setLineWidth(Number(e.target.value))}
                      className="line-width-slider"
                    />
                    <span>{lineWidth}px</span>
                  </div>
                </div>
              </div>
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="drawing-canvas"
              />
              <button
                onClick={handleNext}
                className="canvas-next-button"
                disabled={!currentCharacter}
              >
                {isLastCharacter ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>

          {/* Saved Characters Display */}
          {allCharactersDrawn && (
            <>
              <div className="feed-card">
                <h2 className="result-title">Your Characters</h2>
                <div className="saved-characters-grid">
                  {data.characters.map((character, index) => (
                    <div key={index} className="saved-character-item">
                      <h3 className="character-name">{character.name}</h3>
                      {savedDrawings[character.name] && (
                        <img
                          src={savedDrawings[character.name]}
                          alt={character.name}
                          className="saved-character-image"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="feed-card">
                <Link
                  href="/feed/create-scenes/generate"
                  onClick={() => {
                    // Store data in sessionStorage to avoid URL length limits
                    const generateData = {
                      characters: data.characters,
                      scenes: data.scenes,
                      images: Object.values(savedDrawings),
                    }
                    sessionStorage.setItem('animeGenerationData', JSON.stringify(generateData))
                  }}
                  className="generate-anime-button"
                >
                  Generate Anime
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

