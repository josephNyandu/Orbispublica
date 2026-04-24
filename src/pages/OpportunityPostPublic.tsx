import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, ExternalLink, FileText } from "lucide-react";
import {
  fetchPublicOpportunityPost,
  fetchPublicOpportunityPosts,
  type OpportunityPost,
  type OpportunityPostNavState,
} from "@/lib/api";
import { adminImagePreviewSrc } from "@/lib/adminImage";
import { isOpportunityCategoryId, type OpportunityCategoryId } from "@/data/opportunityCategories";
import { formatDeadlineFr } from "@/lib/consultationStatus";
import { PageHeroBanner } from "@/components/PageHeroBanner";

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

function categoryIdForPublicList(cat: string): OpportunityCategoryId {
  if (isOpportunityCategoryId(cat)) return cat;
  if (cat === "appels-offres" || cat === "projets-ppp-investissement") return "opportunites";
  return "opportunites";
}

const expertiseCtaClassName =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-md transition-colors hover:bg-blue-400 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300";

function ExpertiseCtaLink() {
  return (
    <Link to="/contact" className={expertiseCtaClassName}>
      Activez notre expertise
      <ArrowRight className="size-4 shrink-0" aria-hidden />
    </Link>
  );
}

type SiblingNavProps = {
  posts: OpportunityPost[];
  current: OpportunityPost;
};

