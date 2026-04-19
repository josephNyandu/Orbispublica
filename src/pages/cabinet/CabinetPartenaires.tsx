import { Link } from 'react-router';
import { Handshake } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { PageHeroBanner } from '@/components/PageHeroBanner';

export function CabinetPartenaires() {
  return (
    <>
      <SEO
        title="Partenaires — ORBIS PUBLICA"
        description="ORBIS PUBLICA collabore avec des acteurs publics, privés et des bailleurs pour la réussite des projets en RDC."
      />
      <PageHeroBanner className="py-16 md:py-20">
        <div className="container mx-auto px-6 md:px-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-blue-400">Réseau</p>
          <h1 className="text-4xl font-bold md:text-5xl">Partenaires</h1>
          <p className="mt-4 max-w-3xl text-lg text-slate-300">
            Le cabinet s&apos;appuie sur un écosystème de partenaires institutionnels, techniques et financiers pour sécuriser et valoriser
            vos projets.
          </p>
        </div>
      </PageHeroBanner>

      <section className="bg-white py-20">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Handshake className="h-8 w-8 text-blue-600" aria-hidden />
            </div>
            <h2 className="mb-4 text-2xl font-bold text-slate-900">Alliance de confiance</h2>
            <p className="leading-relaxed text-slate-600">
              Institutions publiques, organismes de financement, acteurs du secteur privé et experts sectoriels : nous construisons des
              partenariats durables, transparents et alignés sur vos objectifs de développement et de conformité.
            </p>
            <p className="mt-6 text-sm text-slate-500">
              Pour échanger sur un partenariat ou une collaboration, contactez-nous via la page{' '}
              <Link to="/contact" className="font-medium text-blue-600 hover:underline">
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
