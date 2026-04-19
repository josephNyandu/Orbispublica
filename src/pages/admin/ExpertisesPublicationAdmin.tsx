import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { ExternalLink, Pencil, RotateCcw, RotateCw } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  fetchAdminServicePublications,
  updateServicePublication,
  type ServicePublication,
} from "@/lib/api";
import { servicesData } from "@/data/services";
import { mergeServiceDetailEntry } from "@/lib/servicePublication";
import { invalidateServicePublicationsCache } from "@/lib/servicePublicationsEvents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
import { AdminInfoTooltip } from "@/components/admin/AdminInfoTooltip";
import { AdminImageField } from "@/components/admin/AdminImageField";
import { isValidAdminImageValue, normalizeAdminImageValue } from "@/lib/adminImage";

type RowView = {
  slug: string;
  title: string;
  image: string;
  description: string;
  published: boolean;
  sort_order: number;
  customized: boolean;
};

type ContentForm = {
  title: string;
  subtitle: string;
  description: string;
  fullDescription: string;
  image: string;
  detailsText: string;
  benefitsText: string;
};

function hasContentOverrides(
  o: ServicePublication["content_overrides"] | null | undefined
): boolean {
  if (!o || typeof o !== "object") return false;
  return Object.keys(o).some((k) => {
    const v = o[k as keyof typeof o];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" && v.trim().length > 0;
  });
}

