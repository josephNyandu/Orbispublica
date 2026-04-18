import { Link } from "react-router";
import { motion } from "motion/react";
import { Bell, Briefcase, ChevronRight, ImageIcon, MapPin, Megaphone } from "lucide-react";
import { AdminInfoTooltip } from "@/components/admin/AdminInfoTooltip";

const sections = [
  {
    to: "/admin/coordonnees",
    title: "Coordonnées",
    description:
      "Adresse, téléphones, e-mails, horaires et affichage dans la barre du haut (footer, contact, menu).",
    icon: MapPin,
    info: "Centralise les coordonnées affichées dans le pied de page, la page Contact et la barre supérieure du menu public.",
  },
  {
    to: "/admin/realisations",
    title: "Réalisations",
    description:
      "Gérer les cartes et la publication sur « Nos réalisations ».",
    icon: ImageIcon,
    info: "Créez des cartes avec image, texte et catégorie. Seules les entrées marquées « publié » apparaissent sur le site.",
  },
  {
    to: "/admin/expertises",
    title: "Expertises",
    description:
      "Publier ou mettre en brouillon chaque fiche expertise sur le site.",
    icon: Briefcase,
    info: "Contrôlez la visibilité de chaque expertise et adaptez titres, textes et visuels sans toucher au code source.",
  },
  {
    to: "/admin/opportunites",
    title: "Opportunités",
    description:
      "Publications pour les quatre pages du menu : appels d’offres, appels à projets, financements et subventions, projets PPP / investissement — planification et historique.",
    icon: Megaphone,
    info: "Chaque publication est rattachée à la page publique du même intitulé (URL identique au choix du tableau). Planification et journal des actions inclus.",
  },
  {
    to: "/admin/opportunites/abonnements",
    title: "Abonnements appels d’offres",
    description:
      "Liste des personnes inscrites via le Registre pour suivre les publications de la page Appels d’offres.",
    icon: Bell,
    info: "Les visiteurs s’inscrivent sur le site public (page Registre). Vous pouvez consulter les e-mails et retirer une entrée si besoin.",
  },
] as const;

export function AdminDashboard() {
  return (
    <div className="relative space-y-10">
      <div
        className="pointer-events-none absolute -left-4 top-0 hidden h-48 w-px bg-gradient-to-b from-blue-500/50 via-blue-600/25 to-transparent md:block"
        aria-hidden
      />

      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10"
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-[22rem] rounded-full bg-blue-500/[0.07] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 left-1/3 size-72 rounded-full bg-blue-600/[0.06] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(circle_at_1px_1px,rgba(0,75,135,0.07)_1px,transparent_0)] [background-size:24px_24px]"
          aria-hidden
        />

        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">Console</p>
            <AdminInfoTooltip
              text="Espace réservé aux administrateurs : les visiteurs du site public ne voient pas cette page."
              side="right"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="admin-display text-3xl font-semibold leading-tight tracking-tight text-slate-900 md:text-4xl">
              Tableau de bord
            </h1>
            <AdminInfoTooltip
              text="Chaque carte ouvre une section d’édition. Pensez à enregistrer pour appliquer les changements sur le site."
              side="right"
            />
          </div>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600">
            Choisissez une section à gérer. Les changements sont reflétés sur le
            site public après enregistrement.
          </p>
        </div>
      </motion.header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.12 + index * 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              to={item.to}
              className="group relative flex gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 md:p-7"
            >
              <span
                className="absolute left-0 top-5 bottom-5 w-1 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 opacity-40 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden
              />

              <div className="relative ml-3 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-[transform,box-shadow] duration-300 group-hover:scale-[1.03] group-hover:shadow-md">
                <item.icon className="size-5" strokeWidth={1.75} />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-900">{item.title}</h2>
                    <AdminInfoTooltip text={item.info} side="top" className="mt-0.5" />
                  </div>
                  <ChevronRight
                    className="mt-0.5 size-5 shrink-0 text-slate-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-blue-600"
                    aria-hidden
                  />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-blue-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Ouvrir
                  <ChevronRight className="size-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
