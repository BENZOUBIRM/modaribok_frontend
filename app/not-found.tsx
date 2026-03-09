import Link from "next/link"

/**
 * Root-level 404 — renders outside all providers (no theme, no i18n, no layout).
 * This is the ultimate fallback for paths that bypass the [lang] segment entirely.
 * Uses prefers-color-scheme for basic dark mode and embedded CSS classes since
 * Tailwind classes may not be available outside the layout.
 */
export default function RootNotFound() {
  return (
    <html lang="en" dir="ltr">
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --bg: #EDF3FA;
                --card-bg: #ffffff;
                --decorative-bg: #eaf0fd;
                --heading-color: #1F2A3D;
                --text-color: #6B7B8F;
                --accent: #2869E8;
                --accent-hover: #153B89;
                --accent-text: #2869E8;
                --shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
              }
              @media (prefers-color-scheme: dark) {
                :root {
                  --bg: #0a0a0a;
                  --card-bg: #18181b;
                  --decorative-bg: #1a1e2e;
                  --heading-color: #f4f4f5;
                  --text-color: #a1a1aa;
                  --accent: #3b82f6;
                  --accent-hover: #2563eb;
                  --accent-text: #60a5fa;
                  --shadow: 0 10px 15px -3px rgb(255 255 255 / 0.05), 0 4px 6px -4px rgb(255 255 255 / 0.05);
                }
              }
              .rnf-body {
                margin: 0;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: var(--bg);
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                padding: 1.5rem;
              }
              .rnf-card {
                width: 100%;
                max-width: 40rem;
                overflow: hidden;
                border-radius: 1rem;
                background-color: var(--card-bg);
                box-shadow: var(--shadow);
                display: flex;
                flex-direction: column;
              }
              .rnf-decorative {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 0.75rem;
                background-color: var(--decorative-bg);
                padding: 2.5rem;
              }
              .rnf-code {
                font-size: 5rem;
                font-weight: 800;
                letter-spacing: -0.05em;
                color: var(--accent-text);
                opacity: 0.8;
                line-height: 1;
              }
              .rnf-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1.25rem;
                padding: 2rem;
                text-align: center;
              }
              .rnf-heading {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--heading-color);
                margin: 0;
              }
              .rnf-text {
                font-size: 0.875rem;
                color: var(--text-color);
                line-height: 1.6;
                margin: 0;
              }
              .rnf-link {
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                border-radius: 0.5rem;
                background-color: var(--accent);
                padding: 0.75rem 1.5rem;
                font-size: 0.875rem;
                font-weight: 500;
                color: #ffffff;
                text-decoration: none;
                transition: background-color 0.2s;
              }
              .rnf-link:hover {
                background-color: var(--accent-hover);
              }
            `,
          }}
        />
      </head>
      <body className="rnf-body">
        <div className="rnf-card">
          {/* Decorative panel */}
          <div className="rnf-decorative">
            <span className="rnf-code">404</span>
          </div>

          {/* Content panel */}
          <div className="rnf-content">
            <h1 className="rnf-heading">Page Not Found</h1>
            <p className="rnf-text">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
            <Link href="/" className="rnf-link">
              Back to Homepage
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
