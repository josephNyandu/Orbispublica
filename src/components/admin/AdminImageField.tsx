import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { uploadAdminImage } from "@/lib/api";
import { adminImagePreviewSrc, isValidAdminImageValue } from "@/lib/adminImage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminInfoTooltip } from "@/components/admin/AdminInfoTooltip";

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

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          id={uploadTriggerId}
          variant="secondary"
          size="sm"
          className="gap-2"
          disabled={disabled || uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="size-4 shrink-0" aria-hidden />
          {uploading ? "Envoi…" : "Choisir une image"}
        </Button>
        <span className="text-xs text-slate-500">JPEG, PNG, WebP ou GIF — max. 5 Mo</span>
      </div>

      <button
        type="button"
        className="text-xs font-medium text-blue-700 hover:text-blue-800 underline-offset-2 hover:underline"
        onClick={() => setShowExternalUrl((v) => !v)}
      >
        {showExternalUrl ? "Masquer le lien externe" : "Ou coller une URL externe (https…)"}
      </button>

      {showExternalUrl ? (
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
        />
      ) : null}

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex items-start gap-4 pt-1">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
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
            <span className="flex size-full items-center justify-center p-2 text-center text-xs text-slate-400">
              Aperçu
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 leading-relaxed pt-1">
          L’image est stockée sur ce serveur lorsque vous utilisez « Choisir une image ». Vous pouvez aussi
          indiquer une URL si l’image est déjà hébergée ailleurs.
        </p>
      </div>
    </div>
  );
}
