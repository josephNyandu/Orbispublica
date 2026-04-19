import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import {
  type Realisation,
  createRealisation,
  deleteRealisation,
  fetchAdminRealisations,
  updateRealisation,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

type FormValues = {
  title: string;
  desc: string;
  category: string;
  image: string;
  published: boolean;
  sort_order: number;
};

const emptyDefaults: FormValues = {
  title: "",
  desc: "",
  category: "",
  image: "",
  published: false,
  sort_order: 0,
};

export function RealisationsAdmin() {
  const [items, setItems] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Realisation | null>(null);

  const form = useForm<FormValues>({ defaultValues: emptyDefaults });

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminRealisations();
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
    load();
  }, [load]);

  function openCreate() {
    setEditingId(null);
    form.reset(emptyDefaults);
    setDialogOpen(true);
  }

  function openEdit(row: Realisation) {
    setEditingId(row.id);
    form.reset({
      title: row.title,
      desc: row.desc,
      category: row.category,
      image: row.image,
      published: row.published,
      sort_order: row.sort_order,
    });
    setDialogOpen(true);
  }

  async function onSubmit(values: FormValues) {
    const order = Number.isFinite(values.sort_order) ? values.sort_order : 0;
    const image = normalizeAdminImageValue(values.image);
    try {
      if (editingId === null) {
        await createRealisation({
          title: values.title.trim(),
          desc: values.desc.trim(),
          category: values.category.trim(),
          image,
          published: values.published,
          sort_order: order,
        });
        toast.success("Réalisation créée");
      } else {
        await updateRealisation(editingId, {
          title: values.title.trim(),
          desc: values.desc.trim(),
          category: values.category.trim(),
          image,
          published: values.published,
          sort_order: order,
        });
        toast.success("Réalisation mise à jour");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      console.error("[Réalisations] enregistrement", e);
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    }
  }

  function onInvalidSubmit() {
    toast.error("Complétez les champs obligatoires (titre, catégorie, image, description).");
  }

  async function togglePublished(row: Realisation, published: boolean) {
    try {
      await updateRealisation(row.id, { published });
      toast.success(published ? "Publication activée" : "Mis en brouillon");
      setItems((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, published } : r))
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mise à jour impossible");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await deleteRealisation(deleteTarget.id);
      toast.success("Réalisation supprimée");
      setDeleteTarget(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Suppression impossible");
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Réalisations</h1>
            <AdminInfoTooltip text="Gestion des cartes du portfolio public « Nos réalisations » : brouillon vs publié, ordre d’affichage et médias." />
          </div>
          <p className="text-sm text-slate-600">
            Créez, modifiez ou supprimez des cartes à tout moment. Seules les entrées{" "}
            <strong>publiées</strong> apparaissent sur « Nos réalisations » ; les brouillons restent
            visibles ici.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            Nouvelle réalisation
          </Button>
          <AdminInfoTooltip text="Ouvre le formulaire pour créer une carte (image, texte, catégorie) sans quitter cette page." side="left" />
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
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-slate-600">Aucune réalisation pour le moment.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[72px]">
                  <span className="inline-flex items-center gap-1">
                    Aperçu
                    <AdminInfoTooltip text="Miniature de l’image telle qu’affichée sur le site." side="bottom" />
                  </span>
                </TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1">
                    Titre
                    <AdminInfoTooltip text="Intitulé principal de la carte de réalisation." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <span className="inline-flex items-center gap-1">
                    Catégorie
                    <AdminInfoTooltip text="Étiquette regroupant la réalisation (affichée sur le portfolio)." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="w-[130px]">
                  <span className="inline-flex items-center gap-1">
                    État
                    <AdminInfoTooltip text="En ligne = visible publiquement ; brouillon = réservé à l’admin." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="w-[120px]">
                  <span className="inline-flex items-center gap-1">
                    Publié
                    <AdminInfoTooltip text="Interrupteur rapide : même effet que le badge d’état." side="bottom" />
                  </span>
                </TableHead>
                <TableHead className="w-[200px] text-right">
                  <span className="inline-flex items-center justify-end gap-1">
                    Actions
                    <AdminInfoTooltip text="Modifier, supprimer ou ouvrir la page publique si la carte est publiée." side="bottom" />
                  </span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id}>
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
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500 md:hidden">{row.desc}</p>
                  </TableCell>
                  <TableCell className="hidden text-slate-600 md:table-cell">{row.category}</TableCell>
                  <TableCell>
                    {row.published ? (
                      <Badge className="bg-blue-600 font-normal hover:bg-blue-600">En ligne</Badge>
                    ) : (
                      <Badge variant="secondary" className="font-normal">
                        Brouillon
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={row.published}
                      onCheckedChange={(v) => togglePublished(row, v)}
                      aria-label={row.published ? "Dépublier" : "Publier"}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {row.published && (
                        <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" asChild>
                          <Link to="/nos-realisations" target="_blank" rel="noreferrer">
                            <ExternalLink className="size-3.5" />
                            Site
                          </Link>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(row)}
                        aria-label="Modifier"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteTarget(row)}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId === null ? "Nouvelle réalisation" : "Modifier la réalisation"}
            </DialogTitle>
            <DialogDescription>
              Enregistrez pour appliquer les changements sur le site. Ordre d’affichage : nombre plus
              petit = carte plus haute. Désactiver « Publié » conserve la fiche en brouillon.
            </DialogDescription>
          </DialogHeader>
          <form
            noValidate
            onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                {...form.register("title", { required: "Le titre est requis" })}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Catégorie</Label>
              <Input
                id="category"
                {...form.register("category", { required: "La catégorie est requise" })}
              />
              {form.formState.errors.category && (
                <p className="text-sm text-red-600">{form.formState.errors.category.message}</p>
              )}
            </div>
            <Controller
              key={String(editingId ?? "new")}
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
                  id="realisation-image"
                  label="Image"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={5}
                className="resize-y"
                {...form.register("desc", { required: "La description est requise" })}
              />
              {form.formState.errors.desc && (
                <p className="text-sm text-red-600">{form.formState.errors.desc.message}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.watch("published")}
                onCheckedChange={(v) => form.setValue("published", v)}
              />
              <Label htmlFor="published" className="cursor-pointer font-normal">
                Publié sur le site
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort_order">Ordre d’affichage</Label>
              <Input
                id="sort_order"
                type="number"
                {...form.register("sort_order", { valueAsNumber: true })}
              />
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
            <AlertDialogTitle>Supprimer cette réalisation ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La carte ne sera plus disponible dans
              l’administration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
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
