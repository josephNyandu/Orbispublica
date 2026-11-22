import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import { OrbisChatIcon } from '@/components/icons/OrbisChatIcon';
import { useSiteContact } from '@/hooks/useSiteContact';
import { answerQuestion, suggestedQuestions, type ChatLink } from '@/lib/chatbotEngine';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  links?: ChatLink[];
};

export function ChatbotLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const { contact } = useSiteContact();
  const [question, setQuestion] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: 'Bonjour, comment pouvons-nous vous aider ?',
    },
  ]);

  const submitQuestion = (rawQuestion: string) => {
    const nextQuestion = rawQuestion.trim();
    if (!nextQuestion) {
      return;
    }

    const answer = answerQuestion(nextQuestion, contact);
    const stamp = Date.now();
    setMessages((prev) => [...prev, { id: stamp, role: 'user', text: nextQuestion }]);
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: stamp + 1, role: 'assistant', ...answer }]);
    }, 350);
    setQuestion('');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, isOpen]);

  const handleSubmitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuestion(question);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-6 sm:right-6">
      {isOpen && (
        <div
          className="mb-3 flex max-h-[min(36rem,calc(100dvh-8rem))] w-[calc(100vw-2.5rem)] max-w-[22rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          role="dialog"
          aria-modal="false"
          aria-label="Assistant ORBIS Publica"
        >
          <div className="flex items-center gap-3 bg-blue-900 px-4 py-3.5 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <OrbisChatIcon className="h-6 w-6" />
            </span>
            <p className="flex-1 text-base font-semibold">Assistant ORBIS</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              aria-label="Fermer le chatbot"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-4 text-[15px] leading-snug">
            {messages.map((message) => (
              <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={`max-w-[88%] px-3.5 py-2.5 ${
                    message.role === 'user'
                      ? 'rounded-2xl rounded-br-sm bg-blue-900 text-white'
                      : 'rounded-2xl rounded-bl-sm border border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  <p>{message.text}</p>
                  {message.links && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {message.links.map((l) => (
                        <Link
                          key={l.to}
                          to={l.to}
                          onClick={() => setIsOpen(false)}
                          className="rounded-full bg-blue-50 px-3 py-1 text-[13px] font-semibold text-blue-900 transition-colors hover:bg-blue-100"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-col items-start gap-2 pt-1">
                {suggestedQuestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => submitQuestion(suggestion)}
                    className="rounded-full border border-blue-200 bg-white px-3.5 py-2 text-left text-sm font-medium text-blue-900 transition-colors hover:border-blue-900 hover:bg-blue-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-white px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {suggestedQuestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submitQuestion(suggestion)}
                  className="shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[13px] text-slate-700 transition-colors hover:border-blue-900 hover:text-blue-900"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmitQuestion} className="flex items-center gap-2 border-t border-slate-200 bg-white p-3">
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Votre question"
              className="min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-400 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
              aria-label="Votre question"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-900 text-white transition-colors hover:bg-blue-800 disabled:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-900 focus-visible:ring-offset-2"
              aria-label="Envoyer"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-900 text-white shadow-xl transition-all hover:scale-105 hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-label={isOpen ? 'Fermer le chatbot' : 'Ouvrir le chatbot'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden /> : <OrbisChatIcon className="h-8 w-8" />}
      </button>
    </div>
  );
}
