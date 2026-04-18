import type { ComponentProps } from "react";
import { CircleHelp } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/components/ui/utils";

type AdminInfoTooltipProps = {
  /** Texte affiché dans l’infobulle */
  text: string;
  className?: string;
  iconClassName?: string;
  side?: ComponentProps<typeof TooltipContent>["side"];
};

/** Icône d’aide avec infobulle (dashboard admin). */
export function AdminInfoTooltip({
  text,
  className,
  iconClassName,
  side = "top",
}: AdminInfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex size-4 shrink-0 items-center justify-center rounded-sm text-slate-400 outline-none transition-colors hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1",
            className,
          )}
          aria-label="Aide"
        >
          <CircleHelp className={cn("size-3.5", iconClassName)} strokeWidth={2} />
        </button>
      </TooltipTrigger>
      <TooltipContent side={side} sideOffset={6} className="max-w-xs text-left font-normal leading-snug">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
