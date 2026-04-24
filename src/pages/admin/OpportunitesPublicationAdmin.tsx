import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Bell, ExternalLink, FileText, History, Pencil, Plus, RotateCw, Trash2, Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  createOpportunityPost,
  deleteOpportunityPost,
  fetchAdminOpportunityPosts,
  updateOpportunityPost,
  uploadAdminDocument,
  type OpportunityAttachment,
  type OpportunityPost,
  type OpportunityPostStatus,
} from "@/lib/api";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { isValidAdminImageValue } from "@/lib/adminImage";
import {
  OPPORTUNITY_CATEGORY_IDS,
  OPPORTUNITY_CATEGORY_LABELS,
  opportunityCategoryLabelForDisplay,
  opportunityCategoryPathForDisplay,
  type OpportunityCategoryId,
} from "@/data/opportunityCategories";
import { formatDeadlineFr } from "@/lib/consultationStatus";
import { AdminInfoTooltip } from "@/components/admin/AdminInfoTooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PublishMode = "draft" | "immediate" | "scheduled";

type CategoryFilter = "all" | OpportunityCategoryId;

function rowMatchesCategoryFilter(row: OpportunityPost, filter: CategoryFilter): boolean {
  if (filter === "all") return true;
  if (filter === "opportunites") {
    return row.category === "opportunites" || row.category === "appels-offres";
  }
  return row.category === filter;
}

type FormValues = {
  category: OpportunityCategoryId;
  title: string;
  organisme: string;
  lieu: string;
  summary: string;
  body: string;
  link_url: string;
  image_url: string;
  consultation_deadline: string;
  sort_order: number;
  publish_mode: PublishMode;
  scheduled_for_local: string;
};

const emptyDefaults: FormValues = {
  category: "opportunites",
  title: "",
  organisme: "",
  lieu: "",
  summary: "",
  body: "",
  link_url: "",
  image_url: "",
  consultation_deadline: "",
  sort_order: 0,
  publish_mode: "draft",
  scheduled_for_local: "",
};

const MAX_ATTACHMENTS = 15;

function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusLabel(s: OpportunityPostStatus): string {
  if (s === "draft") return "Brouillon";
  if (s === "scheduled") return "Planifiée";
  return "Publiée";
}

function statusBadgeClass(s: OpportunityPostStatus): string {
  if (s === "draft") return "bg-slate-100 text-slate-800 border-slate-200";
  if (s === "scheduled") return "bg-amber-50 text-amber-950 border-amber-200";
  return "bg-emerald-50 text-emerald-900 border-emerald-200";
}

