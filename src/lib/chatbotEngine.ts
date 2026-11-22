import { servicesData } from '@/data/services';
import type { SiteContact } from '@/data/contact';

export type ChatLink = { label: string; to: string };
export type ChatAnswer = { text: string; links?: ChatLink[] };

type Intent = {
  id: string;
  /** Fragments recherchés dans la question normalisée ; un fragment long pèse plus lourd. */
  keywords: string[];
  answer: (c: SiteContact) => ChatAnswer;
};

export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, ' ')
    .replace(/[^a-z0-9+ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const service = (slug: string) => servicesData.find((s) => s.slug === slug)!;

function serviceAnswer(slug: string): ChatAnswer {
  const s = service(slug);
  return {
    text: `${s.title} : ${s.description} Par exemple : ${s.details
      .slice(0, 2)
      .map((d) => d.split(':')[0].replace(/\.$/, '').replace(/^./, (c) => c.toLowerCase()))
      .join(' ; ')}.`,
    links: [{ label: `Voir ${s.title}`, to: `/services/${s.slug}` }],
  };
}

const contactLink: ChatLink = { label: 'Nous écrire', to: '/contact' };

const intents: Intent[] = [
  {
    id: 'salutation',
    keywords: ['bonjour', 'bonsoir', 'salut', 'hello', 'coucou'],
    answer: () => ({
      text: 'Bonjour. Je peux vous renseigner sur nos services, nos coordonnées, nos horaires ou les opportunités publiées.',
    }),
  },
  {
    id: 'merci',
    keywords: ['merci', 'thanks'],
    answer: () => ({ text: 'Avec plaisir. Une autre question ?' }),
  },
  {
    id: 'services',
    keywords: ['service', 'prestation', 'propose', 'offre', 'expertise', 'domaine', 'que faites', 'accompagn', 'aider', 'aide'],
    answer: () => ({
      text: `ORBIS PUBLICA intervient dans quatre domaines : ${servicesData
        .map((s) => s.title)
        .join(', ')}.`,
      links: [{ label: 'Tous nos services', to: '/services' }],
    }),
  },
  {
    id: 'conformite',
    keywords: ['conformite', 'audit', 'risque', 'gouvernance', 'ethique', 'integrite', 'compliance', 'controle interne', 'juridique', 'creation entreprise', 'creer entreprise', 'agrement'],
    answer: () => serviceAnswer('conformite'),
  },
  {
    id: 'commande',
    keywords: ['marche public', 'marches publics', 'commande publique', 'ppp', 'partenariat public', 'soumission', 'passation', 'appel d offre', 'appels d offres', 'dossier de soumission', 'recours'],
    answer: () => serviceAnswer('commande-publique'),
  },
  {
    id: 'projets',
    keywords: ['ingenierie', 'montage', 'structuration', 'pilotage', 'projet', 'business plan', 'plan d affaires', 'mobilisation'],
    answer: () => serviceAnswer('ingenierie-projets'),
  },
  {
    id: 'formation',
    keywords: ['formation', 'former', 'sensibilisation', 'recherche', 'seminaire', 'atelier', 'renforcement', 'capacites', 'equipes'],
    answer: () => serviceAnswer('formation-sensibilisation-recherche'),
  },
  {
    id: 'financement',
    keywords: ['financement', 'subvention', 'bailleur', 'fonds', 'bad', 'banque mondiale', 'appel a projet', 'appels a projets', 'opportunite'],
    answer: () => ({
      text: 'Nous publions les appels d’offres, les appels à projets et les financements et subventions. Nous aidons aussi à structurer un projet et à mobiliser les ressources nécessaires à sa réalisation.',
      links: [
        { label: 'Appels d’offres', to: '/opportunites' },
        { label: 'Appels à projets', to: '/appels-a-projets' },
        { label: 'Financements et subventions', to: '/financements-subventions' },
      ],
    }),
  },
  {
    id: 'alertes',
    keywords: ['registre', 'alerte', 'abonner', 'abonnement', 'newsletter', 'etre informe', 'notification'],
    answer: () => ({
      text: 'Vous pouvez vous inscrire au Registre pour suivre les publications d’appels d’offres.',
      links: [{ label: 'Accéder au Registre', to: '/registre' }],
    }),
  },
  {
    id: 'contact',
    keywords: ['contact', 'telephone', 'tel ', 'appeler', 'appel', 'numero', 'whatsapp', 'email', 'mail', 'ecrire', 'joindre', 'joignable'],
    answer: (c) => ({
      text: `Téléphone : ${c.phones.map((p) => p.label).join(' ; ')}. E-mail : ${c.emails.join(' ; ')}.`,
      links: [contactLink],
    }),
  },
  {
    id: 'adresse',
    keywords: ['adresse', 'ou etes', 'ou se trouve', 'localisation', 'situe', 'bureau', 'kinshasa', 'venir', 'plan d acces'],
    answer: (c) => ({ text: `Nos bureaux : ${c.addressLine}.` }),
  },
  {
    id: 'horaires',
    keywords: ['horaire', 'heure', 'ouvert', 'ouverture', 'ferme', 'samedi', 'lundi', 'quand'],
    answer: (c) => ({
      text: `${c.openingHours.weekdays}${c.openingHours.saturdayOpen ? ` — ${c.openingHours.saturday}` : ''}.`,
    }),
  },
  {
    id: 'rdv',
    keywords: ['rendez vous', 'rdv', 'rencontrer', 'reunion', 'visio', 'consultation', 'devis', 'tarif', 'prix', 'cout', 'honoraire', 'collaborer', 'collaboration'],
    answer: () => ({
      text: 'Décrivez-nous votre besoin via le formulaire de contact. Nous reviendrons vers vous pour un rendez-vous, en présentiel ou en visio, et une proposition adaptée.',
      links: [{ label: 'Prendre rendez-vous', to: '/contact' }],
    }),
  },
  {
    id: 'cabinet',
    keywords: ['qui etes', 'qui sommes', 'cabinet', 'orbis', 'presentation', 'a propos', 'histoire', 'vision', 'mission', 'equipe', 'partenaire'],
    answer: () => ({
      text: 'ORBIS PUBLICA est un cabinet de conseil et d’expertise qui accompagne les acteurs publics et privés en République Démocratique du Congo dans leurs enjeux de conformité, leur commande publique et le développement de leurs projets.',
      links: [
        { label: 'Qui sommes-nous', to: '/notre-cabinet/qui-sommes-nous' },
        { label: 'Vision et mission', to: '/notre-cabinet/vision-mission' },
      ],
    }),
  },
  {
    id: 'client',
    keywords: ['espace client', 'connexion', 'connecter', 'compte', 'mot de passe', 'suivre mon dossier', 'suivi', 'mon dossier', 'avancement', 'document'],
    answer: () => ({
      text: 'Si vous êtes client, connectez-vous pour suivre l’avancement de vos dossiers, télécharger vos documents et écrire à votre conseiller. Votre compte vous est remis par ORBIS PUBLICA.',
      links: [{ label: 'Se connecter', to: '/login' }],
    }),
  },
  {
    id: 'publications',
    keywords: ['publication', 'actualite', 'analyse', 'evenement', 'conference', 'potentialite', 'article', 'blog'],
    answer: () => ({
      text: 'Nos publications regroupent des actualités et analyses, les événements et les potentialités économiques de la RDC.',
      links: [
        { label: 'Actualités et analyses', to: '/publications/actualites' },
        { label: 'Événements', to: '/publications/evenements' },
      ],
    }),
  },
];

export const fallbackAnswer = (c: SiteContact): ChatAnswer => ({
  text: `Je n’ai pas de réponse précise à cette question. Notre équipe vous répondra directement : ${c.phones[0]?.label ?? ''} ou ${c.emails[0] ?? ''}.`,
  links: [contactLink],
});

export function answerQuestion(question: string, contact: SiteContact): ChatAnswer {
  const q = ` ${normalize(question)} `;
  let best: { score: number; intent: Intent } | null = null;
  for (const intent of intents) {
    let score = 0;
    for (const k of intent.keywords) {
      if (q.includes(k.endsWith(' ') ? ` ${k}` : k)) score += k.length >= 8 ? 3 : 2;
    }
    if (score > 0 && (!best || score > best.score)) best = { score, intent };
  }
  return best ? best.intent.answer(contact) : fallbackAnswer(contact);
}

export const suggestedQuestions = [
  'Quels sont vos services ?',
  'Comment participer aux marchés publics ?',
  'Où trouver des financements ?',
  'Quels sont vos horaires ?',
  'Comment vous contacter ?',
];
