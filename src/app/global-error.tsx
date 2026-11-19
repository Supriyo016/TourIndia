"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en-IN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Something went wrong | Tour India</title>
        <style>{`
          *{margin:0;box-sizing:border-box}
          body{font-family:system-ui,-apple-system,sans-serif;background:#fbf8f2;color:#13262b;display:flex;min-height:100dvh;align-items:center;justify-content:center;padding:2rem;text-align:center}
          @media(prefers-color-scheme:dark){body{background:#0e1a20;color:#f2eee6}}
          h1{font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;margin-top:1.5rem}
          p{margin-top:0.75rem;color:#5a6c72;max-width:28rem;line-height:1.6}
          @media(prefers-color-scheme:dark){p{color:#9dacaf}}
          .actions{margin-top:1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap;justify-content:center}
          button,a{display:inline-flex;min-height:2.75rem;align-items:center;padding:0 1.5rem;border-radius:0.625rem;font-weight:600;font-size:0.95rem;cursor:pointer;text-decoration:none;transition:transform 150ms}
          button{background:#14505c;color:#fff;border:none}
          button:hover{transform:translateY(-1px)}
          a{border:1.5px solid #e2d9c8;color:#14505c;background:transparent}
          @media(prefers-color-scheme:dark){a{border-color:#2a4049;color:#dcebee}button{background:#1a6b7a}}
          svg{width:min(10rem,40vw);height:auto}
          .wobble{animation:wobble 2s ease-in-out infinite;transform-origin:50% 50%}
          @keyframes wobble{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
          @media(prefers-reduced-motion:reduce){.wobble{animation:none}}
        `}</style>
      </head>
      <body>
        <div>
          <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <circle cx="80" cy="80" r="72" fill="#dcebee" opacity="0.4" />
            <circle cx="80" cy="80" r="52" fill="#fff" stroke="#e2d9c8" strokeWidth="2" />
            <g className="wobble">
              <path d="M80 50 L76 80 L84 80 Z" fill="#b3261e" opacity="0.7" />
              <path d="M80 110 L76 80 L84 80 Z" fill="#14505c" opacity="0.5" />
            </g>
            <circle cx="80" cy="80" r="4" fill="#e8890c" />
            <path d="M55 50 L62 65 L58 75 L64 82" stroke="#b3261e" strokeWidth="1.5" fill="none" opacity="0.3" strokeLinecap="round" />
          </svg>
          <h1>Something went wrong</h1>
          <p>The whole page ran into a problem. This is rare — your data is safe.</p>
          <div className="actions">
            <button type="button" onClick={reset}>Try again</button>
            <a href="/">Back to home</a>
          </div>
        </div>
      </body>
    </html>
  );
}
