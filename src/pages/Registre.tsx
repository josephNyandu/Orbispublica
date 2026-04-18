import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router";
import { Bell, Mail, User } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { subscribeOpportunityFeed } from "@/lib/api";
import { setOpportunityNavUnlocked } from "@/lib/opportunityNavUnlock";
import { AuthPortalTabs } from "@/components/AuthPortalTabs";

type RegistreForm = {
  email: string;
  name: string;
};

export function Registre() {
  const [searchParams] = useSearchParams();
  const fromOpportunites = searchParams.get("from") === "opportunites";
  const fromOpportunitesNext = searchParams.get("from") === "opportunites-next";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegistreForm>({
    defaultValues: { name: "", email: "" },
  });

  const onSubmit = async (data: RegistreForm) => {
    try {
      const res = await subscribeOpportunityFeed({
        email: data.email,
        name: data.name.trim() || undefined,
      });
      if (res.already) {
        toast.success("Cette adresse est déjà enregistrée pour les alertes appels d’offres.");
      } else {
        toast.success("Inscription enregistrée. Vous serez informé des nouvelles publications.");
      }
      setOpportunityNavUnlocked();
      reset({ name: "", email: "" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Inscription impossible");
    }
  };

  return (
    <div className="pt-20">
      <div className="bg-slate-800 py-16 text-white">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Registre</h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            Inscrivez-vous pour suivre les publications d&apos;appels d&apos;offres du cabinet (veille par
            e-mail). L&apos;onglet Connexion sert uniquement à l&apos;administration du site.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10">
            <AuthPortalTabs />

            {fromOpportunites ? (
              <p className="mb-6 rounded-lg border border-blue-100 bg-blue-50/90 px-4 py-3 text-sm text-slate-700">
                Vous arrivez depuis les <strong>appels d&apos;offres</strong> : complétez le formulaire
                ci-dessous pour recevoir les prochaines mises en ligne.
              </p>
            ) : null}
            {fromOpportunitesNext ? (
              <p className="mb-6 rounded-lg border border-amber-100 bg-amber-50/90 px-4 py-3 text-sm text-slate-700">
                Vous souhaitez consulter d&apos;autres rubriques d&apos;opportunités : une fois le formulaire
                complété, le bouton «&nbsp;Suivant&nbsp;» sur les pages concernées vous permettra de poursuivre
                la navigation.
              </p>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-2">
                  Nom ou organisation <span className="font-normal text-slate-500">(facultatif)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden />
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="organization"
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex. Société ABC"
                    {...register("name")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="vous@exemple.org"
                    {...register("email", {
                      required: "L’adresse e-mail est requise",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Adresse e-mail invalide",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:pointer-events-none text-white font-bold rounded-lg transition-colors"
              >
                <Bell className="size-4 shrink-0" aria-hidden />
                {isSubmitting ? "Envoi…" : "S’inscrire aux publications"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Une question sur les marchés publics ?{" "}
              <Link to="/contact" className="font-medium text-blue-600 hover:text-blue-700">
                Contactez le cabinet
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
