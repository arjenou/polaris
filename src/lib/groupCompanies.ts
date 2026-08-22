import type { CompanyCard } from "@/components/pages/CompanyCards";

// Content is managed via the Polaris CMS (Cloudflare Pages + D1 + R2). See /cms.
const CMS_API_URL = process.env.CMS_API_URL ?? "https://polaris.api.yingmu-tech.com";

const REVALIDATE_SECONDS = 300;

interface GroupCompanyApiShape {
  id: number;
  name: string;
  business: string;
  address: string;
  phone: string | null;
  established: string | null;
  capital: string | null;
  representative: string | null;
  image: string | null;
  href: string | null;
  comingSoon: boolean;
}

function toCompanyCard(item: GroupCompanyApiShape): CompanyCard {
  return {
    id: item.id,
    name: item.name,
    business: item.business,
    address: item.address,
    phone: item.phone ?? undefined,
    established: item.established ?? undefined,
    capital: item.capital ?? undefined,
    representative: item.representative ?? undefined,
    image: item.image ?? "",
    href: item.href ?? undefined,
    comingSoon: item.comingSoon,
  };
}

export async function getGroupCompanies(
  locale: "ja" | "zh",
): Promise<{ domestic: CompanyCard[]; overseas: CompanyCard[] }> {
  try {
    const res = await fetch(`${CMS_API_URL}/api/group-companies?locale=${locale}`, {
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return { domestic: [], overseas: [] };
    const data: { domestic: GroupCompanyApiShape[]; overseas: GroupCompanyApiShape[] } = await res.json();
    return {
      domestic: data.domestic.map(toCompanyCard),
      overseas: data.overseas.map(toCompanyCard),
    };
  } catch {
    return { domestic: [], overseas: [] };
  }
}
