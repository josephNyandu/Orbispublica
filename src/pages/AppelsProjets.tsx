import { PageHeroBanner } from '@/components/PageHeroBanner';
import { OpportunityPostsSection } from '@/components/OpportunityPostsSection';
import { OpportuniteRegistreAvertissement } from '@/components/OpportuniteRegistreAvertissement';
import { OpportuniteSuivantNav } from '@/components/OpportuniteSuivantNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export function AppelsProjets() {
  return (
    <div className="pt-20">
      <PageHeroBanner className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Appels à projets</h1>
          <Breadcrumbs items={[{ label: 'Opportunités', to: '/opportunites' }, { label: 'Appels à projets' }]} />
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Veille sur les appels à manifestation d&apos;intérêt, appels à propositions et programmes auprès
            des bailleurs multilatéraux, de l&apos;Union européenne et des fonds sectoriels. Les annonces
            ci-dessous sont celles enregistrées dans la base du site et publiées depuis l&apos;espace
            d&apos;administration.
          </p>
        </div>
      </PageHeroBanner>

      <OpportuniteRegistreAvertissement />
      <OpportunityPostsSection category="appels-a-projets" />
      <OpportuniteSuivantNav category="appels-a-projets" />
    </div>
  );
}
