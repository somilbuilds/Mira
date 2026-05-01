'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo">mira <span>moon journal</span></div>
          <Link href="/signin" className="btn-primary" id="nav-cta">
            Sign in
          </Link>
        </div>
      </nav>

      <section className={`hero ${mounted ? 'visible' : ''}`} id="hero">
        <div className="moon-glow" />
        <div className="hero-content">
          <p className="hero-label">quiet night reflections</p>
          <h1 className="hero-title">
            Keep your dreams<br />
            <span className="hero-gradient">in one sky.</span>
          </h1>
          <p className="hero-subtitle">
            Mira helps you capture dreams, follow emotional patterns, and continue a conversation
            with context from your past entries. Calm, structured, and yours.
          </p>
          <div className="hero-actions">
            <Link href="/signin" className="btn-primary hero-btn" id="hero-cta">
              Start journaling
            </Link>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="features-grid">
          {[
            {
              icon: '🌙',
              title: 'Dream-first capture',
              desc: 'Write quickly, or add optional structure only when you need it.',
            },
            {
              icon: '☁️',
              title: 'Soft, spacious workspace',
              desc: 'A left-side layout that keeps your writing and chat flowing without reset.',
            },
            {
              icon: '💬',
              title: 'Dream chat that remembers',
              desc: 'Continue conversation over time with context from your own journal.',
            },
            {
              icon: '📅',
              title: 'Calendar and insights',
              desc: 'See patterns by date and mood so dreams become useful over time.',
            },
          ].map((f, i) => (
            <div
              className={`feature-card card ${mounted ? 'visible' : ''}`}
              key={i}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-inner glass">
          <h2 className="cta-title">A cleaner space for your nights.</h2>
          <p className="cta-desc">One login. One workspace. No clutter.</p>
          <Link href="/signin" className="btn-primary hero-btn" id="footer-cta">
            Sign in to Mira
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <p>mira</p>
      </footer>

      <style jsx>{`
        .landing {
          min-height: calc(100vh - 2 * clamp(10px, 1.4vw, 18px));
          border-radius: var(--radius-xl);
          border: 1px solid var(--border-subtle);
          background: rgba(255, 255, 255, 0.5);
          box-shadow: 0 22px 50px rgba(90, 118, 170, 0.12);
          overflow-x: hidden;
        }

        .landing-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 16px 28px;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-default);
        }
        .nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-primary);
        }
        .nav-logo span {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-left: 8px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero {
          position: relative;
          min-height: min(760px, 82vh);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 96px 24px 64px;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .moon-glow {
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(193, 214, 255, 0.35) 45%, rgba(193, 214, 255, 0) 75%);
          top: 10%;
          right: 10%;
          pointer-events: none;
        }
        .hero.visible { opacity: 1; }
        .hero-gradient {
          color: #4e74c8;
        }
        .hero-label {
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 20px;
          font-weight: 500;
        }
        .hero-title {
          font-size: clamp(34px, 5.5vw, 60px);
          font-weight: 700;
          line-height: 1.1;
          color: var(--text-primary);
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }
        .hero-gradient {
          color: var(--accent);
        }
        .hero-subtitle {
          font-size: 17px;
          line-height: 1.7;
          color: var(--text-tertiary);
          margin-bottom: 28px;
          max-width: 620px;
          margin-left: auto;
          margin-right: auto;
        }
        .hero-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-btn {
          padding: 12px 28px;
          font-size: 15px;
          text-decoration: none;
        }

        .features {
          padding: 36px 24px 76px;
          max-width: 1000px;
          margin: 0 auto;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
        }
        .feature-card {
          padding: 22px;
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .feature-card.visible {
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .feature-icon {
          font-size: 28px;
          margin-bottom: 14px;
        }
        .feature-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 8px;
        }
        .feature-desc {
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-tertiary);
        }

        .cta-section {
          padding: 8px 24px 64px;
          max-width: 760px;
          margin: 0 auto;
        }
        .cta-inner {
          text-align: center;
          padding: 60px 40px;
          border-radius: var(--radius-xl);
        }
        .cta-title {
          font-size: 32px;
          font-weight: 600;
          line-height: 1.3;
          color: var(--text-primary);
          margin-bottom: 12px;
        }
        .cta-desc {
          color: var(--text-tertiary);
          font-size: 15px;
          margin-bottom: 28px;
        }

        .landing-footer {
          text-align: center;
          padding: 22px 24px 28px;
          border-top: 1px solid var(--border-subtle);
          font-size: 13px;
          color: var(--text-muted);
        }

        @media (max-width: 640px) {
          .nav-logo span { display: none; }
          .hero { padding: 72px 20px 48px; min-height: 72vh; }
          .hero-subtitle { font-size: 15px; }
          .moon-glow { width: 240px; height: 240px; right: 0; top: 8%; }
          .features-grid { grid-template-columns: 1fr; }
          .cta-inner { padding: 40px 24px; }
        }
      `}</style>
    </div>
  )
}
