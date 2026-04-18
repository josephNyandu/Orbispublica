import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { fetchAdminSiteContact, updateAdminSiteContact, type SiteContact } from "@/lib/api";
import { siteContactDefaults } from "@/data/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AdminInfoTooltip } from "@/components/admin/AdminInfoTooltip";

/** `useFieldArray` exige des objets par ligne pour les e-mails. */
type ContactFormValues = Omit<SiteContact, "emails"> & { emails: { value: string }[] };

function toFormValues(data: SiteContact): ContactFormValues {
  return {
    addressLine: data.addressLine,
    phones: data.phones.map((p) => ({
      label: p.label,
      tel: p.tel,
      whatsappUrl: p.whatsappUrl ?? "",
    })),
    emails: data.emails.map((value) => ({ value })),
    openingHours: { ...data.openingHours },
    navbar: { ...data.navbar },
  };
}

export function ContactInfoAdmin() {
  const [pageLoading, setPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const form = useForm<ContactFormValues>({
    defaultValues: toFormValues(siteContactDefaults),
  });

  const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
    control: form.control,
    name: "phones",
  });

  const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
    control: form.control,
    name: "emails",
  });

  const load = useCallback(async () => {
    setPageLoading(true);
    setLoadError(null);
    try {
      const data = await fetchAdminSiteContact();
      form.reset(toFormValues(data));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Chargement impossible";
      setLoadError(msg);
      toast.error(msg);
      form.reset(toFormValues(siteContactDefaults));
    } finally {
      setPageLoading(false);
    }
  }, [form]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(values: ContactFormValues) {
    const payload: SiteContact = {
      addressLine: values.addressLine.trim(),
      phones: values.phones.map((p) => {
        const wa = (p.whatsappUrl ?? "").trim();
        const base = { label: p.label.trim(), tel: p.tel.trim().replace(/\s/g, "") };
        return wa ? { ...base, whatsappUrl: wa } : base;
      }),
      emails: values.emails.map((e) => e.value.trim()).filter(Boolean),
      openingHours: {
        weekdays: values.openingHours.weekdays.trim(),
        saturday: values.openingHours.saturday.trim(),
      },
      navbar: {
        email: values.navbar.email.trim(),
        phoneDisplay: values.navbar.phoneDisplay.trim(),
        phoneTel: values.navbar.phoneTel.trim().replace(/\s/g, ""),
      },
    };

    try {
      await updateAdminSiteContact(payload);
      toast.success("Coordonnées enregistrées");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enregistrement impossible");
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-slate-600">
        <Loader2 className="size-6 animate-spin text-blue-600" aria-hidden />
        Chargement…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 w-fit px-2">
            <Link to="/admin" className="gap-1.5">
              <ArrowLeft className="size-4" />
              Tableau de bord
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Coordonnées du site</h1>
              <AdminInfoTooltip text="Ces champs alimentent le footer, la page Contact et les raccourcis visibles dans l’en-tête du site public." />
            </div>
            <p className="mt-1 max-w-xl text-sm text-slate-600">
              Ces informations apparaissent dans le pied de page, sur la page Contact et dans la
              barre supérieure du menu. Enregistrez pour mettre à jour le site public.
            </p>
            {loadError ? (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {loadError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
      >
        <section className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Label htmlFor="addressLine">Adresse (siège)</Label>
            <AdminInfoTooltip text="Bloc d’adresse multiligne tel qu’affiché sur la page Contact et souvent dans le pied de page." />
          </div>
          <Textarea
            id="addressLine"
            rows={3}
            className="resize-y"
            {...form.register("addressLine", { required: true })}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Label asChild>
                <span className="text-base font-semibold text-slate-900">Téléphones</span>
              </Label>
              <AdminInfoTooltip text="Ajoutez autant de lignes que nécessaire. Chaque ligne peut proposer un appel classique (tel:) ou un lien WhatsApp." />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendPhone({ label: "", tel: "", whatsappUrl: "" })}
            >
              <Plus className="size-4" />
              Ligne
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Optionnel : URL WhatsApp (ex. <code className="rounded bg-slate-100 px-1">https://wa.me/243…</code>) pour
            afficher un lien au lieu de <code className="rounded bg-slate-100 px-1">tel:</code>.
          </p>
          <ul className="space-y-4">
            {phoneFields.map((field, index) => (
              <li
                key={field.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:flex-row sm:flex-wrap sm:items-end"
              >
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`phone-label-${index}`}>Libellé affiché</Label>
                    <AdminInfoTooltip text="Texte visible à côté du numéro (ex. « Accueil », « Urgences »)." />
                  </div>
                  <Input id={`phone-label-${index}`} {...form.register(`phones.${index}.label` as const)} />
                </div>
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`phone-tel-${index}`}>Numéro (lien tel:)</Label>
                    <AdminInfoTooltip text="Chiffres utilisés pour le lien tel: (espaces retirés à l’enregistrement)." />
                  </div>
                  <Input id={`phone-tel-${index}`} {...form.register(`phones.${index}.tel` as const)} />
                </div>
                <div className="min-w-0 flex-[2] space-y-1.5 sm:basis-full">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor={`phone-wa-${index}`}>URL WhatsApp (optionnel)</Label>
                    <AdminInfoTooltip text="Si renseigné, le site propose ce lien à la place du numéro cliquable tel:." />
                  </div>
                  <Input id={`phone-wa-${index}`} {...form.register(`phones.${index}.whatsappUrl` as const)} />
                </div>
                {phoneFields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => removePhone(index)}
                    aria-label="Supprimer ce numéro"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Label asChild>
                <span className="text-base font-semibold text-slate-900">Adresses e-mail</span>
              </Label>
              <AdminInfoTooltip text="Liste des boîtes affichées sur le site (contact, footer, etc.)." />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => appendEmail({ value: "" })}>
              <Plus className="size-4" />
              E-mail
            </Button>
          </div>
          <ul className="space-y-3">
            {emailFields.map((field, index) => (
              <li key={field.id} className="flex gap-2">
                <Input
                  type="email"
                  className="flex-1"
                  {...form.register(`emails.${index}.value` as const)}
                />
                {emailFields.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-red-600 hover:bg-red-50"
                    onClick={() => removeEmail(index)}
                    aria-label="Supprimer cet e-mail"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-semibold text-slate-900">Heures d&apos;ouverture</span>
            <AdminInfoTooltip text="Texte libre pour décrire les créneaux (ex. Lun–Ven 9h–18h)." />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="oh-week">Semaine</Label>
              <AdminInfoTooltip text="Horaires du lundi au vendredi (ou formulation équivalente)." />
            </div>
            <Input id="oh-week" {...form.register("openingHours.weekdays")} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="oh-sat">Samedi</Label>
              <AdminInfoTooltip text="Horaires du samedi ou mention « fermé » si besoin." />
            </div>
            <Input id="oh-sat" {...form.register("openingHours.saturday")} />
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-base font-semibold text-slate-900">Barre du haut (navbar)</span>
            <AdminInfoTooltip text="Raccourcis compacts en haut de page : ils peuvent reprendre ou non les mêmes valeurs que le reste du formulaire." />
          </div>
          <p className="text-xs text-slate-600">
            Une ligne compacte : un e-mail et un numéro affiché (peuvent correspondre aux champs ci-dessus).
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="nav-email">E-mail</Label>
              <AdminInfoTooltip text="Adresse cliquable (mailto:) dans la barre de navigation." />
            </div>
            <Input id="nav-email" type="email" {...form.register("navbar.email")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="nav-display">Téléphone affiché</Label>
                <AdminInfoTooltip text="Texte visible pour le numéro dans le menu (peut inclure espaces ou préfixe)." />
              </div>
              <Input id="nav-display" {...form.register("navbar.phoneDisplay")} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="nav-tel">Lien tel (chiffres, ex. +243…)</Label>
                <AdminInfoTooltip text="Numéro normalisé pour le lien d’appel (chiffres et +, sans espaces à l’enregistrement)." />
              </div>
              <Input id="nav-tel" {...form.register("navbar.phoneTel")} />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Enregistrement…
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
          <AdminInfoTooltip text="Envoie les coordonnées au serveur et met à jour le site public." side="right" />
          <Button type="button" variant="outline" onClick={() => void load()} disabled={form.formState.isSubmitting}>
            Annuler / recharger
          </Button>
          <AdminInfoTooltip text="Recharge les valeurs depuis le serveur et abandonne les modifications non enregistrées." side="right" />
        </div>
      </form>
    </div>
  );
}
