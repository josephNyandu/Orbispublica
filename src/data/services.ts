import type { LucideIcon } from "lucide-react";
import {
  FileText,
  Briefcase,
  Coins,
  TrendingUp,
  Building2,
  Calculator,
  Scale,
  GraduationCap,
} from "lucide-react";

export type ServiceDetailEntry = {
  slug: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** Résumé court (hero fiche + cartes liste) — aligné sur la page détail */
  description: string;
  fullDescription: string;
  image: string;
  details: string[];
  benefits: string[];
};

export const servicesData: ServiceDetailEntry[] = [
  {
    slug: "marches-publics",
    title: "Marchés Publics et PPP",
    subtitle: "Appui à la Commande Publique",
    icon: FileText,
    description:
      "Appui à la commande publique, accompagnement en partenariats public-privé (PPP), veille stratégique et constitution des dossiers de soumission.",
    fullDescription:
      "Nous offrons un accompagnement complet aux entreprises et institutions dans la gestion des marchés publics. Notre expertise couvre l'ensemble du cycle de passation, de la veille stratégique à la gestion des contentieux, en passant par la constitution rigoureuse des dossiers.",
    image:
      "https://images.unsplash.com/photo-1763729805496-b5dbf7f00c79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    details: [
      "Veille stratégique sur les appels d’offres et opportunités",
      "Assistance à l'inscription ARMP / DGCMP",
      "Rédaction et structuration de l'offre technique et financière",
      "Vérification de conformité administrative et juridique",
      "Gestion des contentieux de passation et recours",
    ],
    benefits: [
      "Maximisation des chances de succès",
      "Réduction des risques de rejet pour non-conformité",
      "Gain de temps dans les procédures administratives",
    ],
  },
  {
    slug: "projets",
    title: "Maîtrise d'ouvrage et pilotage de projets",
    subtitle: "Gestion et maîtrise d'ouvrage de projets",
    icon: Briefcase,
    description:
      "Pilotage et suivi rigoureux des projets sur les plans technique, administratif et financier, y compris dans le cadre de financements externes.",
    fullDescription:
      "Nous intervenons dans le montage, la structuration et la mise en œuvre des projets, en assurant la maîtrise d'ouvrage ainsi que le suivi technique, administratif et financier, qu'ils soient financés sur ressources internes ou par des bailleurs de fonds internationaux et régionaux (UE, Banque mondiale, BAD et autres partenaires).\n\nNotre approche garantit un accompagnement intégré -technique, juridique et opérationnel -tout au long du cycle de vie du projet, en veillant au respect des délais, des budgets et des standards de qualité exigés par les bailleurs",
    image:
      "https://images.unsplash.com/photo-1678512680110-19a1e548585c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    details: [
      "Montage et structuration stratégique des projets",
      "Dispositif de suivi technique et financier rigoureux",
      "Gestion proactive des délais et des risques",
      "Suivi des obligations contractuelles et reporting",
      "Coordination fluide entre bailleurs, bénéficiaires et parties prenantes",
      "Élaboration de rapports et tableaux de bord de pilotage",
    ],
    benefits: [
      " Gouvernance et conformité des projets",
      " Exécution dans le respect des délais et engagements contractuels",
      "Gestion et maîtrise des risques globaux",
      "Performance et coordination des projets",
    ],
  },
  {
    slug: "financements-subventions",
    title: "Financements & Subventions",
    subtitle: "Montage de Financements",
    icon: Coins,
    description:
      "Identification des fonds, montage des dossiers et accompagnement institutionnel.",
    fullDescription:
      "Nous accompagnons les entreprises, start-ups et porteurs de projets dans la recherche et la sécurisation de financements. Notre expertise inclut l'identification des fonds disponibles, le montage de dossiers bancables et le coaching pour les négociations.",
    image:
      "https://images.unsplash.com/photo-1633158829875-e5316a358c6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    details: [
      "Identification des mécanismes de financement, subventions et exonérations",
      "Montage et structuration de dossiers techniques, juridiques et financiers",
      "Élaboration de plans d'affaires et modèles financiers solides",
      "Coaching stratégique pour la préparation et la présentation de projets aux investisseurs et bailleurs de fonds",
      "Vérification de la crédibilité et de la solvabilité des partenaires",
    ],
    benefits: [
      "Accès élargi aux financements et subventions",
      "Dossiers structurés, conformes et bancables",
      "Sécurisation des financements et des projets",
      "Accompagnement global orienté conformité, performance et résultats",
    ],
  },
  {
    slug: "gouvernance-structuration",
    title: "Démarches Administratives",
    subtitle: "Structuration & Gouvernance",
    icon: Building2,
    description:
      "Conseil stratégique, création d'entités juridiques et conformité des projets.",
    fullDescription:
      "Nous accompagnons les acteurs publics et privés dans la création, la formalisation et la mise en conformité de leurs structures, en lien avec les exigences des projets de développement et des PPP.\n\nNous centralisons et sécurisons l'ensemble de leurs démarches administratives auprès des autorités compétentes : identification des pièces requises, constitution des dossiers, dépôt, relances et suivi jusqu'à prise de décision administrative.\n\nCette approche vise à réduire les délais, éviter les rejets pour dossiers incomplets et garantir la conformité des procédures réglementaires et institutionnelles.",
    image:
      "https://images.unsplash.com/photo-1758691736424-4b4273948341?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    details: [
      "Création et formalisation d'entités (sociétés, SPV, ONG, structures de projet)",
      "Obtention d'agréments, autorisations spéciales, arrêtés ministériels et licences",
      "Mise en conformité institutionnelle et réglementaire",
      "Gestion et suivi des démarches auprès des administrations et autorités compétentes",
    ],
    benefits: [
      "Structure juridique robuste et adaptée",
      "Accélération des procédures",
      "Conformité aux exigences des projets et bailleurs",
      "Confiance accrue des partenaires et investisseurs"
    ],
  },
  {
    slug: "optimisation-fiscale",
    title: "Fiscalité des projets et optimisation des incitations fiscales",
    subtitle: "Fiscalité & incitations fiscales",
    icon: TrendingUp,
    description:
      "Optimisation des incitations fiscales applicables aux projets",
    fullDescription:
      "Nous accompagnons les acteurs publics et privés dans l'accès et la sécurisation des régimes fiscaux incitatifs (exonérations fiscales, allègements douaniers, etc.) liés aux investissements et aux projets de développement en République Démocratique du Congo.\n\nNotre approche garantit la conformité réglementaire tout en optimisant légalement les avantages fiscaux au service de la viabilité et de la performance des projets.",
    image:
      "https://images.unsplash.com/photo-1564939558297-fc396f18e5c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    details: [
      "Accompagnement dans les procédures d'agrément au Code des investissements (ANAPI)",
      "Appui au montage des dossiers pour les Zones Économiques Spéciales (ZES)",
      "Analyse de conformité fiscale des projets et investissements",
      "Assistance dans les relations avec les administrations et régies financières",
      "Sécurisation des avantages fiscaux liés aux projets structurants",
    ],
    benefits: [
      "Optimisation légale des incitations fiscales applicables aux projets",
      "Sécurisation des avantages fiscaux liés aux investissements structurants",
      "Réduction des risques de contrôle et de redressement fiscal",
      "Renforcement de la conformité et de la viabilité des projets",
    ],
  },
  {
    slug: "audit-conformite",
    title: "Audit, conformité et gestion des risques des projets",
    subtitle: "Comptabilité & Audit",
    icon: Calculator,
    description:
      "Comptabilité, audit interne/externe et gestion des risques.",
    fullDescription:
      "La transparence et la conformité sont essentielles à la réussite des projets publics et privés. Nous assurons l'audit, le contrôle et l'évaluation des dispositifs financiers et organisationnels afin de garantir la fiabilité des informations, la maîtrise des risques et le respect des exigences réglementaires et des partenaires techniques et financiers.",
    image:
      "https://images.unsplash.com/photo-1632152053560-2ff69f7981f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    details: [
      "Audit financier et organisationnel des projets et programmes",
      "Analyse et renforcement des dispositifs de contrôle interne",
      "Évaluation de la conformité des projets financés",
      "Préparation et validation des états financiers et rapports de gestion",
      "Appui à la gestion des risques financiers, juridiques et opérationnels",
    ],
    benefits: [
      "Fiabilité et transparence des informations financières et de gestion",
      "Réduction et maîtrise des risques liés aux projets",
      "Renforcement de la conformité aux exigences des bailleurs et partenaires",
      "Amélioration de la gouvernance et de la performance des projets",
    ],
  },
  {
    slug: "contentieux-publics",
    title: "Contentieux Publics",
    subtitle: "Litiges & recours",
    icon: Scale,
    description:
      "Assistance dans la gestion des litiges avec l’administration : recours, suivi des créances publiques et médiation.",
    fullDescription:
      "Nous vous accompagnons dans les relations conflictuelles avec les autorités publiques : analyse des décisions, stratégie de recours, préparation des pièces et suivi procédural lorsque c’est pertinent. Nous pouvons également intervenir sur le recouvrement de créances et sur des dispositifs de médiation ou de concertation avec les institutions.",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    details: [
      "Analyse juridique des décisions et actes administratifs",
      "Accompagnement dans les recours administratifs et voies de droit adaptées",
      "Suivi des créances et impayés vis-à-vis des entités publiques",
      "Appui à la médiation et aux négociations institutionnelles",
    ],
    benefits: [
      "Meilleure lisibilité des options et des délais",
      "Structuration des dossiers pour défendre vos intérêts",
      "Réduction du stress opérationnel lié aux contentieux",
    ],
  },
  {
    slug: "formation-recherche",
    title: "Formation & Recherche",
    subtitle: "Capacités & veille",
    icon: GraduationCap,
    description:
      "Renforcement des capacités via des séminaires et ateliers sur la commande publique, gestion et mobilisation des ressources (financement et subvention) des projets.",
    fullDescription:
      "Nous concevons et animons des formations et ateliers sur mesure : marchés publics et PPP, gestion et financement de projets et thématiques connexes. Les contenus combinent cadre réglementaire, retours d’expérience et outils pratiques pour des équipes opérationnelles et des décideurs.",
    image:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    details: [
      "Formations sur la commande publique, la gestion et le financement de projets",
      "Ateliers pratiques et études de cas",
      "Veille réglementaire et actualisation des bonnes pratiques",
      "Production de supports pédagogiques et guides opérationnels",
    ],
    benefits: [
      "Montée en compétences ciblée de vos équipes",
      "Alignement sur les exigences actuelles et les standards des bailleurs",
      "Matériel réutilisable pour ancrer les acquis dans l’organisation",
    ],
  },
];
