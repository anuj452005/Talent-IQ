import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import './HeaderSection.css'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4'
const VIDEO_BLEND_MS = 900

const menuItems = ['Home', 'About Us', 'Services', 'Projects', 'Contact']
const partners = ['Opensense', 'DKNY', 'Under Armour', 'LIU·JO', 'ATOM', 'ECCO', 'ORUM']

function HeaderSection() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeVideo, setActiveVideo] = useState<0 | 1>(0)
  const [blendTarget, setBlendTarget] = useState<0 | 1 | null>(null)
  const videoARef = useRef<HTMLVideoElement>(null)
  const videoBRef = useRef<HTMLVideoElement>(null)
  const blendingRef = useRef(false)

  const progressMetrics = useMemo(() => {
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (progress / 100) * circumference

    return { radius, circumference, dashOffset }
  }, [progress])

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(75), 500)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const currentVideo = activeVideo === 0 ? videoARef.current : videoBRef.current
    const nextIndex: 0 | 1 = activeVideo === 0 ? 1 : 0
    const nextVideo = nextIndex === 0 ? videoARef.current : videoBRef.current

    if (!currentVideo || !nextVideo) {
      return
    }

    const startBlend = () => {
      if (blendingRef.current || !Number.isFinite(currentVideo.duration)) {
        return
      }

      blendingRef.current = true
      setBlendTarget(nextIndex)
      nextVideo.currentTime = 0
      nextVideo.play().catch(() => {
        // Ignore autoplay policy errors silently.
      })

      window.setTimeout(() => {
        currentVideo.pause()
        currentVideo.currentTime = 0
        setActiveVideo(nextIndex)
        setBlendTarget(null)
        blendingRef.current = false
      }, VIDEO_BLEND_MS)
    }

    const onTimeUpdate = () => {
      const remaining = currentVideo.duration - currentVideo.currentTime
      if (remaining <= VIDEO_BLEND_MS / 1000) {
        startBlend()
      }
    }

    currentVideo.play().catch(() => {
      // Ignore autoplay policy errors silently.
    })
    currentVideo.addEventListener('timeupdate', onTimeUpdate)

    return () => {
      currentVideo.removeEventListener('timeupdate', onTimeUpdate)
    }
  }, [activeVideo])

  const toggleMenu = () => {
    setMenuOpen((current) => !current)
  }

  return (
    <header className="hero-shell">
      <video
        ref={videoARef}
        className={`hero-video hero-video-layer ${activeVideo === 0 ? 'is-current' : ''} ${blendTarget === 0 ? 'is-blend-target' : ''}`}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <video
        ref={videoBRef}
        className={`hero-video hero-video-layer ${activeVideo === 1 ? 'is-current' : ''} ${blendTarget === 1 ? 'is-blend-target' : ''}`}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      <nav className="hero-nav" aria-label="Main navigation">
        <button type="button" className="pill menu-trigger" onClick={toggleMenu}>
          <span className="menu-label">Menu</span>
          <span className="menu-bars" aria-hidden="true">
            <span />
            <span />
          </span>
        </button>

        <div className="hero-logo">EVR</div>

        <div className="nav-actions" aria-hidden="true">
          <button type="button" className="pill">About Us</button>
          <button type="button" className="pill">Services</button>
          <button type="button" className="pill cta">Get Started</button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen ? (
          <motion.aside
            className="menu-overlay"
            initial={{ clipPath: 'circle(0% at 80px 40px)' }}
            animate={{ clipPath: 'circle(150% at 80px 40px)' }}
            exit={{ clipPath: 'circle(0% at 80px 40px)' }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="menu-nav">
              <button type="button" className="pill menu-close" onClick={toggleMenu}>
                <span className="menu-label">Close</span>
                <span className="x-icon" aria-hidden="true">
                  <span />
                  <span />
                </span>
              </button>

              <div className="overlay-logo">EVR</div>
              <div className="overlay-spacer" aria-hidden="true" />
            </div>

            <div className="overlay-links" role="navigation" aria-label="Menu links">
              {menuItems.map((item, i) => (
                <motion.a
                  key={item}
                  href="#"
                  className="overlay-link"
                  initial={{ opacity: 0, x: -60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{
                    delay: 0.15 + i * 0.08,
                    duration: 0.55,
                    ease: [0.25, 1, 0.5, 1],
                  }}
                >
                  <span>{item}</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </motion.a>
              ))}
            </div>

            <div className="overlay-footer">
              <span>Evolve Responsible Ventures</span>
              <span>© 2026</span>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      <main className="hero-main">
        <div className="subheading-row">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
          <span>Evolve Responsible Ventures</span>
        </div>

        <div className="hero-content-row">
          <h1>
            <span className="line-light">Navigating the</span>
            <span className="line-light">route to impactful</span>
            <span className="line-display">regeneration</span>
          </h1>

          <aside className="hero-stats" aria-label="Performance summary">
            <div className="progress-wrap">
              <svg viewBox="0 0 120 120" role="img" aria-label="75 percent progress">
                <circle
                  cx="60"
                  cy="60"
                  r={progressMetrics.radius}
                  stroke="hsl(var(--foreground) / 0.15)"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={progressMetrics.radius}
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={progressMetrics.circumference}
                  strokeDashoffset={progressMetrics.dashOffset}
                  className="progress-ring"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="progress-value">75%</div>
            </div>

            <p>
              Guiding organizations toward lasting environmental performance
              through actionable strategy and measurable outcomes
            </p>
          </aside>
        </div>
      </main>

      <section className="partners" aria-label="Partners marquee">
        <div className="partners-top">
          <span>Our Partners</span>
          <span className="partners-right">Backed by 30+ global brands</span>
        </div>

        <div className="partners-marquee-wrap">
          <div className="partners-marquee">
            {[...partners, ...partners].map((brand, index) => (
              <span key={`${brand}-${index}`}>{brand}</span>
            ))}
          </div>
        </div>
      </section>
    </header>
  )
}

export default HeaderSection
