import { PageHeroBanner } from "@/components/PageHeroBanner";
import { OpportunityPostsSection } from "@/components/OpportunityPostsSection";
import { OpportuniteSuivantNav } from "@/components/OpportuniteSuivantNav";

const SEGMENT_COPY = {
  ppp: {
    kicker: "PPP",
    title: "Partenariats public-privé",
    lead:
      "Appels d'offres et consultations liés aux projets en partenariat public-privé. Les annonces publiées sur cette rubrique sont les mêmes que pour les appels d'offres généraux, mises en avant pour la thématique PPP.",
  },
  "marches-publics": {
    kicker: "Marchés publics",
    title: "Opportunités",
    lead:
      "Marchés publics et procédures de consultation en RDC. Les annonces ci-dessous sont celles de la base « Appels d'offres » du site, présentées sous l'angle des marchés publics.",
  },
} as const;

type Segment = keyof typeof SEGMENT_COPY;

type Props = { segment: Segment };

export function OpportunitesSegmentPage({ segment }: Props) {
  const copy = SEGMENT_COPY[segment];
  return (
    <div className="pt-20">
      <PageHeroBanner>
        <div className="container mx-auto px-6 md:px-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-3">{copy.kicker}</p>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">{copy.title}</h1>
          <p className="text-xl text-slate-300 max-w-3xl leading-relaxed">{copy.lead}</p>
        </div>
      </PageHeroBanner>

      <OpportunityPostsSection category="opportunites" />
      <OpportuniteSuivantNav category="opportunites" />
    </div>
  );
}
