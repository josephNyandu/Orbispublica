import { Newspaper, CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

export function Blog() {
  const posts = [
    {
      title: "Les enjeux de la transparence dans les marchés publics en RDC",
      excerpt: "Analyse des nouvelles réformes visant à renforcer la redevabilité et l'efficacité de la dépense publique.",
      date: "15 Nov 2024",
      category: "Analyse"
    },
    {
      title: "Comment réussir son financement auprès des bailleurs internationaux ?",
      excerpt: "Guide pratique pour structurer votre projet et répondre aux exigences de la Banque Mondiale et de la BAD.",
      date: "02 Nov 2024",
      category: "Financement"
    },
    {
      title: "Nouvelles incitations fiscales pour les PME agricoles",
      excerpt: "Décryptage des dispositions récentes du Code des investissements favorisant l'agrobusiness.",
      date: "20 Oct 2024",
      category: "Réglementation"
    }
  ];

  return (
    <div className="pt-20">
      <div className="bg-slate-800 py-20 text-white">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Actualités & Ressources</h1>
          <p className="text-xl text-slate-300 max-w-3xl">
            Analyses, mises à jour réglementaires et retours d’expérience sur la gestion publique et le développement.
          </p>
        </div>
      </div>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
                <div className="h-48 bg-slate-200 animate-pulse-slow relative">
                   <div className="absolute top-4 left-4 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                     {post.category}
                   </div>
                   {/* Placeholder for actual blog images */}
                   <div className="w-full h-full flex items-center justify-center text-slate-400">
                     <Newspaper className="h-12 w-12 opacity-20" />
                   </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center text-xs text-slate-500 mb-3">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    {post.date}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-slate-600 text-sm mb-6 line-clamp-3 flex-grow">
                    {post.excerpt}
                  </p>
                  <a href="#" className="inline-flex items-center text-blue-600 font-bold hover:text-blue-700 text-sm">
                    Lire l'article <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Restez Informé</h3>
            <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
              Inscrivez-vous à notre newsletter pour recevoir nos dernières analyses et invitations aux événements.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Votre adresse email" 
                className="px-4 py-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <button className="px-6 py-3 bg-slate-800 text-white font-bold rounded-md hover:bg-slate-700 transition-colors whitespace-nowrap">
                S'abonner
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
