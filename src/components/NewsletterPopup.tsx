import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { subscribeOpportunityFeed } from "@/lib/api";
import { EASE } from "@/components/motion/Motion";

const STORAGE_KEY = "orbis-newsletter-popup";
const SHOW_AFTER_MS = 8000;
const SNOOZE_DAYS = 30;

function wasHandledRecently(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function markHandled() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* stockage indisponible : la fenêtre pourra se rouvrir */
  }
}

/** Fenêtre d'inscription à la veille « appels d'offres », affichée une fois après quelques secondes. */
export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (wasHandledRecently()) return;
    const t = window.setTimeout(() => setOpen(true), SHOW_AFTER_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function close() {
    markHandled();
    setOpen(false);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    try {
      await subscribeOpportunityFeed({ email: email.trim() });
      markHandled();
      setStatus("done");
      window.setTimeout(() => setOpen(false), 2500);
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Inscription impossible, réessayez.");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="newsletter-title"
            className="relative w-full max-w-[34rem] rounded-t-[17rem] rounded-b-3xl border-2 border-navy bg-mint px-8 pb-10 pt-28 text-center shadow-2xl sm:px-14"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Fermer"
              className="absolute right-10 top-20 grid size-11 place-items-center rounded-full bg-white text-navy shadow transition-transform hover:scale-105 sm:right-14"
            >
              <X className="size-5" aria-hidden />
            </button>

            <h2 id="newsletter-title" className="text-3xl font-bold leading-tight text-navy sm:text-4xl">
              Inscrivez-vous à la newsletter
            </h2>
            <p className="mt-3 text-slate-700">Recevez les appels d’offres d’ORBIS PUBLICA par e-mail.</p>

            {status === "done" ? (
              <p className="mt-8 rounded-md bg-white px-4 py-4 font-semibold text-navy" role="status">
                Inscription enregistrée, merci.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="mt-8 space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre e-mail"
                  aria-label="Votre e-mail"
                  className="w-full rounded-md border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
                {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-md bg-navy px-4 py-3.5 text-base font-bold uppercase tracking-wide text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {status === "sending" ? "Envoi…" : "S’inscrire"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
