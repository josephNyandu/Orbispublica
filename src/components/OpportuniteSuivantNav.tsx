import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useOpportunityNavAccess } from "@/hooks/useOpportunityNavAccess";
import {
  getNextOpportunityNavigation,
  getPreviousOpportunityNavigation,
  isOpportunityRubriquePublicPath,
  type OpportunityCategoryId,
} from "@/data/opportunityCategories";

type Props = {
  category: OpportunityCategoryId;
};

export function OpportuniteSuivantNav({ category }: Props) {
  const prev = getPreviousOpportunityNavigation(category);
  const next = getNextOpportunityNavigation(category);
  const { hasAccess } = useOpportunityNavAccess();
  const nextNeedsRegistration =
    !hasAccess && isOpportunityRubriquePublicPath(next.to);
  const suivantRegistreHref = `/registre?redirect=${encodeURIComponent(next.to)}&from=opportunites-next`;

  const suivantButtonClass =
    "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";

  return (
    <nav
      className="border-t border-slate-200 bg-white"
      aria-label="Navigation entre rubriques Opportunités"
    >
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={prev.to}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
            aria-label={`Retour : ${prev.destinationLabel}`}
          >
            <ChevronLeft className="size-4 shrink-0" aria-hidden />
            Retour
          </Link>
          {nextNeedsRegistration ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className={suivantButtonClass}
                  aria-label={`Avertissement avant accès à : ${next.destinationLabel}`}
                >
                  Suivant
                  <ChevronRight className="size-4 shrink-0" aria-hidden />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Créer un compte pour poursuivre</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-600">
                    La rubrique «&nbsp;{next.destinationLabel}&nbsp;» et les offres associées sont accessibles
                    après inscription gratuite au registre du site. Créez votre compte pour débloquer le bouton
                    «&nbsp;Suivant&nbsp;» et consulter davantage d&apos;annonces.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel type="button">Fermer</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Link
                      to={suivantRegistreHref}
                      className={cn(buttonVariants(), "no-underline")}
                    >
                      Créer un compte
                    </Link>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Link
              to={next.to}
              className={suivantButtonClass}
              aria-label={`Suivant : ${next.destinationLabel}`}
            >
              Suivant
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
