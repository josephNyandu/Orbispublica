import { Newspaper, CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { SEO } from '@/components/SEO';

const posts = [
  {
    title: 'Les enjeux de la transparence dans les marchés publics en RDC',
    excerpt:
      "Analyse des nouvelles réformes visant à renforcer la redevabilité et l'efficacité de la dépense publique.",
    date: '15 Nov 2024',
    category: 'Analyse',
  },
  {
    title: 'Comment réussir son financement auprès des bailleurs internationaux ?',
    excerpt: 'Guide pratique pour structurer votre projet et répondre aux exigences de la Banque Mondiale et de la BAD.',
    date: '02 Nov 2024',
    category: 'Financement',
  },
  {
    title: 'Nouvelles incitations fiscales pour les PME agricoles',
    excerpt: "Décryptage des dispositions récentes du Code des investissements favorisant l'agrobusiness.",
    date: '20 Oct 2024',
    category: 'Réglementation',
  },
];

export function PublicationsActualites() {
  return (
    <>
      <SEO
        title="Actualités — Publications"
        description="Analyses, veille et retours d’expérience ORBIS PUBLICA sur la commande publique, les financements et le développement."
      />
      <PageHeroBanner className="py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">Actualités</h1>
          <p className="mt-6 max-w-3xl text-xl text-slate-300">
            Notes de veille, décryptages réglementaires et articles de fond issus de notre pratique terrain.
          </p>
        </div>
      </PageHeroBanner>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <p className="max-w-2xl text-slate-600">
              Une sélection d’articles et d’analyses. Pour l’ensemble des contenus & ressources, consultez également notre{' '}
              <Link to="/blog" className="font-semibold text-blue-700 underline-offset-4 hover:underline">
                espace Blog
              </Link>
              .
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {posts.map((post, index) => (
              <article
                key={index}
                className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative h-48 animate-pulse-slow bg-slate-200">
                  <div className="absolute left-4 top-4 rounded bg-blue-500 px-2 py-1 text-xs font-bold text-white">
                    {post.category}
                  </div>
                  <div className="flex h-full w-full items-center justify-center text-slate-400">
                    <Newspaper className="h-12 w-12 opacity-20" aria-hidden />
                  </div>
                </div>
                <div className="flex flex-grow flex-col p-6">
                  <div className="mb-3 flex items-center text-xs text-slate-500">
                    <CalendarDays className="mr-1 h-3 w-3" aria-hidden />
                    {post.date}
                  </div>
                  <h2 className="mb-3 line-clamp-2 text-xl font-bold text-slate-900">{post.title}</h2>
                  <p className="mb-6 line-clamp-3 flex-grow text-sm text-slate-600">{post.excerpt}</p>
                  <a
                    href="#"
                    className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    Lire l&apos;article <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h3 className="mb-4 text-2xl font-bold text-slate-900">Newsletter</h3>
            <p className="mx-auto mb-6 max-w-2xl text-slate-600">
              Recevez nos dernières analyses et invitations aux événements du cabinet.
            </p>
            <div className="mx-auto flex max-w-md flex-col justify-center gap-4 sm:flex-row">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="w-full rounded-md border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="whitespace-nowrap rounded-md bg-slate-800 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-700"
              >
                S&apos;inscrire
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
