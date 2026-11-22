import imgMarches from '@/assets/images/service-marches-publics.jpg';
import imgProjets from '@/assets/images/service-projets.jpg';
import imgAudit from '@/assets/images/service-audit.jpg';
import imgFormation from '@/assets/images/service-formation.jpg';

import type { LucideIcon } from "lucide-react";
import { FileText, Briefcase, Scale, GraduationCap } from "lucide-react";

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
  /** Arguments « Pourquoi Orbis Publica ? » affichés dans la colonne latérale de la fiche */
  whyUs?: string[];
};

export const servicesData: ServiceDetailEntry[] = [
  {
    slug: "conformite",
    title: "Conformité",
    subtitle: "Conformité & gestion des risques",
    icon: Scale,
    description:
      "Accompagnement stratégique en matière de conformité juridique, réglementaire et administrative, de gouvernance, d’éthique des affaires et de maîtrise des risques, au service de la sécurisation des activités et des opérations.",
    fullDescription:
      "Orbis Publica accompagne les acteurs publics et privés dans l’évaluation du respect de leurs obligations, l’identification des risques de non-conformité et la mise en place de dispositifs adaptés de prévention et de contrôle. Notre approche associe audit juridique, analyse des pratiques, conseil en gouvernance et renforcement des mécanismes internes de conformité.",
    image: imgAudit,
    details: [
      "Audit juridique et diagnostic de conformité",
      "Conseil en gouvernance, éthique et intégrité",
      "Cartographie, prévention et maîtrise des risques",
      "Conception et renforcement des dispositifs de conformité et de contrôle interne",
      "Création et structuration juridique des entités",
      "Démarches administratives et réglementaires",
    ],
    benefits: [
      "Meilleure maîtrise des exigences juridiques et réglementaires",
      "Prévention des risques juridiques, opérationnels et réputationnels",
      "Renforcement de la transparence et de l'intégrité",
      "Sécurisation des décisions, activités et opérations",
    ],
    whyUs: [
      "Expertise juridique et approche intégrée de la compliance",
      "Maîtrise de l'environnement réglementaire congolais",
      "Approche stratégique adaptée aux enjeux et aux standards internationaux",
    ],
  },
  {
    slug: "commande-publique",
    title: "Commande publique",
    subtitle: "Marchés publics & PPP",
    icon: FileText,
    description:
      "Appui aux acteurs publics et privés dans les procédures de marchés publics et de partenariats public-privé (PPP), de la veille sur les opportunités à la préparation des offres et au suivi de l'exécution contractuelle.",
    fullDescription:
      "Nous accompagnons les entreprises et les institutions dans leurs démarches liées à la commande publique, couvrant les marchés publics et les partenariats public-privé. Notre intervention porte notamment sur l'identification des opportunités, la préparation des dossiers de candidature et des offres, la conformité des soumissions, le suivi des procédures ainsi que l'assistance juridique en cas de différends.",
    image: imgMarches,
    details: [
      "Veille et identification des opportunités de marchés publics et de PPP",
      "Préparation et vérification des dossiers de soumission",
      "Assistance juridique et technique en matière de passation et de recours",
      "Conseil et accompagnement dans l’exécution des marchés et des contrats de partenariat",
    ],
    benefits: [
      "Optimisation des chances de succès des soumissions",
      "Réduction des risques de rejet pour non-conformité",
      "Gain de temps dans les démarches administratives",
    ],
    whyUs: [
      "Expertise multisectorielle",
      "Maîtrise du contexte et des pratiques en RDC",
      "Approche alignée sur les standards internationaux",
    ],
  },
  {
    slug: "ingenierie-projets",
    title: "Ingénierie de projets",
    subtitle: "Montage, pilotage & mobilisation des ressources",
    icon: Briefcase,
    description:
      "Accompagnement dans la conception, le montage, la structuration et le pilotage des projets, ainsi que dans la mobilisation des ressources nécessaires à leur réalisation.",
    fullDescription:
      "Orbis Publica accompagne les acteurs publics et privés dans la préparation et la conduite de leurs projets, de leur formulation à leur mise en œuvre. Notre intervention couvre les études préalables, le montage et la structuration technique et juridique, l'appui à la maîtrise d'ouvrage, l'accompagnement à la mobilisation des ressources, ainsi que la coordination opérationnelle et le suivi de l'exécution des projets.\n\nNotre approche associe expertises juridique, technique et opérationnelle afin de renforcer la cohérence et la faisabilité des projets, tout en favorisant leur mise en œuvre conformément aux objectifs, aux calendriers et aux engagements définis.",
    image: imgProjets,
    details: [
      "Études préalables, montage et structuration des projets",
      "Appui technique à la maîtrise d'ouvrage et à la planification",
      "Accompagnement à la mobilisation des ressources",
      "Coordination et suivi de la mise en œuvre des projets",
      "Suivi des engagements contractuels et budgétaires, rapports de suivi et outils de pilotage",
    ],
    benefits: [
      "Meilleure structuration et préparation des projets",
      "Accès facilité aux opportunités de financement et de partenariat",
      "Suivi rigoureux des activités et des engagements",
      "Amélioration de la coordination et du pilotage des projets",
    ],
    whyUs: [
      "Expertise juridique, institutionnelle et opérationnelle",
      "Maîtrise du contexte et des réalités de mise en œuvre en RDC",
      "Approche alignée sur les exigences des partenaires et les standards internationaux",
    ],
  },
  {
    slug: "formation-sensibilisation-recherche",
    title: "Formation, Sensibilisation & Recherche",
    subtitle: "Compétences, sensibilisation & connaissances",
    icon: GraduationCap,
    description:
      "Développement des compétences, sensibilisation des acteurs et production de connaissances dans les domaines de la conformité, de la commande publique et de l’ingénierie de projets.",
    fullDescription:
      "Orbis Publica contribue au renforcement des capacités des acteurs publics et privés à travers des formations spécialisées, des séminaires, des ateliers et des actions de sensibilisation. Le cabinet mène également des activités de recherche appliquée, réalise des études thématiques et assure une veille sur les évolutions juridiques, réglementaires et les pratiques professionnelles, afin d’éclairer les décisions et d'améliorer les pratiques dans ses trois domaines d’expertise.",
    image: imgFormation,
    details: [
      "Formation et renforcement des capacités : formations destinées aux professionnels, agents publics, responsables d’organisations, entreprises et autres acteurs intervenant dans les domaines de la conformité, de la commande publique et de l’ingénierie de projets.",
      "Sensibilisation et information : conférences, ateliers et actions d’information sur les enjeux de conformité, d’éthique, d’intégrité et de bonne gouvernance.",
      "Recherche et études appliquées : études, analyses juridiques et institutionnelles et travaux thématiques dans les domaines d’expertise du cabinet.",
      "Veille et documentation : suivi des évolutions juridiques et réglementaires, analyse des pratiques et élaboration de guides, notes techniques et outils professionnels.",
    ],
    benefits: [
      "Acquisition et actualisation des connaissances et compétences",
      "Meilleure maîtrise des exigences juridiques, réglementaires et opérationnelles",
      "Développement d'une culture de conformité, de transparence et d'intégrité",
      "Accès à des analyses et à des ressources documentaires utiles à la prise de décision et à l'action",
    ],
  },
];

/** Anciennes adresses de fiches → nouvelle fiche la plus proche */
export const legacyServiceSlugs: Record<string, string> = {
  "marches-publics": "commande-publique",
  "contentieux-publics": "commande-publique",
  projets: "ingenierie-projets",
  "financements-subventions": "ingenierie-projets",
  "gouvernance-structuration": "conformite",
  "demarches-administratives": "conformite",
  "optimisation-fiscale": "conformite",
  "audit-conformite": "conformite",
  "formation-recherche": "formation-sensibilisation-recherche",
};
