import { FormEvent, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  text: string;
};

const suggestedServiceQuestions = [
  'Quels services propose ORBIS Publica ?',
  'Pouvez-vous m aider pour les Marches Publics et PPP ?',
  'Comment obtenez-vous des financements et subventions ?',
  'Faites-vous de l audit et de la conformite des projets ?',
  'Proposez-vous des formations pour nos equipes ?',
];

export function ChatbotLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: 'assistant',
      text: "Bonjour, je suis l'assistant ORBIS. Posez votre question ici.",
    },
  ]);

  const submitQuestion = (rawQuestion: string) => {
    const nextQuestion = rawQuestion.trim();
    if (!nextQuestion) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', text: nextQuestion },
      {
        id: Date.now() + 1,
        role: 'assistant',
        text: "Merci pour votre question. Reponse automatique provisoire: connectez ce widget a votre API chatbot pour une reponse intelligente.",
      },
    ]);
    setQuestion('');
  };

  const handleSubmitQuestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitQuestion(question);
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-6 sm:right-6">
      {isOpen && (
        <div
          className="mb-3 w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          role="dialog"
          aria-modal="false"
          aria-label="Assistant ORBIS Publica"
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-blue-600 px-4 py-3 text-white">
            <p className="text-sm font-semibold">Assistant ORBIS</p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md p-1 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90"
              aria-label="Fermer le chatbot"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto px-4 py-4 text-sm text-slate-700">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-xl px-3 py-2 ${
                  message.role === 'user'
                    ? 'ml-8 bg-blue-600 text-white'
                    : 'mr-8 bg-slate-100 text-slate-800'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 px-3 pt-3">
            <p className="mb-2 text-xs font-medium text-slate-500">Questions possibles sur nos services</p>
            <div className="flex flex-wrap gap-2">
              {suggestedServiceQuestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => submitQuestion(suggestion)}
                  className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-left text-xs text-slate-700 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmitQuestion} className="flex gap-2 border-t border-slate-200 p-3">
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ecrivez votre question..."
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Votre question"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Envoyer
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition-all hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-label={isOpen ? 'Fermer le chatbot' : 'Ouvrir le chatbot'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" aria-hidden /> : <MessageCircle className="h-6 w-6" aria-hidden />}
      </button>
    </div>
  );
}
