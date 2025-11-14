import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function FeedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="feed-container">
      <div className="feed-wrapper">
        <header className="feed-header">
          <div className="feed-header-content">
            <h1 className="feed-title">
              Feed
            </h1>
            <p className="feed-subtitle">
              Protected Content
            </p>
          </div>
          <LogoutButton />
        </header>

        <div className="feed-content">
          <div className="feed-card">
            <div className="feed-card-content">
              <p className="feed-card-label">
                Welcome
              </p>
              <p className="feed-card-text">
                <span className="feed-card-text-bold">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="feed-card">
            <div className="feed-card-accent">
              <h2 className="feed-card-title">
                Protected Content
              </h2>
              <p className="feed-card-description">
                This is your protected feed page. Only authenticated users can see this content.
              </p>
            </div>
          </div>

          <div className="feed-card">
            <div className="feed-card-section">
              <div>
                <h3 className="feed-card-section-title">
                  Your Feed
                </h3>
                <p className="feed-card-section-label">
                  Content Stream
                </p>
              </div>
              <p className="feed-card-description">
                This is where your feed content would appear. You're successfully authenticated!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

