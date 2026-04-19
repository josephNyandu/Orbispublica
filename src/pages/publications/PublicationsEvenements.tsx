import { Mic, Users, Video } from 'lucide-react';
import { Link } from 'react-router';
import { PageHeroBanner } from '@/components/PageHeroBanner';
import { SEO } from '@/components/SEO';

const upcoming = [
  {
    title: 'Table ronde — Marchés publics et intégrité',
    date: 'À venir — T1 2026',
    format: 'Hybride (Kinshasa + visio)',
    icon: Mic,
  },
  {
    title: 'Atelier financement multi-bailleurs',
    date: 'Sur invitation',
    format: 'Session réservée aux partenaires',
    icon: Users,
  },
  {
    title: 'Webinaire — PPP et projets structurants',
    date: 'Prochaine session',
    format: 'En ligne',
    icon: Video,
  },
];

export function PublicationsEvenements() {
  return (
    <>
      <SEO
        title="Événements — Publications"
        description="Conférences, webinaires et rencontres ORBIS PUBLICA autour de la commande publique, des financements et des PPP."
      />
      <PageHeroBanner className="py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">Événements</h1>
          <p className="mt-6 max-w-3xl text-xl text-slate-300">
            Rencontres, tables rondes et formats en ligne pour échanger avec les décideurs publics, les bailleurs et le secteur privé.
          </p>
        </div>
      </PageHeroBanner>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">Agenda & invitations</h2>
            <p className="mt-4 text-slate-600">
              Les dates précises et modalités d’inscription sont communiquées par newsletter et sur nos canaux officiels.
            </p>
          </div>

          <ul className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-1">
            {upcoming.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex gap-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 md:gap-6 md:p-8"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                    <Icon className="h-7 w-7" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 md:text-xl">{item.title}</h3>
                    <p className="mt-2 text-sm font-medium text-blue-700">{item.date}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.format}</p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mx-auto mt-16 max-w-2xl rounded-xl border border-blue-100 bg-blue-50/60 p-8 text-center">
            <p className="text-slate-700">
              Pour proposer un partenariat événementiel ou inviter un intervenant du cabinet, écrivez-nous via la page{' '}
              <Link to="/contact" className="font-semibold text-blue-800 underline-offset-4 hover:underline">
                Contact
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