export function OpportunitesPublicationAdmin() {
  const [items, setItems] = useState<OpportunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OpportunityPost | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [attachments, setAttachments] = useState<OpportunityAttachment[]>([]);
  const docFileRef = useRef<HTMLInputElement>(null);
  const [docUploading, setDocUploading] = useState(false);
  const [docUrlDraft, setDocUrlDraft] = useState("");
  const [docUrlNameDraft, setDocUrlNameDraft] = useState("");

  const form = useForm<FormValues>({ defaultValues: emptyDefaults });

  const filteredItems = useMemo(
    () => items.filter((row) => rowMatchesCategoryFilter(row, categoryFilter)),
    [items, categoryFilter]
  );

  const countsByCategory = useMemo(() => {
    const byId: Record<OpportunityCategoryId, number> = {
      opportunites: 0,
      "appels-a-projets": 0,
      "financements-subventions": 0,
      "alertes-personnalisees": 0,
    };
    for (const row of items) {
      for (const id of OPPORTUNITY_CATEGORY_IDS) {
        if (rowMatchesCategoryFilter(row, id)) byId[id] += 1;
      }
    }
    return { all: items.length, ...byId };
  }, [items]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminOpportunityPosts();
      setItems(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chargement impossible";
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    form.reset(emptyDefaults);
    setAttachments([]);
    setDocUrlDraft("");
    setDocUrlNameDraft("");
    setDialogOpen(true);
  }

  function openEdit(row: OpportunityPost) {
    setEditingId(row.id);
    const mode: PublishMode =
      row.status === "published" ? "immediate" : row.status === "scheduled" ? "scheduled" : "draft";
    form.reset({
      category: (OPPORTUNITY_CATEGORY_IDS as readonly string[]).includes(row.category)
        ? (row.category as OpportunityCategoryId)
        : "opportunites",
      title: row.title,
      organisme: row.organisme ?? "",
      lieu: row.lieu ?? "",
      summary: row.summary,
      body: row.body,
      link_url: row.link_url ?? "",
      image_url: row.image_url ?? "",
      sort_order: row.sort_order,
      publish_mode: mode,
      scheduled_for_local: row.scheduled_for ? isoToDatetimeLocalValue(row.scheduled_for) : "",
      consultation_deadline: row.consultation_deadline ?? "",
    });
    setAttachments(
      Array.isArray(row.attachments)
        ? row.attachments.map((a) => ({
            url: a.url,
            ...(a.name?.trim() ? { name: a.name.trim() } : {}),
          }))
        : []
    );
    setDocUrlDraft("");
    setDocUrlNameDraft("");
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    const link = values.link_url.trim();
    const publish_mode = values.publish_mode;
    if (publish_mode === "scheduled") {
      if (!values.scheduled_for_local.trim()) {
        toast.error("Choisissez une date et une heure pour la planification.");
        return;
      }
      const t = new Date(values.scheduled_for_local).getTime();
      if (!Number.isFinite(t) || t <= Date.now()) {
        toast.error("La planification doit être dans le futur.");
        return;
      }
    }

    const img = values.image_url.trim();

    const payloadBase: Parameters<typeof createOpportunityPost>[0] = {
      category: values.category,
      title: values.title.trim(),
      summary: values.summary.trim(),
      body: values.body.trim(),
      link_url: link || null,
      image_url: img || null,
      attachments: attachments
        .map((a) => ({
          url: a.url.trim(),
          ...(a.name?.trim() ? { name: a.name.trim() } : {}),
        }))
        .filter((a) => a.url),
      sort_order: Number.isFinite(values.sort_order) ? values.sort_order : 0,
      publish_mode,
      scheduled_for:
        publish_mode === "scheduled" ? new Date(values.scheduled_for_local).toISOString() : null,
    };

    if (values.category === "opportunites") {
      payloadBase.organisme = values.organisme.trim() || null;
      payloadBase.lieu = values.lieu.trim() || null;
      payloadBase.consultation_deadline = values.consultation_deadline.trim() || null;
    }

    try {
      if (editingId == null) {
        await createOpportunityPost(payloadBase);
        toast.success(
          publish_mode === "immediate"
            ? "Publication en ligne"
            : publish_mode === "scheduled"
              ? "Publication planifiée"
              : "Brouillon enregistré"
        );
      } else {
        await updateOpportunityPost(editingId, payloadBase);
        toast.success("Publication mise à jour");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteOpportunityPost(deleteTarget.id);
      toast.success("Publication supprimée");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  async function onDocumentSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} pièces jointes.`);
      return;
    }
    setDocUploading(true);
    try {
      const url = await uploadAdminDocument(file);
      setAttachments((prev) => [...prev, { url, name: file.name }]);
      toast.success("Document ajouté");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setDocUploading(false);
    }
  }

  function addDocumentFromHttpsUrl() {
    const url = docUrlDraft.trim();
    if (!/^https:\/\//i.test(url)) {
      toast.error("Indiquez une URL qui commence par https://");
      return;
    }
    if (attachments.length >= MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} pièces jointes.`);
      return;
    }
    const name = docUrlNameDraft.trim() || "Document";
    setAttachments((prev) => [...prev, { url, name }]);
    setDocUrlDraft("");
    setDocUrlNameDraft("");
    toast.success("Lien ajouté");
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Opportunités — publications</h1>
            <AdminInfoTooltip text="Une thématique = une page du menu Opportunités (appels d’offres, appels à projets, financements et subventions, projets PPP). Planification possible." />
          </div>
          <p className="text-sm text-slate-600 max-w-2xl">
            Chaque thématique correspond à une page du menu Opportunités (appels d’offres, appels à projets,
            financements &amp; subventions, projets PPP). Publiez tout de suite, en brouillon ou planifiez ;
            l’historique des actions est disponible à part.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="gap-2" asChild>
            <Link to="/admin/opportunites/historique">
              <History className="size-4" />
              Historique
            </Link>
          </Button>
          <Button type="button" variant="outline" className="gap-2" asChild>
            <Link to="/admin/opportunites/abonnements">
              <Bell className="size-4" />
              Abonnements
            </Link>
          </Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => void load()}>
            <RotateCw className="size-4" />
            Actualiser
          </Button>
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="size-4" />
            Nouvelle publication
          </Button>
        </div>
      </div>

      {!loading && !loadError && items.length > 0 ? (
        <Tabs
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
          className="gap-0"
        >
          <div className="rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Filtrer par thématique
              </p>
              <p className="text-xs text-slate-500 sm:text-right">
                {filteredItems.length === items.length
                  ? `${items.length} publication${items.length > 1 ? "s" : ""}`
                  : `${filteredItems.length} sur ${items.length}`}
              </p>
            </div>
            <TabsList className="inline-flex h-auto min-h-0 w-full flex-wrap justify-start gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
              <TabsTrigger
                value="all"
                className="group flex-none rounded-lg border border-transparent px-3 py-2 text-xs font-medium data-[state=active]:border-slate-200 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm sm:text-sm"
              >
                Toutes
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-5 min-w-5 justify-center px-1.5 text-[10px] tabular-nums group-data-[state=active]:border-transparent group-data-[state=active]:bg-white/15 group-data-[state=active]:text-white"
                >
                  {countsByCategory.all}
                </Badge>
              </TabsTrigger>
              {OPPORTUNITY_CATEGORY_IDS.map((id) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="group flex-none max-w-full rounded-lg border border-transparent px-2.5 py-2 text-left text-xs font-medium data-[state=active]:border-slate-200 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-sm sm:px-3 sm:text-sm"
                >
                  <span className="line-clamp-2 sm:line-clamp-none">{OPPORTUNITY_CATEGORY_LABELS[id]}</span>
                  <Badge
                    variant="secondary"
                    className="ml-1.5 h-5 min-w-5 shrink-0 justify-center px-1.5 text-[10px] tabular-nums group-data-[state=active]:border-transparent group-data-[state=active]:bg-white/15 group-data-[state=active]:text-white"
                  >
                    {countsByCategory[id]}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-slate-600">Chargement…</p>
        ) : loadError ? (
          <div className="space-y-4 p-8 text-center">
            <p className="text-red-700">{loadError}</p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Réessayer
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-600">
            Aucune publication pour l’instant. Utilisez « Nouvelle publication » pour en créer une.
          </p>
        ) : (
          <>
            {filteredItems.length === 0 ? (
              <p className="p-8 text-center text-slate-600">
                Aucune publication pour cette thématique. Choisissez un autre onglet ou « Toutes ».
              </p>
            ) : (
              <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                <div className="max-h-[min(36rem,68vh)] overflow-auto overscroll-contain rounded-lg border border-slate-100 bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead>Thématique</TableHead>
                      <TableHead>Titre</TableHead>
                      <TableHead className="hidden xl:table-cell max-w-[9rem]">Organisme</TableHead>
                      <TableHead className="hidden xl:table-cell max-w-[7rem]">Lieu</TableHead>
                      <TableHead className="hidden lg:table-cell whitespace-nowrap">Date limite</TableHead>
                      <TableHead className="whitespace-nowrap">État</TableHead>
                      <TableHead className="hidden lg:table-cell">Planification / publication</TableHead>
                      <TableHead className="text-right w-[140px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((row) => {
                        const publicHref = opportunityCategoryPathForDisplay(row.category);
                        const isAo = row.category === "opportunites" || row.category === "appels-offres";
                        return (
                          <TableRow key={row.id}>
                            <TableCell className="align-top text-sm">
                              <span className="font-medium text-slate-800">
                                {opportunityCategoryLabelForDisplay(row.category)}
                              </span>
                            </TableCell>
                            <TableCell className="align-top max-w-[280px]">
                              <div className="font-medium text-slate-900 leading-snug">{row.title}</div>
                              {row.summary ? (
                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">{row.summary}</p>
                              ) : null}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell align-top max-w-[9rem] text-xs text-slate-700">
                              {isAo ? (
                                <span className="line-clamp-3" title={row.organisme ?? ""}>
                                  {row.organisme?.trim() ? row.organisme : "—"}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden xl:table-cell align-top max-w-[7rem] text-xs text-slate-700">
                              {isAo ? (
                                <span className="line-clamp-2" title={row.lieu ?? ""}>
                                  {row.lieu?.trim() ? row.lieu : "—"}
                                </span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell align-top text-xs text-slate-600 whitespace-nowrap">
                              {isAo && row.consultation_deadline?.trim()
                                ? formatDeadlineFr(row.consultation_deadline)
                                : "—"}
                            </TableCell>
                            <TableCell className="align-top whitespace-nowrap">
                              <Badge variant="outline" className={`font-normal ${statusBadgeClass(row.status)}`}>
                                {statusLabel(row.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="align-top hidden lg:table-cell text-xs text-slate-600">
                              {row.status === "scheduled" && row.scheduled_for ? (
                                <span>Prévu : {new Date(row.scheduled_for).toLocaleString("fr-FR")}</span>
                              ) : row.status === "published" && row.published_at ? (
                                <span>En ligne depuis le {new Date(row.published_at).toLocaleString("fr-FR")}</span>
                              ) : (
                                <span>—</span>
                              )}
                            </TableCell>
                            <TableCell className="align-top text-right">
                              <div className="flex flex-wrap justify-end gap-1">
                                {row.status === "published" && publicHref ? (
                                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
                                    <Link to={publicHref} target="_blank" rel="noreferrer">
                                      <ExternalLink className="size-3.5" />
                                      Site
                                    </Link>
                                  </Button>
                                ) : null}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEdit(row)}
                                  aria-label="Modifier"
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700"
                                  onClick={() => setDeleteTarget(row)}
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[min(92vh,52rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingId == null ? "Nouvelle publication" : "Modifier la publication"}</DialogTitle>
            <DialogDescription className="sr-only">
              Complétez la fiche opportunité (liste et page publique), puis enregistrez.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(
              (v) => void onSubmit(v),
              () => toast.error("Vérifiez les champs obligatoires.")
            )}
          >
            <div className="space-y-2">
              <Label htmlFor="opp-cat">Thématique</Label>
              <select
                id="opp-cat"
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                {...form.register("category", { required: true })}
              >
                {OPPORTUNITY_CATEGORY_IDS.map((id) => (
                  <option key={id} value={id}>
                    {OPPORTUNITY_CATEGORY_LABELS[id]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="opp-title">Titre</Label>
              <Input id="opp-title" {...form.register("title", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opp-sum">Résumé</Label>
              <Textarea id="opp-sum" rows={2} {...form.register("summary")} />
            </div>
            <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/90 p-4">
              <p className="text-sm font-semibold text-slate-900">
                Fiche liste publique <span className="font-normal text-slate-500">(tableau opportunités)</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="opp-org">Organisme</Label>
                  <Input
                    id="opp-org"
                    placeholder="Donneur d’ordre, institution, bailleur…"
                    {...form.register("organisme")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="opp-lieu">Lieu</Label>
                  <Input id="opp-lieu" placeholder="Ville, province, RDC…" {...form.register("lieu")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="opp-deadline">Date limite (échéance / dépôt des offres)</Label>
                <Input id="opp-deadline" type="date" {...form.register("consultation_deadline")} />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Optionnel : alimente la colonne « Date limite » et le filtre « Statut » sur les pages
                  opportunités (en cours, moins de 3 jours, expirée, ou non précisé si vide).
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="opp-body">Texte complet</Label>
              <Textarea id="opp-body" rows={6} className="resize-y" {...form.register("body")} />
            </div>

            <Controller
              key={`opp-cover-${editingId ?? "new"}`}
              name="image_url"
              control={form.control}
              rules={{
                validate: (v) => {
                  const s = String(v ?? "").trim();
                  if (!s) return true;
                  return isValidAdminImageValue(s) || "Image invalide : fichier envoyé ou URL https.";
                },
              }}
              render={({ field, fieldState }) => (
                <AdminImageField
                  id="opp-image-url"
                  label="Image de couverture (optionnelle)"
                  tooltip="Comme pour les réalisations : envoi local ou URL. Affichée sur la liste et la page de l’annonce."
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="text-slate-800">Pièces jointes (PDF, Word)</Label>
                <AdminInfoTooltip text="Jusqu’à 15 fichiers. Stockés sur ce serveur ou lien https vers un document déjà en ligne." />
              </div>
              <input
                ref={docFileRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                tabIndex={-1}
                disabled={docUploading}
                onChange={(e) => void onDocumentSelected(e)}
                aria-hidden
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  disabled={docUploading || attachments.length >= MAX_ATTACHMENTS}
                  onClick={() => docFileRef.current?.click()}
                >
                  <Upload className="size-4 shrink-0" aria-hidden />
                  {docUploading ? "Envoi…" : "Ajouter un fichier"}
                </Button>
                <span className="text-xs text-slate-500">PDF, .doc, .docx — max. 15 Mo par fichier</span>
              </div>
              {attachments.length > 0 ? (
                <ul className="space-y-2 pt-1">
                  {attachments.map((a, idx) => (
                    <li
                      key={`att-${idx}`}
                      className="flex flex-col gap-2 rounded-md border border-slate-200 bg-white p-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-2">
                        <FileText className="size-4 shrink-0 text-slate-500 mt-0.5" aria-hidden />
                        <div className="min-w-0 flex-1 space-y-1">
                          <Input
                            value={a.name ?? ""}
                            placeholder="Titre affiché (ex. Cahier des charges)"
                            className="h-8 text-sm"
                            onChange={(e) => {
                              const name = e.target.value;
                              setAttachments((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, name } : x))
                              );
                            }}
                          />
                          <p className="truncate text-xs text-slate-500" title={a.url}>
                            {a.url}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="shrink-0 text-red-600 hover:text-red-700"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Retirer
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">Aucune pièce jointe pour l’instant.</p>
              )}
              <div className="space-y-2 border-t border-slate-200 pt-3">
                <p className="text-xs font-medium text-slate-600">Ou lien direct (https) vers un document</p>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor="opp-doc-url" className="text-xs text-slate-600">
                      URL du fichier
                    </Label>
                    <Input
                      id="opp-doc-url"
                      type="url"
                      placeholder="https://…"
                      value={docUrlDraft}
                      onChange={(e) => setDocUrlDraft(e.target.value)}
                      disabled={attachments.length >= MAX_ATTACHMENTS}
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor="opp-doc-url-name" className="text-xs text-slate-600">
                      Libellé (optionnel)
                    </Label>
                    <Input
                      id="opp-doc-url-name"
                      placeholder="Intitulé du document"
                      value={docUrlNameDraft}
                      onChange={(e) => setDocUrlNameDraft(e.target.value)}
                      disabled={attachments.length >= MAX_ATTACHMENTS}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="sm:mb-0.5"
                    disabled={attachments.length >= MAX_ATTACHMENTS}
                    onClick={addDocumentFromHttpsUrl}
                  >
                    Ajouter le lien
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opp-link">Lien web associé (optionnel)</Label>
              <p className="text-xs text-slate-500">
                Page externe (portail d’acheteur, formulaire, etc.) — distinct de l’image et des documents.
              </p>
              <Input
                id="opp-link"
                type="url"
                placeholder="https://…"
                {...form.register("link_url")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="opp-order">Ordre d’affichage</Label>
              <Input id="opp-order" type="number" {...form.register("sort_order", { valueAsNumber: true })} />
              <p className="text-xs text-slate-500">Plus petit = plus haut dans la liste publique.</p>
            </div>

            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/80 p-4">
              <Label className="text-slate-800">Publication</Label>
              <RadioGroup
                value={form.watch("publish_mode")}
                onValueChange={(v) => form.setValue("publish_mode", v as PublishMode)}
                className="gap-3"
              >
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="draft" id="pm-draft" className="mt-0.5" />
                  <Label htmlFor="pm-draft" className="font-normal leading-snug cursor-pointer">
                    Brouillon (non visible sur le site)
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="immediate" id="pm-now" className="mt-0.5" />
                  <Label htmlFor="pm-now" className="font-normal leading-snug cursor-pointer">
                    Publier immédiatement
                  </Label>
                </div>
                <div className="flex items-start gap-2">
                  <RadioGroupItem value="scheduled" id="pm-sch" className="mt-0.5" />
                  <Label htmlFor="pm-sch" className="font-normal leading-snug cursor-pointer">
                    Planifier la mise en ligne
                  </Label>
                </div>
              </RadioGroup>
              {form.watch("publish_mode") === "scheduled" ? (
                <div className="space-y-2 pt-1">
                  <Label htmlFor="opp-sch">Date et heure</Label>
                  <Input id="opp-sch" type="datetime-local" {...form.register("scheduled_for_local")} />
                </div>
              ) : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette publication ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est définitive. L’entrée sera conservée dans l’historique (événement
              « supprimé »).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-600/90"
              onClick={(e) => {
                e.preventDefault();
                void confirmDelete();
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
