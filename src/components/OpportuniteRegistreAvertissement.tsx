import { Link } from "react-router";
import { Info } from "lucide-react";
import { useOpportunityNavAccess } from "@/hooks/useOpportunityNavAccess";

/** Bandeau sur les rubriques où « Suivant » et l’accès étendé sont liés au registre. */
export function OpportuniteRegistreAvertissement() {
  const { hasAccess, checking } = useOpportunityNavAccess();
  if (checking || hasAccess) return null;

  return (
    <div className="bg-amber-50/90 border-y border-amber-200/80">
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-5 max-w-6xl">
        <div
          className="flex gap-3 rounded-xl border border-amber-200 bg-white/80 px-4 py-3 md:px-5 md:py-4 shadow-sm"
          role="status"
        >
          <Info className="size-5 shrink-0 text-amber-700 mt-0.5" aria-hidden />
          <div className="min-w-0 space-y-2 text-sm text-amber-950 leading-relaxed">
            <p className="font-semibold text-amber-900">Compte registre requis pour aller plus loin</p>
            <p>
              Le bouton «&nbsp;Suivant&nbsp;» vers les autres rubriques d&apos;opportunités est réservé aux
              visiteurs disposant d&apos;un compte sur le registre du site. Créez gratuitement votre compte
              (inscription par e-mail) pour débloquer cette navigation et consulter davantage d&apos;offres.
            </p>
            <p>
              <Link
                to="/registre?from=opportunites-next"
                className="font-semibold text-blue-700 underline-offset-2 hover:text-blue-800 hover:underline"
              >
                Créer un compte sur le registre
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
