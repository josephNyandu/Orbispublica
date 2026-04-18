import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, ExternalLink, Megaphone } from "lucide-react";
import {
  fetchPublicOpportunityPosts,
  type OpportunityPost,
  type OpportunityPostNavState,
} from "@/lib/api";
import {
  OPPORTUNITY_CATEGORY_LABELS,
  type OpportunityCategoryId,
} from "@/data/opportunityCategories";
import {
  CONSULTATION_STATUS_FILTER_OPTIONS,
  consultationStatusFromDeadline,
  formatDeadlineFr,
  statusAccentBorder,
  statusDotClass,
  statusLabelFor,
  type ConsultationStatusFilterKey,
} from "@/lib/consultationStatus";

const POSTS_PER_PAGE = 5;

type Props = {
  category: OpportunityCategoryId;
  className?: string;
};

function formatDateFr(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function OpportunityPostsSection({ category, className = "" }: Props) {
  const [posts, setPosts] = useState<OpportunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ConsultationStatusFilterKey>("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPublicOpportunityPosts(category);
        if (!cancelled) setPosts(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Chargement impossible");
          setPosts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  useEffect(() => {
    setPage(1);
  }, [category, statusFilter]);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const key = consultationStatusFromDeadline(p.consultation_deadline);
      return statusFilter === "" || statusFilter === key;
    });
  }, [posts, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const pageStart = (safePage - 1) * POSTS_PER_PAGE;
  const atFirstPage = safePage <= 1;
  const atLastPage = safePage >= totalPages;
  const paginatedPosts = useMemo(
    () => filteredPosts.slice(pageStart, pageStart + POSTS_PER_PAGE),
    [filteredPosts, pageStart]
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) {
    return (
      <section className={`py-8 ${className}`} aria-busy="true">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-6 text-center text-sm text-slate-600">
          Chargement des publications…
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-8 ${className}`}>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Les annonces du cabinet n’ont pas pu être chargées ({error}).
        </p>
      </section>
    );
  }

  if (posts.length === 0) {
    const label = OPPORTUNITY_CATEGORY_LABELS[category];
    return (
      <section className={`py-10 md:py-12 bg-slate-50 border-y border-slate-100 ${className}`}>
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2 text-center">
            {label}
          </p>
          <p className="text-center text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Aucune publication pour le moment dans cette rubrique. Les annonces validées dans l&apos;administration
            du site s&apos;affichent ici automatiquement.
          </p>
        </div>
      </section>
    );
  }

  const label = OPPORTUNITY_CATEGORY_LABELS[category];
  const rowRubricLabel =
    category === "opportunites" ? "Publication cabinet" : OPPORTUNITY_CATEGORY_LABELS[category];

  return (
    <section className={`py-10 md:py-12 bg-slate-50 border-y border-slate-100 ${className}`}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">Annonces</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Publications — {label}
            </h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <Megaphone className="size-3.5 text-blue-600 shrink-0" aria-hidden />
            {posts.length} publication{posts.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-8">
          <div>
            <p className="text-sm font-semibold text-slate-800 mb-3">Statut de consultation</p>
            <div className="flex flex-wrap gap-2">
              {CONSULTATION_STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key || "all"}
                  type="button"
                  onClick={() => setStatusFilter(opt.key)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                    statusFilter === opt.key
                      ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <p className="text-center text-sm text-slate-600 py-10">
              Aucune annonce ne correspond à ce statut. Choisissez « Tous » ou un autre filtre.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-inner">
                <table className="min-w-[920px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/80 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <th className="w-10 px-3 py-3" aria-label="Statut" />
                      <th className="px-3 py-3 min-w-[12rem]">Objet</th>
                      <th className="px-3 py-3 w-36">Organisme</th>
                      <th className="px-3 py-3 w-32">Lieu</th>
                      <th className="px-3 py-3 w-40 whitespace-nowrap">Date limite</th>
                      <th className="px-3 py-3 w-40">Résumé</th>
                      <th className="px-3 py-3 w-28 whitespace-nowrap">Publié</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {paginatedPosts.map((row) => {
                    const statusKey = consultationStatusFromDeadline(row.consultation_deadline);
                    return (
                      <Fragment key={row.id}>
                        <tr
                          className={`border-b border-slate-200 border-l-4 ${statusAccentBorder(statusKey)} bg-slate-100/90 text-xs text-slate-600`}
                        >
                          <td colSpan={7} className="px-3 py-2.5">
                            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="shrink-0 font-bold uppercase tracking-widest text-slate-500">
                                {rowRubricLabel}
                              </span>
                              <span className="font-mono text-sm font-bold text-slate-800">Réf. {row.id}</span>
                              <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                                <span
                                  className={`size-2 shrink-0 rounded-full ${statusDotClass(statusKey)}`}
                                  aria-hidden
                                />
                                {statusLabelFor(statusKey)}
                              </span>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-200 hover:bg-slate-50/80 transition-colors">
                          <td className="px-3 py-3 align-middle">
                            <span
                              className={`mx-auto block size-2.5 rounded-full ${statusDotClass(statusKey)}`}
                              title={statusLabelFor(statusKey)}
                            />
                          </td>
                          <td className="px-3 py-3 align-top">
                            <Link
                              to={`/opportunite/${row.id}`}
                              state={{ opportunityPost: row } satisfies OpportunityPostNavState}
                              className="group inline-flex items-start gap-1.5 text-slate-900 font-semibold leading-snug hover:text-blue-700"
                            >
                              <span>{row.title}</span>
                              {row.link_url ? (
                                <ExternalLink
                                  className="size-3.5 shrink-0 text-blue-500 opacity-70 group-hover:opacity-100 mt-0.5"
                                  aria-hidden
                                />
                              ) : null}
                            </Link>
                          </td>
                          <td className="px-3 py-3 align-top text-slate-700">
                            {row.organisme?.trim() ? row.organisme : "—"}
                          </td>
                          <td className="px-3 py-3 align-top text-slate-700">
                            {row.lieu?.trim() ? row.lieu : "—"}
                          </td>
                          <td className="px-3 py-3 align-top text-slate-700 tabular-nums whitespace-nowrap">
                            {row.consultation_deadline ? formatDeadlineFr(row.consultation_deadline) : "—"}
                          </td>
                          <td className="px-3 py-3 align-top text-slate-600">
                            {row.summary ? (
                              <span className="line-clamp-3">{row.summary}</span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-3 py-3 align-top text-slate-600 tabular-nums whitespace-nowrap">
                            {row.published_at ? formatDateFr(row.published_at) : "—"}
                          </td>
                        </tr>
                      </Fragment>
                    );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 ? (
                <nav
                  className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
                  aria-label="Pagination des annonces"
                >
                  <p className="text-sm text-slate-600">
                    Affichage de{" "}
                    <span className="font-semibold tabular-nums text-slate-800">{pageStart + 1}</span> à{" "}
                    <span className="font-semibold tabular-nums text-slate-800">
                      {Math.min(pageStart + POSTS_PER_PAGE, filteredPosts.length)}
                    </span>{" "}
                    sur <span className="font-semibold tabular-nums text-slate-800">{filteredPosts.length}</span>{" "}
                    — page{" "}
                    <span className="font-semibold tabular-nums text-slate-800">
                      {safePage} / {totalPages}
                    </span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {atFirstPage ? (
                      <span className="inline-flex h-9 cursor-default select-none items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 text-sm font-medium text-slate-400">
                        <ChevronLeft className="size-4 shrink-0 opacity-50" aria-hidden />
                        Début de liste
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) => {
                            const cur = Math.min(Math.max(1, p), totalPages);
                            return Math.max(1, cur - 1);
                          })
                        }
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                      >
                        <ChevronLeft className="size-4 shrink-0" aria-hidden />
                        Précédent
                      </button>
                    )}
                    {atLastPage ? (
                      <span className="inline-flex h-9 cursor-default select-none items-center gap-1 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 text-sm font-medium text-slate-400">
                        Fin de liste
                        <ChevronRight className="size-4 shrink-0 opacity-50" aria-hidden />
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) => {
                            const cur = Math.min(Math.max(1, p), totalPages);
                            return Math.min(totalPages, cur + 1);
                          })
                        }
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                      >
                        Suivant
                        <ChevronRight className="size-4 shrink-0" aria-hidden />
                      </button>
                    )}
                  </div>
                </nav>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
