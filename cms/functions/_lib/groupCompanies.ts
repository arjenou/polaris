/// <reference types="@cloudflare/workers-types" />

export const GROUP_COMPANY_REGIONS = ["domestic", "overseas"] as const;
export type GroupCompanyRegion = (typeof GROUP_COMPANY_REGIONS)[number];

export function isGroupCompanyRegion(value: unknown): value is GroupCompanyRegion {
  return typeof value === "string" && (GROUP_COMPANY_REGIONS as readonly string[]).includes(value);
}

export interface GroupCompanyRow {
  id: number;
  locale: string;
  region: string;
  name: string;
  business: string;
  address: string;
  phone: string | null;
  established: string | null;
  capital: string | null;
  representative: string | null;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
  href: string | null;
  coming_soon: number;
  published: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GroupCompanyInput {
  locale?: string;
  region?: string;
  name?: string;
  business?: string;
  address?: string;
  phone?: string | null;
  established?: string | null;
  capital?: string | null;
  representative?: string | null;
  imageKey?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  href?: string | null;
  comingSoon?: boolean;
  published?: boolean;
}

export function toGroupCompanyApiShape(row: GroupCompanyRow, origin: string) {
  return {
    id: row.id,
    locale: row.locale,
    region: row.region,
    name: row.name,
    business: row.business,
    address: row.address,
    phone: row.phone,
    established: row.established,
    capital: row.capital,
    representative: row.representative,
    imageKey: row.image_key,
    imageUrl: row.image_key ? `${origin}/media/${row.image_key}` : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    href: row.href,
    comingSoon: Boolean(row.coming_soon),
    published: row.published !== 0,
    sortOrder: row.sort_order,
  };
}

export function validateGroupCompany(input: GroupCompanyInput): string | null {
  if (input.locale !== "ja" && input.locale !== "zh") return "locale 必须是 ja 或 zh";
  if (!isGroupCompanyRegion(input.region)) return "region 必须是 domestic 或 overseas";
  if (!input.name) return "企业名称不能为空";
  return null;
}
