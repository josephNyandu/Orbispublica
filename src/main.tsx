import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// #region agent log
if (import.meta.env.DEV) {
  function argToString(a: unknown): string {
    if (typeof a === "string") return a;
    if (a instanceof Error) return `${a.message}\n${a.stack ?? ""}`;
    if (typeof a === "object" && a !== null && "toString" in a)
      try {
        return String((a as { toString: () => string }).toString());
      } catch {
        /* fall through */
      }
    try {
      return JSON.stringify(a);
    } catch {
      return "";
    }
  }

  function logRefWarningIfPresent(
    sink: "error" | "warn",
    args: unknown[],
  ): void {
    const detail = args.map(argToString).filter(Boolean).join("\n---\n");
    if (!detail.includes("cannot be given refs")) return;
    fetch("http://127.0.0.1:7791/ingest/67dc14b1-df55-42fa-917c-cba48eaf667f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "2fce30",
      },
      body: JSON.stringify({
        sessionId: "2fce30",
        location: `main.tsx:console.${sink}`,
        message: "React ref-on-function-component warning",
        data: { hypothesisId: "H-console", detail: detail.slice(0, 4000) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }

  const origError = console.error;
  console.error = (...args: unknown[]) => {
    try {
      logRefWarningIfPresent("error", args);
    } catch {
      /* ignore */
    }
    origError.apply(console, args as Parameters<typeof console.error>);
  };

  const origWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    try {
      logRefWarningIfPresent("warn", args);
    } catch {
      /* ignore */
    }
    origWarn.apply(console, args as Parameters<typeof console.warn>);
  };
}
// #endregion

createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
  