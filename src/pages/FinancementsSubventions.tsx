import { PageHeroBanner } from '@/components/PageHeroBanner';
import { OpportunityPostsSection } from '@/components/OpportunityPostsSection';
import { OpportuniteRegistreAvertissement } from '@/components/OpportuniteRegistreAvertissement';
import { OpportuniteSuivantNav } from '@/components/OpportuniteSuivantNav';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export function FinancementsSubventions() {
  return (
    <div className="pt-20">
      <PageHeroBanner className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Financements &amp; subventions</h1>
          <Breadcrumbs items={[{ label: 'Opportunités', to: '/opportunites' }, { label: 'Financements & subventions' }]} />
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Identification des instruments de financement adaptés à votre projet : subventions publiques,
            fonds sectoriels, lignes multilatérales et mécanismes de garantie. Les annonces ci-dessous sont
            celles enregistrées dans la base du site et publiées depuis l&apos;espace d&apos;administration.
          </p>
        </div>
      </PageHeroBanner>

      <OpportuniteRegistreAvertissement />
      <OpportunityPostsSection category="financements-subventions" />
      <OpportuniteSuivantNav category="financements-subventions" />
    </div>
  );
}
