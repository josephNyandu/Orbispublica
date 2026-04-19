import { PageHeroBanner } from '@/components/PageHeroBanner';
import { OpportunityPostsSection } from '@/components/OpportunityPostsSection';
import { OpportuniteRegistreAvertissement } from '@/components/OpportuniteRegistreAvertissement';
import { OpportuniteSuivantNav } from '@/components/OpportuniteSuivantNav';

export function ProjetsPppInvestissement() {
  return (
    <div className="pt-20">
      <PageHeroBanner className="py-14 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Opportunités
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Projets PPP / investissement</h1>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Structuration de partenariats public-privé, analyse de faisabilité et alignement avec les
            investisseurs et les autorités contractantes. Les annonces ci-dessous sont celles enregistrées
            dans la base du site et publiées depuis l&apos;espace d&apos;administration.
          </p>
        </div>
      </PageHeroBanner>

      <OpportuniteRegistreAvertissement />
      <OpportunityPostsSection category="projets-ppp-investissement" />
      <OpportuniteSuivantNav category="projets-ppp-investissement" />
    </div>
  );
}
