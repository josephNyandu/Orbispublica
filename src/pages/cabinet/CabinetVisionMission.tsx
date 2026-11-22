import { Eye, Target, ShieldCheck, Lightbulb } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeroBanner } from '@/components/PageHeroBanner';

const blocks = [
  {
    title: 'Notre vision',
    icon: Eye,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    body: 'Contribuer à des organisations responsables, bien gouvernées et performantes, ainsi qu’à un développement socio-économique durable.',
  },
  {
    title: 'Notre mission',
    icon: Target,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    body: 'Accompagner les acteurs publics et privés en matière de conformité, de gouvernance, de commande publique et d’ingénierie de projets, par des solutions juridiques, institutionnelles, techniques et stratégiques adaptées à leurs besoins.',
  },
  {
    title: 'Nos convictions',
    icon: ShieldCheck,
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    body: 'L’intégrité, la transparence, la redevabilité et la conformité sont les fondements d’une gouvernance responsable et d’une performance durable.',
  },
  {
    title: 'Notre plus-value',
    icon: Lightbulb,
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    body: 'Une expertise juridique, institutionnelle et stratégique, des compétences en commande publique, en ingénierie et en management de projets, fondées sur la maîtrise du cadre juridique, institutionnel et réglementaire de la RDC et la connaissance des référentiels et bonnes pratiques internationaux.',
  },
] as const;

export function CabinetVisionMission() {
  return (
    <>
      <SEO
        title="Vision et mission — ORBIS PUBLICA"
        description="Vision, mission, convictions et plus-value d’ORBIS PUBLICA : une approche intégrée au service de la conformité, de la gouvernance et de la performance."
      />
      <PageHeroBanner className="py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl font-bold md:text-5xl">Vision et mission</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Une approche intégrée au service de la conformité, de la gouvernance et de la performance.
          </p>
        </div>
      </PageHeroBanner>

      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {blocks.map(({ title, icon: Icon, iconBg, iconColor, body }) => (
              <div key={title} className="rounded-xl border border-slate-100 bg-white p-8 shadow-sm">
                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
                  <Icon className={`h-6 w-6 ${iconColor}`} aria-hidden />
                </div>
                <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
                <p className="leading-relaxed text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
