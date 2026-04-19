import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner@2.0.3';
import { useServicePublications } from "@/hooks/useServicePublications";
import { SEO } from "@/components/SEO";
import { PageHeroBanner } from "@/components/PageHeroBanner";

type FormData = {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  position: string;
  city: string;
  requestType: string;
  domains: string[];
  message: string;
  contactMethod: string;
  language: string;
  consent: boolean;
  newsletter: boolean;
};

export function Contact() {
  const { visibleServices } = useServicePublications();
  const interestDomains = useMemo(
    () => [...visibleServices.map((s) => s.title), "Recrutement"],
    [visibleServices]
  );
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(data);
    toast.success("Votre demande a été envoyée avec succès. Notre équipe vous contactera bientôt.");
    reset();
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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Personal Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">1. Informations Personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nom et Prénom *</label>
                      <input {...register("fullName", { required: true })} className="w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      {errors.fullName && <span className="text-red-500 text-xs">Requis</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Professionnel *</label>
                      <input type="email" {...register("email", { required: true })} className="w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                      {errors.email && <span className="text-red-500 text-xs">Requis</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone *</label>
                      <input {...register("phone", { required: true })} className="w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Organisation / Institution</label>
                      <input {...register("organization")} className="w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Fonction / Poste</label>
                      <input {...register("position")} className="w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Pays / Ville</label>
                      <input {...register("city")} className="w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>

                {/* Request Object */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">2. Objet de votre demande *</h3>
                  <select {...register("requestType", { required: true })} className="w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500">
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
                </div>

                {/* Domains */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">3. Domaines concernés</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {interestDomains.map((domain) => (
                      <label key={domain} className="flex items-center space-x-2 text-sm text-slate-700">
                        <input type="checkbox" value={domain} {...register("domains")} className="rounded text-blue-600 focus:ring-blue-500" />
                        <span>{domain}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2">4. Détails de la demande *</h3>
                  <textarea 
                    {...register("message", { required: true })} 
                    rows={6} 
                    className="w-full px-4 py-2 rounded border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Décrivez votre besoin ici..."
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
                </div>

                {/* Consent */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-md">
                  <label className="flex items-start space-x-2 text-sm text-slate-700">
                    <input type="checkbox" {...register("consent", { required: true })} className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
                    <span>J’autorise ORBIS PUBLICA à utiliser mes données pour traiter cette demande. *</span>
                  </label>
                   <label className="flex items-start space-x-2 text-sm text-slate-700">
                    <input type="checkbox" {...register("newsletter")} className="mt-1 rounded text-blue-600 focus:ring-blue-500" />
                    <span>Je souhaite recevoir les actualités par email.</span>
                  </label>
                </div>

                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-md transition-colors shadow-md">
                  ENVOYER MA DEMANDE
                </button>

              </form>
          </div>
        </div>
      </div>
    </div>
  );
}
