const MAX_OPPORTUNITY_ATTACHMENTS = 15;
const MAX_ATTACHMENT_URL_LEN = 2048;
const MAX_ATTACHMENT_NAME_LEN = 200;
const MAX_ORG_LIEU_LEN = 400;

export function normalizeOpportunityAttachmentsJson(
  attachments: unknown,
  existingJson: string | null | undefined
): string {
  if (attachments === undefined) {
    if (existingJson != null && String(existingJson).trim() !== "") {
      return String(existingJson);
    }
    return "[]";
  }
  if (!Array.isArray(attachments)) {
    return "[]";
  }
  const out: { url: string; name?: string }[] = [];
  for (const item of attachments.slice(0, MAX_OPPORTUNITY_ATTACHMENTS)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const url = String(rec.url ?? "")
      .trim()
      .slice(0, MAX_ATTACHMENT_URL_LEN);
    if (!url) continue;
    const okLocal = url.startsWith("/uploads/media/");
    const okRemote = /^https:\/\//i.test(url);
    if (!okLocal && !okRemote) continue;
    const nameRaw = String(rec.name ?? "")
      .trim()
      .slice(0, MAX_ATTACHMENT_NAME_LEN);
    if (nameRaw) {
      out.push({ url, name: nameRaw });
    } else {
      out.push({ url });
    }
  }
  return JSON.stringify(out);
}

export type ParsedOpportunityPostBody = {
  title: string;
  summary: string;
  body: string;
  link_url: string | null;
  image_url: string | null;
  attachments_json: string;
  category: string;
  sort_order: number;
  status: string;
  scheduled_for: string | null;
  consultation_deadline: string | null;
  organisme: string | null;
  lieu: string | null;
};

type ExistingShape = {
  title: string;
  summary: string;
  body: string;
  link_url: string | null;
  category: string;
  sort_order: number;
  status: string;
  scheduled_for: string | null;
  image_url?: string | null;
  attachments_json?: string | null;
  consultation_deadline?: string | null;
  organisme?: string | null;
  lieu?: string | null;
};

export function parseOpportunityPostBody(body: unknown, existing: ExistingShape | null): ParsedOpportunityPostBody {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = String(b.title ?? existing?.title ?? "").trim();
  const summary = String(b.summary ?? existing?.summary ?? "").trim();
  const bodyText = String(b.body ?? b.content ?? existing?.body ?? "").trim();
  const linkRaw = b.link_url !== undefined ? String(b.link_url ?? "").trim() : (existing?.link_url ?? "");
  const link_url = linkRaw ? linkRaw : null;
  const category = String(b.category ?? existing?.category ?? "").trim();
  const sort_order = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : (existing?.sort_order ?? 0);

  const image_url =
    b.image_url !== undefined ? (String(b.image_url ?? "").trim() || null) : (existing?.image_url ?? null);

  const attachments_json = normalizeOpportunityAttachmentsJson(b.attachments, existing?.attachments_json);

  let status = existing ? existing.status : "draft";
  let scheduled_for = existing?.scheduled_for ?? null;

  if (b.status !== undefined) {
    const s = String(b.status).trim();
    if (s === "draft" || s === "scheduled" || s === "published") {
      status = s;
    }
  }

  if (Object.prototype.hasOwnProperty.call(b, "scheduled_for")) {
    const sf = b.scheduled_for;
    if (sf === null || sf === "") {
      scheduled_for = null;
    } else {
      const t = String(sf).trim();
      scheduled_for = t || null;
    }
  }

  let consultation_deadline: string | null = null;
  if (existing?.consultation_deadline) {
    const e = String(existing.consultation_deadline).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(e)) consultation_deadline = e;
  }
  if (Object.prototype.hasOwnProperty.call(b, "consultation_deadline")) {
    const cd = b.consultation_deadline;
    if (cd === null || cd === "") {
      consultation_deadline = null;
    } else {
      const t = String(cd).trim();
      if (!t) {
        consultation_deadline = null;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
        consultation_deadline = t;
      } else {
        consultation_deadline = null;
      }
    }
  }

  let organisme =
    existing?.organisme != null && String(existing.organisme).trim()
      ? String(existing.organisme).trim().slice(0, MAX_ORG_LIEU_LEN)
      : null;
  if (Object.prototype.hasOwnProperty.call(b, "organisme")) {
    const t = String(b.organisme ?? "").trim().slice(0, MAX_ORG_LIEU_LEN);
    organisme = t || null;
  }

  let lieu =
    existing?.lieu != null && String(existing.lieu).trim()
      ? String(existing.lieu).trim().slice(0, MAX_ORG_LIEU_LEN)
      : null;
  if (Object.prototype.hasOwnProperty.call(b, "lieu")) {
    const t = String(b.lieu ?? "").trim().slice(0, MAX_ORG_LIEU_LEN);
    lieu = t || null;
  }

  return {
    title,
    summary,
    body: bodyText,
    link_url,
    image_url,
    attachments_json,
    category,
    sort_order,
    status,
    scheduled_for,
    consultation_deadline,
    organisme,
    lieu,
  };
}
