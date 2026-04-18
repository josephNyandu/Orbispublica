import { OpportunityPostsSection } from '@/components/OpportunityPostsSection';
import { OpportuniteRegistreAvertissement } from '@/components/OpportuniteRegistreAvertissement';
import { OpportuniteSuivantNav } from '@/components/OpportuniteSuivantNav';

export function AlertesPersonnalises() {
  return (
    <div className="pt-20">
      <div className="bg-slate-800 py-14 md:py-20 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Opportunités
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Autres opportunités stratégiques</h1>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">
            Exemples de veilles ciblées (secteurs, zones, mots-clés) et d&apos;annonces associées. Les fiches
            ci-dessous sont des données de démonstration enregistrées comme les autres opportunités du site.
          </p>
        </div>
      </div>

      <OpportuniteRegistreAvertissement />
      <OpportunityPostsSection category="alertes-personnalisees" />
      <OpportuniteSuivantNav category="alertes-personnalisees" />
    </div>
  );
}
