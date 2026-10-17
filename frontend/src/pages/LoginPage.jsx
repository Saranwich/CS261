import { useState } from "react";

/* ---------- Compass icon ---------- */
function CompassIcon({ size = 56 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      aria-hidden="true"
      className="cl-compass"
    >
      <circle cx="28" cy="28" r="28" fill="currentColor" />
      {/* needle */}
      <g transform="rotate(45 28 28)">
        <rect x="23" y="21" width="10" height="14" rx="2.5" fill="#fff" />
        <circle cx="28" cy="28" r="2.6" fill="currentColor" />
      </g>
    </svg>
  );
}

/* ---------- Login page ---------- */
export default function LoginPage({ onSubmit }) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!studentId.trim() || !password) {
      setError("Please enter your Student ID and password.");
      return;
    }

    try {
      setLoading(true);
      // ต่อ API จริงของคุณที่นี่ผ่าน prop onSubmit
      if (onSubmit) await onSubmit({ studentId: studentId.trim(), password });
    } catch (err) {
      setError(err?.message || "Login failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-page">
      <style>{css}</style>

      <header className="cl-header">
        <h1 className="cl-logo" aria-label="CSTU Compass">
          <span>CSTU C</span>
          <CompassIcon />
          <span>MPASS</span>
        </h1>
        <div className="cl-header-rule" />
      </header>

      <main className="cl-main">
        <form className="cl-card" onSubmit={handleSubmit} noValidate>
          <h2 className="cl-title">Log In</h2>
          <p className="cl-subtitle">
            Enter your Student ID and password to continue.
          </p>
          <hr className="cl-divider" />

          <label className="cl-label" htmlFor="studentId">
            Student ID
          </label>
          <input
            id="studentId"
            className="cl-input"
            type="text"
            inputMode="numeric"
            autoComplete="username"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <div className="cl-label-row">
            <label className="cl-label" htmlFor="password">
              Password
            </label>
            <a className="cl-forgot" href="/forgot-password">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            className="cl-input"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="cl-error" role="alert">
              {error}
            </p>
          )}

          <button className="cl-button" type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>
      </main>
    </div>
  );
}

/* ---------- Styles ---------- */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.cl-page {
  --green: #2f6339;
  --green-dark: #265230;
  --ink: #1e2536;
  --muted: #9097a1;
  --bg: #f9fafb;

  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
  box-sizing: border-box;
}
.cl-page *, .cl-page *::before, .cl-page *::after { box-sizing: border-box; }

/* header */
.cl-header {
  padding: 9vh 5vw 0;
  text-align: center;
}
.cl-logo {
  margin: 0;
  display: inline-flex;
  align-items: center;
  color: var(--green);
  font-size: clamp(2rem, 5vw, 3.6rem);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1;
  white-space: pre;
}
.cl-logo span:first-child { margin-right: 0.04em; }
.cl-compass {
  width: 1.1em;
  height: 1.1em;
  margin: 0 0.02em;
  color: var(--green);
  flex-shrink: 0;
}
.cl-header-rule {
  height: 2px;
  background: var(--green);
  margin-top: 1.4rem;
  opacity: 0.9;
}

/* card */
.cl-main {
  display: flex;
  justify-content: center;
  padding: 3.5rem 1.25rem 4rem;
}
.cl-card {
  width: 100%;
  max-width: 505px;
  background: #fff;
  border-radius: 28px;
  padding: 3rem 2.6rem 2.8rem;
  box-shadow: 0 6px 14px rgba(30, 37, 54, 0.22);
}
.cl-title {
  margin: 0;
  font-size: 2.1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.cl-subtitle {
  margin: 1.1rem 0 0;
  font-size: 0.95rem;
  font-weight: 500;
}
.cl-divider {
  border: 0;
  height: 2px;
  background: var(--green);
  margin: 2.2rem 0 1.7rem;
}

/* fields */
.cl-label {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
}
.cl-label-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 1.4rem;
}
.cl-forgot {
  font-size: 0.95rem;
  color: var(--muted);
  text-decoration: none;
}
.cl-forgot:hover { color: var(--green); text-decoration: underline; }

.cl-input {
  display: block;
  width: 100%;
  height: 76px;
  margin-top: 0.75rem;
  padding: 0 1.3rem;
  border: 2px solid var(--green);
  border-radius: 18px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 1.25rem;
  outline: none;
  transition: box-shadow 0.15s ease;
}
.cl-input::placeholder { color: var(--muted); opacity: 0.85; }
.cl-input:focus { box-shadow: 0 0 0 4px rgba(47, 99, 57, 0.18); }

.cl-error {
  margin: 1rem 0 0;
  font-size: 0.92rem;
  color: #b3261e;
}

/* button */
.cl-button {
  display: block;
  width: 100%;
  height: 76px;
  margin-top: 1.8rem;
  border: 0;
  border-radius: 18px;
  background: var(--green);
  color: #fff;
  font: inherit;
  font-size: 1.3rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}
.cl-button:hover:not(:disabled) { background: var(--green-dark); }
.cl-button:focus-visible { outline: 3px solid rgba(47, 99, 57, 0.4); outline-offset: 3px; }
.cl-button:disabled { opacity: 0.7; cursor: not-allowed; }

@media (max-width: 520px) {
  .cl-card { padding: 2rem 1.4rem 2rem; border-radius: 22px; }
  .cl-input, .cl-button { height: 60px; font-size: 1.05rem; }
}
`;
