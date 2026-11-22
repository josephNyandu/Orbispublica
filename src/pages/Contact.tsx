import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { contactDomains } from "@/data/contactDomains";
import { SEO } from "@/components/SEO";
import { PageHeroBanner } from "@/components/PageHeroBanner";

type FormData = {
  domain: string;
  subDomain: string;
  requestType: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  city: string;
  message: string;
  contactMethod: string;
  consent: boolean;
  newsletter: boolean;
};

const steps = [
  { label: 'Domaine', fields: ['domain'] },
  { label: 'Demande', fields: ['requestType'] },
  { label: 'Coordonnées', fields: ['fullName', 'email', 'phone'] },
  { label: 'Message', fields: ['consent'] },
] as const;

const inputClass =
  'w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent';

export function Contact() {
  const [step, setStep] = useState(0);
  const { register, handleSubmit, reset, trigger, watch, setValue, formState: { errors } } = useForm<FormData>();
  const domain = watch('domain');
  const subDomain = watch('subDomain');
  const subDomains = contactDomains.find((d) => d.title === domain)?.subDomains ?? [];

  const next = async () => {
    const ok = await trigger([...steps[step].fields]);
    if (ok) setStep((v) => Math.min(v + 1, steps.length - 1));
  };

  const onSubmit = (data: FormData) => {
    console.log(data);
    toast.success("Votre demande a été envoyée avec succès. Notre équipe vous contactera bientôt.");
    reset();
    setStep(0);
  };

  return (
    <div className="pt-20">
      <SEO 
        title="Contact" 
        description="Contactez ORBIS PUBLICA pour tout accompagnement, demande de devis ou de partenariat." 
      />
      <PageHeroBanner>
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Contactez-nous</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Vous souhaitez soumettre un projet, solliciter un accompagnement ou obtenir des informations ? 
            Nous sommes à votre disposition.
          </p>
        </div>
      </PageHeroBanner>

      <div className="container mx-auto px-6 md:px-10 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Prendre Rendez-vous</h2>
              <p className="text-slate-500 mb-8">Veuillez remplir tous les champs obligatoires marqués d'un astérisque (*).</p>

              <div className="mb-8" aria-label={`Étape ${step + 1} sur ${steps.length}`}>
                <div className="mb-2 flex justify-between text-sm font-medium">
                  {steps.map((st, i) => (
                    <span key={st.label} className={i <= step ? 'text-blue-600' : 'text-slate-400'}>
                      {st.label}
                    </span>
                  ))}
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${((step + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    {step === 0 && (
                      <>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Domaines concernés</h3>
                          <p className="text-sm text-slate-500">Sélectionnez le domaine correspondant à votre demande.</p>
                        </div>
                        <input type="hidden" {...register('domain', { required: true })} />
                        <div className="grid gap-3 sm:grid-cols-2">
                          {contactDomains.map((d) => {
                            const active = domain === d.title;
                            return (
                              <button
                                key={d.title}
                                type="button"
                                onClick={() => {
                                  setValue('domain', d.title, { shouldValidate: true });
                                  setValue('subDomain', '');
                                }}
                                aria-pressed={active}
                                className={`flex items-center justify-between rounded-lg border p-4 text-left font-semibold transition-colors ${
                                  active
                                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 text-slate-800 hover:border-blue-300'
                                }`}
                              >
                                {d.title}
                                {active && <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />}
                              </button>
                            );
                          })}
                        </div>
                        {errors.domain && <span className="text-xs text-red-500">Veuillez choisir un domaine</span>}

                        {subDomains.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                            <h4 className="font-semibold text-slate-800">Votre besoin en {domain}</h4>
                            <input type="hidden" {...register('subDomain')} />
                            <div className="space-y-2">
                              {subDomains.map((sd) => (
                                <label
                                  key={sd}
                                  className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors ${
                                    subDomain === sd ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="subDomainChoice"
                                    checked={subDomain === sd}
                                    onChange={() => setValue('subDomain', sd)}
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  {sd}
                                </label>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}

                    {step === 1 && (
                      <>
                        <h3 className="text-lg font-semibold text-slate-800">Objet de votre demande *</h3>
                        <select {...register("requestType", { required: true })} className={inputClass}>
                          <option value="">Sélectionnez une option...</option>
                          <option value="info">Demande d’information générale</option>
                          <option value="devis">Demande d’offre de services / devis</option>
                          <option value="analyse">Soumission de dossier à analyser</option>
                          <option value="rdv">Planification d’un rendez-vous</option>
                          <option value="callback">Être rappelé(e) par un conseiller</option>
                          <option value="partenariat">Opportunité de collaboration / partenariat</option>
                          <option value="recrutement">Recrutement / Carrière</option>
                          <option value="autre">Autre</option>
                        </select>
                        {errors.requestType && <span className="text-xs text-red-500">Requis</span>}
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <h3 className="text-lg font-semibold text-slate-800">Informations personnelles</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Nom et Prénom *</label>
                            <input {...register("fullName", { required: true })} className={inputClass} />
                            {errors.fullName && <span className="text-xs text-red-500">Requis</span>}
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Adresse mail *</label>
                            <input type="email" {...register("email", { required: true })} className={inputClass} />
                            {errors.email && <span className="text-xs text-red-500">Requis</span>}
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Téléphone *</label>
                            <input {...register("phone", { required: true })} className={inputClass} />
                            {errors.phone && <span className="text-xs text-red-500">Requis</span>}
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Organisation / Institution</label>
                            <input {...register("organization")} className={inputClass} />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Fonction / Poste</label>
                            <input {...register("position")} className={inputClass} />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Pays / Ville</label>
                            <input {...register("city")} className={inputClass} />
                          </div>
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <h3 className="text-lg font-semibold text-slate-800">Informations complémentaires</h3>
                        <textarea
                          {...register("message")}
                          rows={6}
                          className={inputClass}
                          placeholder="Précisez votre besoin ou toute information utile (facultatif)…"
                        ></textarea>

                        <div className="flex flex-col space-y-2">
                          <label className="block text-sm font-medium text-slate-700">Préférence de contact</label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2 text-sm">
                              <input type="radio" value="phone" {...register("contactMethod")} className="text-blue-600 focus:ring-blue-500" />
                              <span>Téléphone</span>
                            </label>
                            <label className="flex items-center space-x-2 text-sm">
                              <input type="radio" value="email" {...register("contactMethod")} className="text-blue-600 focus:ring-blue-500" />
                              <span>Email</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-4 rounded-md bg-slate-50 p-4">
                          <label className="flex items-start space-x-2 text-sm text-slate-700">
                            <input type="checkbox" {...register("consent", { required: true })} className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
                            <span>J’autorise ORBIS PUBLICA à utiliser mes données pour traiter cette demande. *</span>
                          </label>
                          {errors.consent && <span className="text-xs text-red-500">Requis</span>}
                          <label className="flex items-start space-x-2 text-sm text-slate-700">
                            <input type="checkbox" {...register("newsletter")} className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
                            <span>Je souhaite recevoir les actualités par email.</span>
                          </label>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-between gap-4">
                  {step > 0 ? (
                    <button
                      type="button"
                      onClick={() => setStep((v) => v - 1)}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      Retour
                    </button>
                  ) : (
                    <span />
                  )}
                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={next}
                      className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                      Continuer
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-md bg-blue-600 px-6 py-3 font-bold text-white shadow-md transition-colors hover:bg-blue-700"
                    >
                      ENVOYER MA DEMANDE
                    </button>
                  )}
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
}
