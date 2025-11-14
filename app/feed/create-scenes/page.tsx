'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateScenesPage() {
  const [script, setScript] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/extract-scenes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ script }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to extract scenes')
      }

      const data = await response.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feed-container">
      <div className="feed-wrapper">
        <header className="feed-header">
          <div className="feed-header-content">
            <h1 className="feed-title">
              Create Scenes
            </h1>
            <p className="feed-subtitle">
              Extract Characters and Descriptions
            </p>
          </div>
          <Link href="/feed" className="back-button">
            Back to Feed
          </Link>
        </header>

        <div className="feed-content">
          <div className="feed-card">
            <form onSubmit={handleSubmit} className="script-form">
              <div className="script-field">
                <label htmlFor="script" className="script-label">
                  Script
                </label>
                <textarea
                  id="script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  required
                  className="script-textarea"
                  placeholder="Enter your script here..."
                  rows={15}
                />
              </div>

              {error && (
                <div className="script-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !script.trim()}
                className="script-submit-button"
              >
                {loading ? 'Processing...' : 'Extract Scenes'}
              </button>
            </form>
          </div>

          {result && (
            <>
              <div className="feed-card">
                <div className="result-header">
                  <h2 className="result-title">Extracted Data</h2>
                </div>
                <pre className="result-json">{JSON.stringify(result, null, 2)}</pre>
              </div>
              
              {result.characters && result.characters.length > 0 && (
                <div className="feed-card">
                  <Link 
                    href={`/feed/create-scenes/sketch?data=${encodeURIComponent(JSON.stringify(result))}`}
                    className="sketch-characters-button"
                  >
                    Sketch the characters
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

