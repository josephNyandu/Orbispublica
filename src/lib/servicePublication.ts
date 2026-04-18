import type { ServiceDetailEntry } from "@/data/services";
import type { ServiceContentOverrides, ServicePublication } from "@/lib/api";

export function mergeServiceDetailEntry(
  base: ServiceDetailEntry,
  overrides: ServiceContentOverrides | null | undefined
): ServiceDetailEntry {
  if (!overrides) return base;
  return {
    ...base,
    title: overrides.title?.trim() ? overrides.title.trim() : base.title,
    subtitle: overrides.subtitle?.trim() ? overrides.subtitle.trim() : base.subtitle,
    description: overrides.description?.trim()
      ? overrides.description.trim()
      : base.description,
    fullDescription: overrides.fullDescription?.trim()
      ? overrides.fullDescription.trim()
      : base.fullDescription,
    image: overrides.image?.trim() ? overrides.image.trim() : base.image,
    details:
      Array.isArray(overrides.details) && overrides.details.length > 0
        ? overrides.details.map((d) => String(d).trim()).filter(Boolean)
        : base.details,
    benefits:
      Array.isArray(overrides.benefits) && overrides.benefits.length > 0
        ? overrides.benefits.map((d) => String(d).trim()).filter(Boolean)
        : base.benefits,
  };
}

export function mergeServicesWithPublication(
  services: readonly ServiceDetailEntry[],
  rows: ServicePublication[] | null,
  fallbackAllVisible: boolean
): ServiceDetailEntry[] {
  if (fallbackAllVisible || !rows || rows.length === 0) {
    return [...services];
  }
  const map = new Map(rows.map((r) => [r.slug, r]));
  const withMeta = services.map((s, index) => {
    const row = map.get(s.slug);
    const published = row ? row.published : true;
    const sortOrder = row ? row.sort_order : index * 10;
    const merged = mergeServiceDetailEntry(s, row?.content_overrides ?? null);
    return { service: merged, published, sortOrder, index };
  });
  const visible = withMeta.filter((x) => x.published);
  visible.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.index - b.index;
  });
  return visible.map((x) => x.service);
}
