import { useRef, useState } from "react";
import { Link2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { uploadAdminImage } from "@/lib/api";
import { adminImagePreviewSrc, isValidAdminImageValue } from "@/lib/adminImage";
import { AdminInfoTooltip } from "@/components/admin/AdminInfoTooltip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";

type Props = {
  id?: string;
  label: string;
  tooltip?: string;
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
};

export function AdminImageField({
  id = "admin-image-field",
  label,
  tooltip,
  value,
  onChange,
  onBlur,
  error,
  disabled,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showExternalUrl, setShowExternalUrl] = useState(() => {
    const t = value.trim();
    return Boolean(t && !t.startsWith("/uploads/"));
  });

  const previewSrc = adminImagePreviewSrc(value);
  const uploadTriggerId = `${id}-upload-trigger`;
  const uploadFormatsHint =
    "Choisir un fichier sur l’appareil : JPEG, PNG, WebP ou GIF, max. 5 Mo. Après envoi, l’image est stockée sur ce serveur.";
  const urlFieldHint =
    "Afficher ou masquer le champ pour une image déjà hébergée ailleurs (URL https).";

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAdminImage(file);
      onChange(url);
      setShowExternalUrl(false);
      onBlur?.();
      toast.success("Image enregistrée sur le serveur");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <Label htmlFor={showExternalUrl ? id : uploadTriggerId}>{label}</Label>
        {tooltip ? <AdminInfoTooltip text={tooltip} /> : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        tabIndex={-1}
        disabled={disabled || uploading}
        onChange={(e) => void onFileSelected(e)}
        aria-hidden
      />

      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-lg border border-border/80 bg-muted/10 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06]",
          showExternalUrl ? "w-full max-w-full" : "w-fit max-w-full self-start",
        )}
      >
        <div className="flex min-h-14 items-stretch">
          <div className="relative h-14 w-14 shrink-0 border-r border-border/70 bg-muted/25">
            {previewSrc && isValidAdminImageValue(value) ? (
              <img
                src={previewSrc}
                alt=""
                className="size-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = "0";
                }}
              />
            ) : (
              <span className="flex size-full items-center justify-center px-1.5 text-center text-[0.625rem] font-medium leading-tight text-muted-foreground">
                Aperçu
              </span>
            )}
          </div>

          <div
            role="toolbar"
            aria-label="Charger ou lier une image"
            className="flex items-stretch divide-x divide-border/60 bg-background/90"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  id={uploadTriggerId}
                  variant="ghost"
                  className="h-auto min-h-14 w-12 shrink-0 rounded-none px-0 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  disabled={disabled || uploading}
                  aria-label={
                    uploading ? "Envoi de l’image en cours" : "Choisir une image sur l’appareil"
                  }
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Upload className="size-4" aria-hidden />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[16rem] text-left font-normal leading-snug">
                {uploadFormatsHint}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-auto min-h-14 w-12 shrink-0 rounded-none px-0 text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                    showExternalUrl && "bg-muted/80 text-foreground",
                  )}
                  disabled={disabled || uploading}
                  aria-label={
                    showExternalUrl ? "Masquer le champ URL externe" : "Saisir une image par URL https"
                  }
                  aria-pressed={showExternalUrl}
                  onClick={() => setShowExternalUrl((v) => !v)}
                >
                  <Link2 className="size-4" aria-hidden />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[14rem] text-left font-normal leading-snug">
                {urlFieldHint}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {showExternalUrl ? (
          <div className="border-t border-border/70 bg-background px-2.5 py-2">
            <Input
              id={id}
              type="text"
              inputMode="url"
              autoComplete="url"
              placeholder="https://…"
              disabled={disabled}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-1 focus-visible:ring-ring/40"
            />
          </div>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
