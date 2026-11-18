import { PageHeroBanner } from '@/components/PageHeroBanner';
import { OpportunityPostsSection } from '@/components/OpportunityPostsSection';
import { OpportuniteSuivantNav } from '@/components/OpportuniteSuivantNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export function Partners() {
  return (
    <div className="pt-20">
      <PageHeroBanner>
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Opportunités</h1>
          <Breadcrumbs items={[{ label: "Appels d'offres" }]} />
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Veille sur les marchés publics et appels à manifestation d&apos;intérêt en RDC. Les annonces
            ci-dessous sont celles enregistrées dans la base du site et publiées depuis l&apos;espace
            d&apos;administration.
          </p>
        </div>
      </PageHeroBanner>

      <OpportunityPostsSection category="opportunites" />
      <OpportuniteSuivantNav category="opportunites" />
    </div>
  );
}
