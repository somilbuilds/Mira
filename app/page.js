'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="landing">
      {/* ── Nav ── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <div className="nav-logo">mira</div>
          <Link href="/app" className="btn-primary" id="nav-cta">
            open journal
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={`hero ${mounted ? 'visible' : ''}`} id="hero">
        <div className="hero-content">
          <p className="hero-label">mind reflective agent</p>
          <h1 className="hero-title">
            Write. Reflect.<br />
            <span className="hero-gradient">Remember.</span>
          </h1>
          <p className="hero-subtitle">
            An AI journal that reads between your lines. Mira remembers your patterns, 
            connects your entries, and mentors your growth — not with platitudes, 
            but with real depth.
          </p>
          <div className="hero-actions">
            <Link href="/app" className="btn-primary hero-btn" id="hero-cta">
              Start Writing
            </Link>
            <a href="#features" className="btn-ghost hero-btn">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features" id="features">
        <div className="features-grid">
          {[
            {
              icon: '✍️',
              title: 'Journal with Depth',
              desc: 'Write freely. Mira reflects back what matters — the tension, the pattern, the unasked question.',
            },
            {
              icon: '🧠',
              title: 'RAG Memory',
              desc: 'Every entry is embedded into vector space. Mira recalls similar past entries and weaves them into context.',
            },
            {
              icon: '💬',
              title: 'Mentor, Not Therapist',
              desc: 'Talk to Mira like a wise friend. Direct, honest, practical. No fluff, no diagnosis, no empty motivation.',
            },
            {
              icon: '📅',
              title: 'Calendar Awareness',
              desc: 'Mark important dates. Mira factors your deadlines, events, and milestones into its responses.',
            },
            {
              icon: '📊',
              title: 'Mood Insights',
              desc: 'Track emotional patterns over time. See your trends. Notice what you couldn\'t see in the moment.',
            },
            {
              icon: '🔒',
              title: 'Private & Secure',
              desc: 'Firebase auth keeps your entries yours. Your thoughts are encrypted and never shared.',
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

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-inner glass">
          <h2 className="cta-title">Your journal remembers<br />so you can move forward.</h2>
          <p className="cta-desc">Start writing. Mira does the rest.</p>
          <Link href="/app" className="btn-primary hero-btn" id="footer-cta">
            Open Mira
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <p>mira — built by <a href="https://github.com/somilbuilds" target="_blank" rel="noopener">somilbuilds</a></p>
      </footer>

      <style jsx>{`
        .landing {
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── Nav ── */
        .landing-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 16px 24px;
          background: rgba(9, 9, 11, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border-subtle);
        }
        .nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-logo {
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
        }

        /* ── Hero ── */
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 24px 80px;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .hero.visible { opacity: 1; }
        .hero-gradient {
          color: var(--accent);
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
          font-size: clamp(36px, 6vw, 64px);
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
          margin-bottom: 40px;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }
        .hero-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-btn {
          padding: 12px 28px;
          font-size: 15px;
          text-decoration: none;
        }

        /* ── Features ── */
        .features {
          padding: 80px 24px 100px;
          max-width: 1100px;
          margin: 0 auto;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
        }
        .feature-card {
          padding: 28px;
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

        /* ── CTA ── */
        .cta-section {
          padding: 40px 24px 100px;
          max-width: 700px;
          margin: 0 auto;
        }
        .cta-inner {
          text-align: center;
          padding: 60px 40px;
          border-radius: var(--radius-xl);
        }
        .cta-title {
          font-size: 28px;
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

        /* ── Footer ── */
        .landing-footer {
          text-align: center;
          padding: 40px 24px;
          border-top: 1px solid var(--border-subtle);
          font-size: 13px;
          color: var(--text-muted);
        }
        .landing-footer a {
          color: var(--text-tertiary);
          text-decoration: none;
        }
        .landing-footer a:hover {
          color: var(--accent);
        }

        @media (max-width: 640px) {
          .hero { padding: 100px 20px 60px; }
          .hero-subtitle { font-size: 15px; }
          .features-grid { grid-template-columns: 1fr; }
          .cta-inner { padding: 40px 24px; }
        }
      `}</style>
    </div>
  )
}