export function ExpertisesPublicationAdmin() {
  const [rows, setRows] = useState<ServicePublication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [clearSlug, setClearSlug] = useState<string | null>(null);

  const form = useForm<ContentForm>({
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      fullDescription: "",
      image: "",
      detailsText: "",
      benefitsText: "",
    },
  });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminServicePublications();
      setRows(data);
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

  const tableRows = useMemo((): RowView[] => {
    const bySlug = new Map(rows.map((r) => [r.slug, r]));
    const merged = servicesData.map((s, index) => {
      const r = bySlug.get(s.slug);
      const view = mergeServiceDetailEntry(s, r?.content_overrides ?? null);
      return {
        slug: s.slug,
        title: view.title,
        image: view.image,
        description: view.description,
        published: r ? r.published : true,
        sort_order: r ? r.sort_order : index,
        customized: hasContentOverrides(r?.content_overrides),
      };
    });
    merged.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return a.slug.localeCompare(b.slug);
    });
    return merged;
  }, [rows]);

  function openContentEditor(slug: string) {
    const base = servicesData.find((s) => s.slug === slug);
    if (!base) return;
    const row = rows.find((r) => r.slug === slug);
    const m = mergeServiceDetailEntry(base, row?.content_overrides ?? null);
    form.reset({
      title: m.title,
      subtitle: m.subtitle,
      description: m.description,
      fullDescription: m.fullDescription,
      image: m.image,
      detailsText: m.details.join("\n"),
      benefitsText: (m.benefits ?? []).join("\n"),
    });
    setEditSlug(slug);
  }

  async function onSaveContent(values: ContentForm) {
    if (!editSlug) return;
    if (!isValidAdminImageValue(values.image)) {
      toast.error("Indiquez une image valide : envoi local ou URL https.");
      return;
    }
    const image = normalizeAdminImageValue(values.image);
    try {
      await updateServicePublication(editSlug, {
        content: {
          title: values.title.trim(),
          subtitle: values.subtitle.trim(),
          description: values.description.trim(),
          fullDescription: values.fullDescription.trim(),
          image,
          details: values.detailsText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
          benefits: values.benefitsText
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean),
        },
      });
      toast.success("Contenu enregistré — vous pouvez le modifier à tout moment.");
      setEditSlug(null);
      await load();
      invalidateServicePublicationsCache();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    }
  }

  async function confirmClearOverrides() {
    if (!clearSlug) return;
    try {
      await updateServicePublication(clearSlug, { content: null });
      toast.success("Textes d’origine du site rétablis pour cette expertise.");
      setClearSlug(null);
      if (editSlug === clearSlug) setEditSlug(null);
      await load();
      invalidateServicePublicationsCache();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action impossible");
    }
  }

  async function togglePublished(slug: string, published: boolean) {
    try {
      await updateServicePublication(slug, { published });
      toast.success(published ? "Publication activée" : "Mis en brouillon");
      setRows((prev) =>
        prev.map((r) => (r.slug === slug ? { ...r, published } : r))
      );
      invalidateServicePublicationsCache();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mise à jour impossible");
    }
  }

  async function saveSortOrder(slug: string, value: string) {
    const n = Number(value);
    if (!Number.isFinite(n)) return;
    try {
      const updated = await updateServicePublication(slug, { sort_order: n });
      setRows((prev) => {
        const next = prev.filter((r) => r.slug !== slug);
        next.push(updated);
        return next;
      });
      toast.success("Ordre enregistré");
      invalidateServicePublicationsCache();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    }
  }

  const editingRow = editSlug ? tableRows.find((r) => r.slug === editSlug) : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Expertises</h1>
            <AdminInfoTooltip text="Contrôle de la publication et du contenu des fiches « Expertises » (textes, image, ordre)." />
          </div>
          <p className="text-sm text-slate-600">
            Même principe que « Réalisations » : aperçu visuel, édition des textes et de l’image à
            tout moment, publication sur le site via le commutateur. Seules les fiches{" "}
            <strong>publiées</strong> sont visibles publiquement.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={() => void load()}>
            <RotateCw className="size-4" />
            Actualiser
          </Button>
          <AdminInfoTooltip text="Relit les données serveur (utile après une modification ailleurs ou en cas de doute)." side="left" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-8 text-center text-slate-600">Chargement…</p>
        ) : loadError ? (
          <div className="space-y-4 p-8 text-center">
            <p className="text-red-700">{loadError}</p>
            <p className="text-sm text-slate-600">
              Vérifiez que l’API tourne (ex. <code className="rounded bg-slate-100 px-1">npm run dev</code>{" "}
              avec le serveur Node) et que vous êtes connecté.
            </p>
            <Button type="button" variant="outline" onClick={() => void load()}>
              Réessayer
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px]">
                  <span className="inline-flex items-center gap-1">
                    Aperçu
                    <AdminInfoTooltip text="Image actuelle de la fiche expertise sur le site." side="bottom" />
                  </span>
                </TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1">
                    Titre
                    <AdminInfoTooltip text="Titre affiché (peut provenir du site ou de vos surcharges)." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <span className="inline-flex items-center gap-1">
                    Slug
                    <AdminInfoTooltip text="Identifiant d’URL (/services/…) — fixe dans le code, non modifiable ici." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="w-[130px]">
                  <span className="inline-flex items-center gap-1">
                    État
                    <AdminInfoTooltip text="En ligne / brouillon et indication si le contenu a été personnalisé." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="w-[100px]">
                  <span className="inline-flex items-center gap-1">
                    Ordre
                    <AdminInfoTooltip text="Tri des fiches sur la liste publique ; validez avec Entrée ou en quittant le champ." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="w-[120px]">
                  <span className="inline-flex items-center gap-1">
                    Publié
                    <AdminInfoTooltip text="Masque ou affiche la fiche sur le site sans supprimer vos textes." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="w-[200px] text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    Actions
                    <AdminInfoTooltip text="Éditer le contenu ou ouvrir la page publique si la fiche est publiée." side="bottom" />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row) => (
                <TableRow key={row.slug}>
                  <TableCell className="align-middle">
                    <div className="relative size-14 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img
                        src={row.image}
                        alt=""
                        className="size-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0";
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <div className="font-medium leading-snug">{row.title}</div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 md:hidden">
                      {row.description}
                    </p>
                  </TableCell>
                  <TableCell className="hidden font-mono text-xs text-slate-600 md:table-cell">
                    {row.slug}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1.5">
                      {row.published ? (
                        <Badge className="w-fit bg-blue-600 font-normal hover:bg-blue-600">
                          En ligne
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="w-fit font-normal">
                          Brouillon
                        </Badge>
                      )}
                      {row.customized ? (
                        <Badge variant="outline" className="w-fit border-slate-300 font-normal text-xs">
                          Personnalisé
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-500">Défaut site</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      className="h-9 w-20"
                      defaultValue={row.sort_order}
                      key={`${row.slug}-${row.sort_order}`}
                      onBlur={(e) => {
                        if (e.target.value === String(row.sort_order)) return;
                        void saveSortOrder(row.slug, e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      aria-label={`Ordre pour ${row.title}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.published}
                      onCheckedChange={(v) => togglePublished(row.slug, v)}
                      aria-label={row.published ? "Dépublier" : "Publier"}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {row.published && (
                        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
                          <Link to={`/services/${row.slug}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-3.5" />
                            Site
                          </Link>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openContentEditor(row.slug)}
                        aria-label="Modifier le contenu"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog
        open={!!editSlug}
        onOpenChange={(open) => {
          if (!open) setEditSlug(null);
        }}
      >
        <DialogContent className="max-h-[min(90vh,48rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l’expertise</DialogTitle>
            <DialogDescription>
              {editingRow ? (
                <>
                  Slug : <code className="text-xs">{editingRow.slug}</code> — même logique que les
                  réalisations : enregistrez, rouvrez, modifiez autant que nécessaire.
                </>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(
              (vals) => void onSaveContent(vals),
              () => toast.error("Complétez les champs obligatoires.")
            )}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="ex-title">Titre</Label>
                  <AdminInfoTooltip text="Titre principal de la page expertise." />
                </div>
                <Input id="ex-title" {...form.register("title", { required: true })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="ex-sub">Sous-titre</Label>
                  <AdminInfoTooltip text="Ligne d’accroche sous le titre (hero)." />
                </div>
                <Input id="ex-sub" {...form.register("subtitle", { required: true })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="ex-desc">Résumé (liste & hero)</Label>
                  <AdminInfoTooltip text="Court paragraphe pour les listes d’expertises et l’introduction de la fiche." />
                </div>
                <Textarea id="ex-desc" rows={3} {...form.register("description", { required: true })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="ex-full">Description complète</Label>
                  <AdminInfoTooltip text="Corps de texte détaillé sur la page publique de l’expertise." />
                </div>
                <Textarea
                  id="ex-full"
                  rows={8}
                  className="resize-y font-mono text-sm"
                  {...form.register("fullDescription", { required: true })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Controller
                  key={editSlug ?? ""}
                  name="image"
                  control={form.control}
                  rules={{
                    required: "Une image est requise (envoi local ou lien).",
                    validate: (v) =>
                      isValidAdminImageValue(String(v || "")) ||
                      "Indiquez une image valide : fichier (bouton) ou URL https.",
                  }}
                  render={({ field, fieldState }) => (
                    <AdminImageField
                      id="expertise-image"
                      label="Image"
                      tooltip="Visuel principal : envoi sur le serveur (recommandé) ou URL https."
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={fieldState.error?.message}
                    />
                  )}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="ex-details">Points clés (un par ligne)</Label>
                  <AdminInfoTooltip text="Chaque ligne devient une puce « détail » sur la page publique." />
                </div>
                <Textarea
                  id="ex-details"
                  rows={6}
                  className="resize-y font-mono text-sm"
                  {...form.register("detailsText", { required: true })}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="ex-ben">Avantages (un par ligne)</Label>
                  <AdminInfoTooltip text="Liste d’atouts ou bénéfices, une entrée par ligne." />
                </div>
                <Textarea
                  id="ex-ben"
                  rows={5}
                  className="resize-y font-mono text-sm"
                  {...form.register("benefitsText", { required: true })}
                />
              </div>
            </div>
            <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2 text-slate-700"
                  onClick={() => editSlug && setClearSlug(editSlug)}
                >
                  <RotateCcw className="size-4" />
                  Rétablir les textes d’origine
                </Button>
                <AdminInfoTooltip text="Supprime vos surcharges : la fiche reprend le contenu défini dans le code source du site." side="top" />
              </div>
              <div className="flex w-full justify-end gap-2 sm:w-auto">
                <Button type="button" variant="outline" onClick={() => setEditSlug(null)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!clearSlug} onOpenChange={(o) => !o && setClearSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rétablir les textes d’origine ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les textes et l’image personnalisés pour cette expertise seront supprimés. La fiche
              utilisera à nouveau le contenu défini dans le code source du site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                void confirmClearOverrides();
              }}
            >
              Rétablir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
