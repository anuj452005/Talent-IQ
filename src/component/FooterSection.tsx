import './FooterSection.css'

type FooterSectionProps = {
  videoSrc: string
}

const socialItems = ['X', 'in', 'gh', 'yt', 'sl']
const FALLBACK_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_024928_1efd0b0d-6c02-45a8-8847-1030900c4f63.mp4'

function FooterSection({ videoSrc }: FooterSectionProps) {
  return (
    <footer className="footer-section" aria-label="Promotional footer">
      <div className="footer-content">
        <div className="watch-side" aria-hidden="true">
          <div className="watch-glow watch-glow-top" />
          <div className="watch-glow watch-glow-bottom" />
          <div className="watch-frame">
            <video
              className="watch-video"
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              onError={(event) => {
                const current = event.currentTarget
                if (current.src !== FALLBACK_VIDEO_URL) {
                  current.src = FALLBACK_VIDEO_URL
                  current.play().catch(() => {
                    // Ignore autoplay policy errors silently.
                  })
                }
              }}
            />
          </div>
        </div>

        <div className="cta-side">
          <h2>
            <span>Join the</span>
            <span>Movement</span>
          </h2>
          <p>
            Unlock the future of productivity with Huly. Remember, this journey is
            just getting started.
          </p>

          <div className="cta-actions">
            <button type="button" className="primary-action">See in Action</button>
            <button type="button" className="secondary-action">Join Our Slack</button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-left">
          <span>Copyright © 2026 Huly Labs. All rights reserved.</span>
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>

        <div className="footer-right">
          <div className="socials" aria-label="Social links">
            {socialItems.map((item) => (
              <a key={item} href="#" aria-label={item}>
                {item}
              </a>
            ))}
          </div>
          <p>Made with passion and Huly</p>
        </div>
      </div>
    </footer>
  )
}

export default FooterSection
