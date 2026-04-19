import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { fetchSiteSearch, type SiteSearchHit } from "@/lib/api";
import { PageHeroBanner } from "@/components/PageHeroBanner";

function typeLabel(t: SiteSearchHit["type"]): string {
  switch (t) {
    case "realisation":
      return "Réalisation";
    case "opportunity_post":
      return "Opportunité";
    case "expertise":
      return "Expertise";
    default:
      return t;
  }
}

export function SearchResults() {
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hits, setHits] = useState<SiteSearchHit[]>([]);
  const [resolvedQuery, setResolvedQuery] = useState("");

  useEffect(() => {
    if (!q) {
      setHits([]);
      setResolvedQuery("");
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSiteSearch(q)
      .then((data) => {
        if (!cancelled) {
          setHits(data.results);
          setResolvedQuery(data.query);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setHits([]);
          setError(e instanceof Error ? e.message : "Recherche impossible.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q]);

  return (
    <div className="pt-20 min-h-[50vh]">
      <PageHeroBanner className="py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Recherche</h1>
          {q ? (
            <p className="text-slate-300 text-lg">
              Résultats pour « <span className="text-white font-medium">{q}</span> »
            </p>
          ) : (
            <p className="text-slate-300 text-lg">
              Saisissez un terme dans la barre du bandeau supérieur, puis validez avec Entrée.
            </p>
          )}
        </div>
      </PageHeroBanner>

      <section className="py-10 md:py-14 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 md:px-10 max-w-3xl">
          {!q && (
            <p className="text-slate-600 text-center py-8">
              Aucune requête. Utilisez le champ « Recherche… » en haut du site (grand écran).
            </p>
          )}
          {q && loading && <p className="text-slate-600 text-center py-12">Recherche en cours…</p>}
          {q && error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-center">
              {error}
            </div>
          )}
          {q && !loading && !error && hits.length === 0 && (
            <p className="text-slate-600 text-center py-12">
              Aucun résultat pour « {resolvedQuery || q} ».
            </p>
          )}
          {q && !loading && !error && hits.length > 0 && (
            <ul className="flex flex-col gap-4">
              {hits.map((hit) => (
                <li key={`${hit.type}-${hit.id}`}>
                  <Link
                    to={hit.href}
                    className="block rounded-xl border border-slate-200 bg-slate-50/80 p-5 transition-shadow hover:shadow-md hover:border-blue-200"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                        {typeLabel(hit.type)}
                      </span>
                      {hit.meta ? (
                        <span className="text-xs text-slate-500"> · {hit.meta}</span>
                      ) : null}
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">{hit.title}</h2>
                    {hit.excerpt ? (
                      <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">{hit.excerpt}</p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
