import { useEffect, useRef, useState } from "react";
import { toast } from "sonner@2.0.3";
import type { ClientMessage } from "@/lib/clientApi";

type Props = {
  load: () => Promise<ClientMessage[]>;
  send: (body: string) => Promise<unknown>;
  /** Auteur affiché à droite (celui qui utilise l'écran). */
  me: "client" | "admin";
  otherLabel: string;
};

export function MessageThread({ load, send, me, otherLabel }: Props) {
  const [messages, setMessages] = useState<ClientMessage[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const refresh = () => load().then(setMessages).catch(() => setMessages([]));
  useEffect(() => {
    refresh();
  }, [load]);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await send(text.trim());
      setText("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <div className="max-h-[50vh] space-y-3 overflow-y-auto border-y border-slate-200 py-4">
        {!messages && <p className="text-slate-500">Chargement…</p>}
        {messages?.length === 0 && <p className="text-slate-500">Aucun message.</p>}
        {messages?.map((m) => (
          <div key={m.id} className={`flex ${m.sender === me ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded px-3 py-2 text-[15px] ${
                m.sender === me ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-900"
              }`}
            >
              {m.sender !== me && <p className="mb-0.5 text-xs font-semibold text-slate-600">{otherLabel}</p>}
              <p className="whitespace-pre-wrap">{m.body}</p>
              <p className={`mt-1 text-xs ${m.sender === me ? "text-white/70" : "text-slate-500"}`}>
                {new Date(m.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>
      <form onSubmit={submit} className="mt-4 flex gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          maxLength={4000}
          placeholder="Votre message"
          className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2 focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="self-end rounded bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
