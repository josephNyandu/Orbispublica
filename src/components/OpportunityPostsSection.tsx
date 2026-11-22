import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
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
  statusTextClass,
  type ConsultationStatusFilterKey,
  type ConsultationStatusKey,
} from "@/lib/consultationStatus";

const POSTS_PER_PAGE = 3;

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

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

type SortKey = "recent" | "deadline";

export function OpportunityPostsSection({ category, className = "" }: Props) {
  const [posts, setPosts] = useState<OpportunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ConsultationStatusFilterKey>("");
  const [sort, setSort] = useState<SortKey>("recent");
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
  }, [category, statusFilter, sort]);

  const filteredPosts = useMemo(() => {
    const list = posts.filter((p) => {
      const key = consultationStatusFromDeadline(p.consultation_deadline);
      return statusFilter === "" || statusFilter === key;
    });
    const publishedTime = (p: OpportunityPost) => new Date(p.published_at ?? p.created_at ?? 0).getTime() || 0;
    if (sort === "deadline") {
      return [...list].sort((a, b) => {
        const da = a.consultation_deadline || "9999-12-31";
        const db = b.consultation_deadline || "9999-12-31";
        return da.localeCompare(db) || publishedTime(b) - publishedTime(a);
      });
    }
    return [...list].sort((a, b) => publishedTime(b) - publishedTime(a));
  }, [posts, statusFilter, sort]);

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
          <h2 className="anapi-title text-center mb-4 text-2xl">{label}</h2>
          <p className="text-center text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Aucune publication pour le moment dans cette rubrique. Les annonces validées dans l&apos;administration
            du site s&apos;affichent ici automatiquement.
          </p>
        </div>
      </section>
    );
  }

  const label = OPPORTUNITY_CATEGORY_LABELS[category];
  const filterOptions = CONSULTATION_STATUS_FILTER_OPTIONS.filter((opt) => opt.key !== "non_precise");
  const countFor = (key: ConsultationStatusFilterKey) =>
    key === ""
      ? posts.length
      : posts.filter((p) => consultationStatusFromDeadline(p.consultation_deadline) === key).length;
  const gridCols = "md:grid-cols-[minmax(0,1fr)_13rem_9rem_12rem_9rem]";

  return (
    <section className={`py-10 md:py-12 bg-slate-50 border-y border-slate-100 ${className}`}>
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="anapi-title text-2xl md:text-3xl">Publications — {label}</h2>
          <p className="text-slate-600">{posts.length} publication{posts.length > 1 ? "s" : ""}</p>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-slate-300">
          <div className="flex flex-wrap gap-x-7">
            {filterOptions.map((opt) => {
              const active = statusFilter === opt.key;
              return (
                <button
                  key={opt.key || "all"}
                  type="button"
                  onClick={() => setStatusFilter(opt.key)}
                  aria-pressed={active}
                  className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-base transition-colors ${
                    active
                      ? "border-blue-900 font-semibold text-blue-900"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {opt.key ? <span className={`size-3 rounded-full ${statusDotClass(opt.key)}`} aria-hidden /> : null}
                  {opt.label}
                  <span className="tabular-nums text-slate-400">{countFor(opt.key)}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-4 pb-3 text-sm text-slate-500">
            <span>Trier</span>
            {(
              [
                ["recent", "Plus récentes"],
                ["deadline", "Date limite"],
              ] as const
            ).map(([key, text]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={`transition-colors ${
                  sort === key ? "font-semibold text-slate-900 underline underline-offset-4" : "hover:text-slate-900"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-600">
            Aucune annonce ne correspond à ce statut. Choisissez « Tous » ou un autre filtre.
          </p>
        ) : (
          <div>
            <div className={`hidden gap-x-6 py-3 pl-6 pr-5 text-sm font-semibold text-slate-500 md:grid ${gridCols}`}>
              <div>Objet</div>
              <div>Organisme</div>
              <div>Lieu</div>
              <div>Date limite</div>
              <div>Publié</div>
            </div>

            <ul className="space-y-3 pt-3 md:pt-0">
              {paginatedPosts.map((row) => {
                const statusKey = consultationStatusFromDeadline(row.consultation_deadline);
                const meta = [row.organisme?.trim(), row.lieu?.trim()].filter(Boolean).join(" — ");
                return (
                  <li
                    key={row.id}
                    className={`grid gap-x-6 gap-y-3 border-l-4 bg-white px-5 py-5 ${statusAccentBorder(statusKey)} ${gridCols}`}
                  >
                    <div className="min-w-0">
                      <Link
                        to={`/opportunite/${row.id}`}
                        state={{ opportunityPost: row } satisfies OpportunityPostNavState}
                        className="text-lg font-semibold leading-snug text-slate-900 hover:text-blue-700 hover:underline"
                      >
                        {row.title}
                        {row.link_url ? <ExternalLink className="ml-1.5 inline size-4 text-blue-600" aria-hidden /> : null}
                      </Link>
                      {meta ? <p className="mt-1.5 text-sm text-slate-500 md:hidden">{meta}</p> : null}
                    </div>
                    <p className="hidden text-slate-700 md:block">{row.organisme?.trim() ? row.organisme : "—"}</p>
                    <p className="hidden text-slate-700 md:block">{row.lieu?.trim() ? row.lieu : "—"}</p>
                    <div>
                      <p className={`inline-flex items-center gap-2.5 text-base font-semibold ${statusTextClass(statusKey)}`}>
                        <span className={`size-4 rounded-full ${statusDotClass(statusKey)}`} aria-hidden />
                        {statusLabelFor(statusKey)}
                      </p>
                      {row.consultation_deadline ? (
                        <p className="mt-1 text-sm tabular-nums text-slate-700">
                          jusqu’au {formatDeadlineFr(row.consultation_deadline)}
                        </p>
                      ) : null}
                    </div>
                    <p className="tabular-nums text-slate-700">
                      {row.published_at ? formatDateShort(row.published_at) : "—"}
                    </p>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 ? (
              <nav className="flex justify-end gap-2 pt-5" aria-label="Pagination des annonces">
                <button
                  type="button"
                  disabled={atFirstPage}
                  onClick={() => setPage(Math.max(1, safePage - 1))}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-default disabled:border-dashed disabled:text-slate-400 disabled:hover:bg-white"
                >
                  <ChevronLeft className="size-4 shrink-0" aria-hidden />
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={atLastPage}
                  onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                  className="inline-flex h-9 items-center gap-1 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-default disabled:border-dashed disabled:text-slate-400 disabled:hover:bg-white"
                >
                  Suivant
                  <ChevronRight className="size-4 shrink-0" aria-hidden />
                </button>
              </nav>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
