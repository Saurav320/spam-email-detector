import { useState, useRef } from "react";

const EXAMPLES = [
  {
    label: "🎉 Prize winner",
    text: "Congratulations! You've won a $1000 gift card. Click here to claim your prize NOW before it expires!",
  },
  {
    label: "💊 Cheap meds",
    text: "Buy Viagra, Cialis online cheap! No prescription needed. Fast discreet delivery worldwide.",
  },
  {
    label: "📅 Meeting invite",
    text: "Hi, are you free for a quick call on Thursday at 3pm to discuss the quarterly project update?",
  },
  {
    label: "📦 Delivery notice",
    text: "Your Amazon order #112-456 has been shipped and will arrive by Friday. Track your package here.",
  },
];

export default function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null as "Spam Mail" | "Ham Mail" | null);
  const [status, setStatus] = useState("idle" as "idle" | "loading" | "result" | "error");
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef(null as HTMLTextAreaElement | null);

  async function handleCheck() {
    const trimmed = message.trim();
    if (!trimmed) { textareaRef.current?.focus(); return; }

    setStatus("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as any).error ?? `Server error: ${res.status}`);
      }

      const data = await res.json() as { prediction: "Spam Mail" | "Ham Mail" };
      setResult(data.prediction);
      setStatus("result");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  function handleReset() {
    setMessage("");
    setResult(null);
    setStatus("idle");
    setErrorMsg("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleCheck();
  }

  const isLoading = status === "loading";
  const isSpam = result === "Spam Mail";

  return (
    <>
      {/* Background */}
      <div className="bg-scene" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="blob blob-4" />
        <div className="bg-grid" />
      </div>

      <div className="page">
        {/* Header */}
        <header className="header">
          <div className="header-icon-wrap">🛡️</div>
          <h1>AI Spam Email Detector</h1>
          <p>Detect spam emails instantly using Machine Learning</p>
        </header>

        {/* Main Card */}
        <div className="glass-card" data-testid="main-card">
          <div className="field-label">
            <span className="label-dot" />
            Email / Message Content
          </div>

          <div className="textarea-wrap">
            <textarea
              ref={textareaRef}
              className="message-textarea"
              data-testid="input-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Paste your email or message here…\n\nTip: Press Ctrl+Enter to analyze quickly."}
              rows={7}
              disabled={isLoading}
            />
          </div>
          <div className="char-count">{message.trim().length} characters</div>

          {/* Buttons */}
          <div className="btn-row">
            <button
              className="btn-primary"
              data-testid="button-check"
              onClick={handleCheck}
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  <span>Analyzing</span>
                  <div className="loading-text">
                    <span /><span /><span />
                  </div>
                </>
              ) : (
                <>✨ Check Spam</>
              )}
            </button>

            {(status !== "idle" || message.trim()) && (
              <button
                className="btn-reset"
                data-testid="button-reset"
                onClick={handleReset}
              >
                ↺ <span>Reset</span>
              </button>
            )}
          </div>

          {/* Result */}
          {status === "result" && result && (
            <div
              className={`result-card ${isSpam ? "spam" : "ham"}`}
              data-testid={`result-${isSpam ? "spam" : "ham"}`}
            >
              <div className="result-icon">
                {isSpam ? "🚨" : "✅"}
              </div>
              <div className="result-body">
                <div className="result-label">Detection Result</div>
                <div className="result-title">{result}</div>
                <div className="result-desc">
                  {isSpam
                    ? "⚠️ This message appears suspicious. Do not click links or share personal info."
                    : "✔ This message looks legitimate and safe to read."}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="error-card" data-testid="result-error">
              ⚠️ <strong>Error:</strong> {errorMsg}
            </div>
          )}
        </div>

        {/* Examples */}
        <div className="examples">
          <div className="examples-label">Try an example</div>
          <div className="examples-pills">
            {EXAMPLES.map(({ label, text }) => (
              <button
                key={label}
                className="pill"
                onClick={() => {
                  setMessage(text);
                  setResult(null);
                  setStatus("idle");
                  setErrorMsg("");
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          Developed by <span>Saurav Kumar</span> using <span>React</span>, <span>Flask</span> and <span>Machine Learning</span>
        </footer>
      </div>
    </>
  );
}
