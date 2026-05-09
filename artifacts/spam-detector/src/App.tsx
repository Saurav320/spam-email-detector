import { useState, useRef } from "react";
import { ShieldAlert, ShieldCheck, Mail, Loader2, Sparkles, RotateCcw } from "lucide-react";

type PredictionResult = "Spam Mail" | "Ham Mail" | null;
type AppState = "idle" | "loading" | "result" | "error";

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<PredictionResult>(null);
  const [appState, setAppState] = useState<AppState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      textareaRef.current?.focus();
      return;
    }

    setAppState("loading");
    setResult(null);
    setErrorMsg("");

    try {
      const res = await fetch("/ml-api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error: ${res.status}`);
      }

      const data = await res.json();
      setResult(data.result as PredictionResult);
      setAppState("result");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMsg(msg);
      setAppState("error");
    }
  };

  const handleReset = () => {
    setMessage("");
    setResult(null);
    setAppState("idle");
    setErrorMsg("");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit();
    }
  };

  const isSpam = result === "Spam Mail";
  const isLoading = appState === "loading";
  const hasResult = appState === "result";
  const hasError = appState === "error";

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, hsl(220,40%,95%) 0%, hsl(250,40%,96%) 100%)" }}
    >
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
            <Mail className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-foreground tracking-tight">Spam Detector</h1>
        <p className="mt-2 text-muted-foreground text-base max-w-sm mx-auto">
          Paste any email or message below to instantly detect if it's spam or legitimate.
        </p>
      </div>

      {/* Main card */}
      <div
        className="w-full max-w-2xl bg-card border border-card-border rounded-2xl p-8 shadow-xl transition-all duration-300"
        data-testid="main-card"
      >
        {/* Textarea */}
        <label htmlFor="email-input" className="block text-sm font-semibold text-foreground mb-2">
          Email / Message Content
        </label>
        <textarea
          id="email-input"
          ref={textareaRef}
          data-testid="input-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste your email or message here…&#10;&#10;Tip: Press Ctrl+Enter to check quickly."
          rows={8}
          disabled={isLoading}
          className="w-full resize-none rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground mt-1.5 text-right">
          {message.trim().length} character{message.trim().length !== 1 ? "s" : ""}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            data-testid="button-check"
            onClick={handleSubmit}
            disabled={isLoading || !message.trim()}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground shadow-md hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Check Spam
              </>
            )}
          </button>

          {(hasResult || hasError || message.trim()) && (
            <button
              data-testid="button-reset"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium border border-border bg-secondary text-secondary-foreground hover:bg-accent transition-all duration-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Result Card */}
        {hasResult && result && (
          <div
            data-testid={`result-${isSpam ? "spam" : "ham"}`}
            className={`mt-6 rounded-xl p-6 border-2 flex items-center gap-5 transition-all duration-500 animate-in fade-in slide-in-from-bottom-3 ${
              isSpam
                ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                : "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
            }`}
          >
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                isSpam ? "bg-red-100 dark:bg-red-900/50" : "bg-green-100 dark:bg-green-900/50"
              }`}
            >
              {isSpam ? (
                <ShieldAlert className="w-7 h-7 text-red-600 dark:text-red-400" />
              ) : (
                <ShieldCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
              )}
            </div>

            {/* Text */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
                Detection Result
              </p>
              <p
                className={`text-2xl font-bold ${
                  isSpam ? "text-red-700 dark:text-red-400" : "text-green-700 dark:text-green-400"
                }`}
              >
                {result}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isSpam
                  ? "This message looks suspicious. Be careful — do not click links or share personal info."
                  : "This message appears to be legitimate. It looks safe to read."}
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div
            data-testid="result-error"
            className="mt-6 rounded-xl p-4 border-2 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800 text-sm text-orange-700 dark:text-orange-400 animate-in fade-in slide-in-from-bottom-3"
          >
            <strong>Error:</strong> {errorMsg}
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="mt-8 w-full max-w-2xl">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 text-center">
          Try an example
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { label: "🎉 Prize winner", text: "Congratulations! You've won a $1000 gift card. Click here to claim your prize now!" },
            { label: "💊 Buy cheap meds", text: "Buy Viagra, Cialis online cheap! No prescription needed. Discreet delivery." },
            { label: "📅 Meeting invite", text: "Hi, are you free for a quick call on Thursday at 3pm to discuss the project update?" },
            { label: "📦 Package delivery", text: "Your Amazon order #112-456 has been shipped and will arrive by Friday. Track here." },
          ].map(({ label, text }) => (
            <button
              key={label}
              data-testid={`example-${label}`}
              onClick={() => {
                setMessage(text);
                setResult(null);
                setAppState("idle");
                setErrorMsg("");
              }}
              className="rounded-full px-3 py-1.5 text-xs font-medium border border-border bg-card hover:bg-accent text-foreground transition-all duration-150 hover:scale-105"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs text-muted-foreground text-center">
        Powered by a Naïve Bayes classifier · Python Flask API · React + Vite
      </p>
    </div>
  );
}

export default App;
