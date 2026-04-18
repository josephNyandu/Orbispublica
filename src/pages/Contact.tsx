import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { useServicePublications } from "@/hooks/useServicePublications";
import { useSiteContact } from "@/hooks/useSiteContact";

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

const faqs = [
  {
    question: "Quels types de projets accompagne ORBIS PUBLICA ?",
    answer: "Nous intervenons principalement sur les marchés publics, projets financés, partenariats public-privé, ainsi que sur le renforcement des capacités institutionnelles et économiques dans divers secteurs."
  },
  {
    question: "Comment garantissez-vous la conformité ?",
    answer: "Nous disposons d’une expertise approfondie du cadre légal national et des standards internationaux. Nous réalisons des audits réguliers et contrôles internes."
  },
  {
    question: "Quels sont les principaux bénéficiaires ?",
    answer: "Maîtres d’ouvrages publics et privés, entreprises locales et internationales, investisseurs, partenaires techniques et financiers, porteurs de projets."
  },
  {
    question: "Proposez-vous des formations ?",
    answer: "Oui, nous organisons régulièrement des formations, séminaires et ateliers pratiques sur les marchés publics, la gouvernance, la fiscalité, etc."
  },
  {
    question: "Comment soumettre un projet ?",
    answer: "Utilisez le formulaire de contact sur cette page en fournissant les informations clés. Un expert vous contactera pour une première évaluation."
  },
  {
    question: "Quelle est votre zone d'intervention ?",
    answer: "Basés à Kinshasa, nous intervenons sur l’ensemble du territoire de la RDC et accompagnons également des projets régionaux."
  }
];

export function Contact() {
  const { contact: siteContact } = useSiteContact();
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
       <div className="bg-slate-800 py-20 text-white">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contactez-nous</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Vous souhaitez soumettre un projet, solliciter un accompagnement ou obtenir des informations ? 
            Nous sommes à votre disposition.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Info & Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Nos Coordonnées</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="block text-slate-900 mb-1">Siège social</strong>
                    <p className="text-slate-600 text-sm">{siteContact.addressLine}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Phone className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="block text-slate-900 mb-1">Téléphone</strong>
                    {siteContact.phones.map((p) => (
                      <p key={p.tel} className="text-slate-600 text-sm">
                        {p.whatsappUrl ? (
                          <a
                            href={p.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            {p.label}
                          </a>
                        ) : (
                          <a href={`tel:${p.tel}`} className="hover:text-blue-600">
                            {p.label}
                          </a>
                        )}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="block text-slate-900 mb-1">Email</strong>
                    {siteContact.emails.map((email) => (
                      <a
                        key={email}
                        href={`mailto:${email}`}
                        className="text-slate-600 text-sm hover:text-blue-600 block"
                      >
                        {email}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-blue-600 mr-4 flex-shrink-0 mt-1" />
                  <div>
                    <strong className="block text-slate-900 mb-1">Heures d'ouverture</strong>
                    <p className="text-slate-600 text-sm">{siteContact.openingHours.weekdays}</p>
                    <p className="text-slate-600 text-sm">{siteContact.openingHours.saturday}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4">Suivez-nous</h4>
                <div className="flex space-x-4">
                   <a href="#" className="text-slate-400 hover:text-blue-600"><Linkedin className="h-5 w-5" /></a>
                   <a href="#" className="text-slate-400 hover:text-blue-600"><Facebook className="h-5 w-5" /></a>
                   <a href="#" className="text-slate-400 hover:text-blue-600"><Twitter className="h-5 w-5" /></a>
                   <a href="#" className="text-slate-400 hover:text-blue-600"><Instagram className="h-5 w-5" /></a>
                   <a href="#" className="text-slate-400 hover:text-blue-600"><Youtube className="h-5 w-5" /></a>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">FAQ</h3>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-blue-600 text-sm">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 text-sm">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-lg border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Formulaire de Demande</h2>
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
    </div>
  );
}