function SiblingPublicationNav({ posts, current }: SiblingNavProps) {
  const idx = posts.findIndex((p) => p.id === current.id);
  if (posts.length <= 1 || idx < 0) return null;

  const prev = idx > 0 ? posts[idx - 1] : null;
  const next = idx < posts.length - 1 ? posts[idx + 1] : null;
  const stateFor = (p: OpportunityPost): OpportunityPostNavState => ({ opportunityPost: p });

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-stretch gap-2 sm:max-w-[42%]">
          {prev ? (
            <Link
              to={`/opportunite/${prev.id}`}
              state={stateFor(prev)}
              title={prev.title}
              aria-label={`Publication précédente : ${prev.title}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50/80 hover:text-blue-800"
            >
              <ChevronLeft className="size-4 shrink-0" aria-hidden />
              Précédent
            </Link>
          ) : (
            <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-400">
              <ChevronLeft className="size-4 shrink-0 opacity-50" aria-hidden />
              Début de liste
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-center px-2 text-sm text-slate-600">
          <span className="tabular-nums font-medium text-slate-700">
            {idx + 1} / {posts.length}
          </span>
        </div>

        <div className="flex flex-1 items-stretch gap-2 sm:max-w-[42%] sm:flex-row-reverse">
          {next ? (
            <Link
              to={`/opportunite/${next.id}`}
              state={stateFor(next)}
              title={next.title}
              aria-label={`Publication suivante : ${next.title}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-blue-400 hover:bg-blue-50/80 hover:text-blue-800"
            >
              Suivant
              <ChevronRight className="size-4 shrink-0" aria-hidden />
            </Link>
          ) : (
            <span className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-400">
              Fin de liste
              <ChevronRight className="size-4 shrink-0 opacity-50" aria-hidden />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function OpportunityPostPublic() {
  const { postId } = useParams();
  const location = useLocation();
  const id = postId ? Number(postId) : NaN;
  const [post, setPost] = useState<OpportunityPost | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siblingPosts, setSiblingPosts] = useState<OpportunityPost[]>([]);

  useEffect(() => {
    if (!Number.isInteger(id) || id < 1) {
      setNotFound(true);
      setPost(null);
      return;
    }

    const nav = location.state as OpportunityPostNavState | null;
    const seeded = nav?.opportunityPost?.id === id ? nav.opportunityPost : undefined;

    setNotFound(false);
    setError(null);
    if (seeded) {
      setPost(seeded);
    } else {
      setPost(null);
    }

    let cancelled = false;
    (async () => {
      try {
        const data = await fetchPublicOpportunityPost(id);
        if (!cancelled) {
          setPost(data);
          setNotFound(false);
          setError(null);
        }
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("404") || msg.toLowerCase().includes("introuvable")) {
          setNotFound(true);
          setPost(null);
          setError(null);
          return;
        }
        if (seeded) {
          setPost(seeded);
          setError(null);
          setNotFound(false);
          return;
        }
        setPost(null);
        setError(msg || "Chargement impossible");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, location.key, location.state]);

  useEffect(() => {
    if (!post) {
      setSiblingPosts([]);
      return;
    }
    const cat = categoryIdForPublicList(post.category);
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchPublicOpportunityPosts(cat);
        if (!cancelled) setSiblingPosts(list);
      } catch {
        if (!cancelled) setSiblingPosts([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [post?.id, post?.category]);

  const showSiblingNav =
    !!post && siblingPosts.length > 1 && siblingPosts.some((p) => p.id === post.id);

  const siblingMeta = useMemo(() => {
    if (!post || siblingPosts.length <= 1) return null;
    const idx = siblingPosts.findIndex((p) => p.id === post.id);
    if (idx < 0) return null;
    return {
      idx,
      prev: idx > 0 ? siblingPosts[idx - 1] : null,
      next: idx < siblingPosts.length - 1 ? siblingPosts[idx + 1] : null,
      total: siblingPosts.length,
    };
  }, [post, siblingPosts]);

  if (notFound || (!post && !error && !Number.isInteger(id))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Annonce introuvable</h1>
        <p className="text-slate-600 text-center mb-6 max-w-md">
          Cette publication n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          to="/opportunites"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Retour aux opportunités
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 pt-24 pb-16">
        <p className="text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm max-w-lg text-center mb-6">
          {error}
        </p>
        <Link to="/opportunites" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Retour aux opportunités
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-28 pb-16 px-4 text-center text-slate-600" aria-busy="true">
        Chargement…
      </div>
    );
  }

  return (
    <div className={`pt-20 ${showSiblingNav ? "pb-28 md:pb-24" : ""}`}>
      <PageHeroBanner className="py-10 md:py-12">
        <div className="container mx-auto px-6 md:px-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">Annonce</p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
          <div className="mt-4 flex flex-col gap-1 text-sm text-slate-400">
            {post.published_at ? (
              <p>
                <time dateTime={post.published_at}>Publié le {formatDateFr(post.published_at)}</time>
              </p>
            ) : null}
            {(post.organisme?.trim() || post.lieu?.trim()) ? (
              <p className="text-slate-300">
                {post.organisme?.trim() ? (
                  <>
                    <span className="text-slate-500">Organisme</span> — {post.organisme.trim()}
                  </>
                ) : null}
                {post.organisme?.trim() && post.lieu?.trim() ? " · " : null}
                {post.lieu?.trim() ? (
                  <>
                    <span className="text-slate-500">Lieu</span> — {post.lieu.trim()}
                  </>
                ) : null}
              </p>
            ) : null}
            {post.consultation_deadline ? (
              <p>
                {post.category === "opportunites" ? "Dépôt des offres au plus tard le" : "Échéance au plus tard le"}{" "}
                <time dateTime={post.consultation_deadline}>{formatDeadlineFr(post.consultation_deadline)}</time>
              </p>
            ) : null}
          </div>
        </div>
      </PageHeroBanner>

      <article className="py-10 md:py-14 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 md:px-10 max-w-3xl">
          {post.summary ? (
            <p className="text-lg text-slate-700 leading-relaxed font-medium mb-8">{post.summary}</p>
          ) : null}
          {post.body ? (
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{post.body}</p>
            </div>
          ) : null}
          {!post.summary && !post.body ? (
            <p className="text-slate-500 text-sm">Aucun détail supplémentaire pour cette annonce.</p>
          ) : null}

          {post.image_url ? (
            <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <img
                src={adminImagePreviewSrc(post.image_url)}
                alt=""
                className="w-full max-h-[min(28rem,70vh)] object-cover object-center"
              />
            </div>
          ) : null}

          {post.attachments && post.attachments.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
                Documents
              </h2>
              <ul className="flex flex-col gap-2">
                {post.attachments.map((doc, i) => (
                  <li key={`${doc.url}-${i}`}>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full max-w-xl items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 hover:border-blue-300 hover:bg-blue-50/60 transition-colors"
                    >
                      <FileText className="size-5 shrink-0 text-blue-600" aria-hidden />
                      <span className="min-w-0 flex-1 truncate">
                        {doc.name?.trim() || doc.url.split("/").pop() || "Document"}
                      </span>
                      <ExternalLink className="size-4 shrink-0 text-slate-400" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <ExpertiseCtaLink />
              </div>
            </div>
          ) : (
            <div className="mt-10">
              <ExpertiseCtaLink />
            </div>
          )}

          {post.link_url ? (
            <p className="mt-10">
              <a
                href={post.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
              >
                Ouvrir le lien associé
                <ExternalLink className="size-4 shrink-0" aria-hidden />
              </a>
            </p>
          ) : null}

          {showSiblingNav ? (
            <div className="mt-14 border-t border-slate-200 pt-10">
              <SiblingPublicationNav posts={siblingPosts} current={post} />
            </div>
          ) : null}
        </div>
      </article>

      {showSiblingNav && siblingMeta ? (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(15,23,42,0.08)] md:hidden">
          <div className="container mx-auto max-w-3xl px-6 md:px-10 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-2">
              {siblingMeta.prev ? (
                <Link
                  to={`/opportunite/${siblingMeta.prev.id}`}
                  state={{ opportunityPost: siblingMeta.prev }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 active:bg-slate-50"
                >
                  <ChevronLeft className="size-5 shrink-0" aria-hidden />
                  Précédent
                </Link>
              ) : (
                <span className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 py-3 text-sm text-slate-400">
                  Précédent
                </span>
              )}
              <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold tabular-nums text-slate-700">
                {siblingMeta.idx + 1}/{siblingMeta.total}
              </span>
              {siblingMeta.next ? (
                <Link
                  to={`/opportunite/${siblingMeta.next.id}`}
                  state={{ opportunityPost: siblingMeta.next }}
                  className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-800 active:bg-slate-50"
                >
                  Suivant
                  <ChevronRight className="size-5 shrink-0" aria-hidden />
                </Link>
              ) : (
                <span className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 py-3 text-sm text-slate-400">
                  Suivant
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
