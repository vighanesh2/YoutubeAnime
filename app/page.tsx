'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        // After signup, redirect to feed
        router.push('/feed')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        // After login, redirect to feed
        router.push('/feed')
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <div className="auth-form-inner">
          <div className="auth-header">
            <h1 className="auth-title">
              {isSignUp ? 'Sign Up' : 'Login'}
            </h1>
            <p className="auth-subtitle">
              {isSignUp 
                ? 'Create your account to get started' 
                : 'Welcome back. Please enter your credentials.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="auth-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Login'}
            </button>
          </form>

          <div className="auth-switch-container">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
              }}
              className="auth-switch-button"
            >
              {isSignUp
                ? 'Already have an account? Login'
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

