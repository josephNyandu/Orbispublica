import { useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Lock, Mail } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { login } from "@/lib/api";
import { AuthPortalTabs } from "@/components/AuthPortalTabs";
import { PageHeroBanner } from "@/components/PageHeroBanner";
import { getLoginHref, isExternalLoginConfigured } from "@/lib/loginUrl";

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

export function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawRedirect = searchParams.get("redirect");
  const redirectTo =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/admin";

  useLayoutEffect(() => {
    if (!isExternalLoginConfigured()) return;
    const redirectPath =
      rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
        ? rawRedirect
        : undefined;
    window.location.replace(getLoginHref({ redirectPath }));
  }, [rawRedirect]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    defaultValues: { remember: true },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.password, data.remember);
      toast.success("Connexion réussie");
      navigate(redirectTo, { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Connexion impossible");
    }
  };

  if (isExternalLoginConfigured()) {
    return (
      <div className="pt-20 flex min-h-[50vh] items-center justify-center px-6 text-slate-600">
        Redirection vers la page de connexion…
      </div>
    );
  }

  return (
    <div className="pt-20">
      <PageHeroBanner className="py-16">
        <div className="container mx-auto px-6 md:px-10">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Connexion</h1>
          </div>
          <p className="text-lg text-slate-300 max-w-2xl">
            Accédez à l’espace d’administration pour gérer les réalisations publiées sur le site.
          </p>
        </div>
      </PageHeroBanner>

      <div className="container mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 md:p-10">
            <AuthPortalTabs />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="username"
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

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden />
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••"
                    {...register("password", { required: "Le mot de passe est requis" })}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    {...register("remember")}
                  />
                  <span className="text-sm text-slate-600">Se souvenir de moi</span>
                </label>
                <button
                  type="button"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  onClick={() =>
                    toast.info(
                      "Réinitialisation du mot de passe : utilisez les variables d’environnement sur le serveur ou contactez l’administrateur système."
                    )
                  }
                >
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:pointer-events-none text-white font-bold rounded-lg transition-colors"
              >
                {isSubmitting ? "Connexion…" : "Se connecter"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-600">
              Besoin d’un accès ou d’une démonstration ?{" "}
              <Link to="/contact" className="font-medium text-blue-600 hover:text-blue-700">
                Contactez-nous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
