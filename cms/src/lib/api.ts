/**
 * Shape shared by every content type built on the news/recommended post
 * model (see cms/functions/_lib/postsApi.ts on the backend).
 */
export interface ContentPost {
  id: number;
  locale: "ja" | "zh";
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  content: string;
  imageKey: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  published: boolean;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContentPostInput = Omit<ContentPost, "id" | "imageUrl" | "createdAt" | "updatedAt">;

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(body.error ?? "请求失败", res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export { ApiError };

export const authApi = {
  login: (username: string, password: string) =>
    request<{ ok: true; username: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ authenticated: boolean; username?: string }>("/api/auth/me"),
};

export interface ContentApi {
  list: (locale?: "ja" | "zh") => Promise<ContentPost[]>;
  get: (id: number) => Promise<ContentPost>;
  create: (input: ContentPostInput) => Promise<ContentPost>;
  update: (id: number, input: ContentPostInput) => Promise<ContentPost>;
  remove: (id: number) => Promise<{ ok: true }>;
}

function createContentApi(basePath: string): ContentApi {
  return {
    list: (locale) => request<ContentPost[]>(`${basePath}${locale ? `?locale=${locale}` : ""}`),
    get: (id) => request<ContentPost>(`${basePath}/${id}`),
    create: (input) => request<ContentPost>(basePath, { method: "POST", body: JSON.stringify(input) }),
    update: (id, input) => request<ContentPost>(`${basePath}/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    remove: (id) => request<{ ok: true }>(`${basePath}/${id}`, { method: "DELETE" }),
  };
}

export const newsApi = createContentApi("/api/admin/news");
export const recommendedApi = createContentApi("/api/admin/recommended");

export const mediaApi = {
  upload: (file: File, folder = "news") => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ key: string; url: string; width: number | null; height: number | null }>(
      `/api/admin/media/upload?folder=${folder}`,
      { method: "POST", body: formData },
    );
  },
};

export interface AdminUser {
  id: number;
  username: string;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  list: () => request<AdminUser[]>("/api/admin/users"),
  create: (username: string, password: string) =>
    request<{ id: number; username: string }>("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  remove: (id: number) => request<{ ok: true }>(`/api/admin/users/${id}`, { method: "DELETE" }),
};

export const accountApi = {
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>("/api/admin/account/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export interface TeamMember {
  id: number;
  locale: "ja" | "zh";
  lastName: string;
  firstName: string;
  lastNameKana: string;
  firstNameKana: string;
  department: string;
  position: string;
  description: string;
  tags: string[];
  languages: string[];
  imageKey: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  sortOrder: number;
  published: boolean;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export type TeamMemberInput = Omit<
  TeamMember,
  "id" | "imageUrl" | "sortOrder" | "submissionCount" | "createdAt" | "updatedAt"
>;

export const teamApi = {
  list: (locale?: "ja" | "zh") => request<TeamMember[]>(`/api/admin/team${locale ? `?locale=${locale}` : ""}`),
  get: (id: number) => request<TeamMember>(`/api/admin/team/${id}`),
  create: (input: TeamMemberInput) =>
    request<TeamMember>("/api/admin/team", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: TeamMemberInput) =>
    request<TeamMember>(`/api/admin/team/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: number) => request<{ ok: true }>(`/api/admin/team/${id}`, { method: "DELETE" }),
  reorder: (locale: "ja" | "zh", orderedIds: number[]) =>
    request<{ ok: true }>("/api/admin/team/reorder", { method: "POST", body: JSON.stringify({ locale, orderedIds }) }),
};

export interface ContactSubmission {
  id: number;
  locale: "ja" | "zh";
  memberId: number | null;
  memberName: string | null;
  name: string;
  furigana: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  contactMethod: string;
  createdAt: string;
}

export const contactSubmissionsApi = {
  list: () => request<ContactSubmission[]>("/api/admin/contact-submissions"),
  get: (id: number) => request<ContactSubmission>(`/api/admin/contact-submissions/${id}`),
};

export type ContactQrType = "wechat" | "line";

export interface ContactQr {
  type: ContactQrType;
  imageKey: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  updatedAt: string;
}

export const contactQrApi = {
  list: () => request<ContactQr[]>("/api/admin/contact-qr"),
  update: (type: ContactQrType, imageKey: string, imageWidth: number | null, imageHeight: number | null) =>
    request<ContactQr>(`/api/admin/contact-qr/${type}`, {
      method: "PUT",
      body: JSON.stringify({ imageKey, imageWidth, imageHeight }),
    }),
  remove: (type: ContactQrType) =>
    request<ContactQr>(`/api/admin/contact-qr/${type}`, { method: "DELETE" }),
};

/** The three fixed content pages whose bottom photo carousel is managed here. */
export type PageGalleryKey = "real-estate" | "renovation" | "asset-management";

export interface PageGalleryImage {
  id: number;
  pageKey: PageGalleryKey;
  imageKey: string;
  imageUrl: string;
  imageWidth: number | null;
  imageHeight: number | null;
  sortOrder: number;
}

export const pageGalleriesApi = {
  list: (pageKey: PageGalleryKey) => request<PageGalleryImage[]>(`/api/admin/page-galleries/${pageKey}`),
  add: (pageKey: PageGalleryKey, imageKey: string, imageWidth: number | null, imageHeight: number | null) =>
    request<PageGalleryImage>(`/api/admin/page-galleries/${pageKey}`, {
      method: "POST",
      body: JSON.stringify({ imageKey, imageWidth, imageHeight }),
    }),
  remove: (pageKey: PageGalleryKey, id: number) =>
    request<{ ok: true }>(`/api/admin/page-galleries/${pageKey}/${id}`, { method: "DELETE" }),
  reorder: (pageKey: PageGalleryKey, orderedIds: number[]) =>
    request<{ ok: true }>("/api/admin/page-galleries/reorder", {
      method: "POST",
      body: JSON.stringify({ pageKey, orderedIds }),
    }),
};

export interface PageAdvantage {
  id: number;
  pageKey: PageGalleryKey;
  locale: "ja" | "zh";
  badge: string;
  heading: string;
  body: string;
  imageKey: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  sortOrder: number;
}

export type PageAdvantageInput = Omit<PageAdvantage, "id" | "pageKey" | "imageUrl" | "sortOrder">;

export const pageAdvantagesApi = {
  list: (pageKey: PageGalleryKey, locale?: "ja" | "zh") =>
    request<PageAdvantage[]>(`/api/admin/page-advantages/${pageKey}${locale ? `?locale=${locale}` : ""}`),
  get: (pageKey: PageGalleryKey, id: number) =>
    request<PageAdvantage>(`/api/admin/page-advantages/${pageKey}/${id}`),
  create: (pageKey: PageGalleryKey, input: PageAdvantageInput) =>
    request<PageAdvantage>(`/api/admin/page-advantages/${pageKey}`, {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (pageKey: PageGalleryKey, id: number, input: PageAdvantageInput) =>
    request<PageAdvantage>(`/api/admin/page-advantages/${pageKey}/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  remove: (pageKey: PageGalleryKey, id: number) =>
    request<{ ok: true }>(`/api/admin/page-advantages/${pageKey}/${id}`, { method: "DELETE" }),
  reorder: (pageKey: PageGalleryKey, locale: "ja" | "zh", orderedIds: number[]) =>
    request<{ ok: true }>("/api/admin/page-advantages/reorder", {
      method: "POST",
      body: JSON.stringify({ pageKey, locale, orderedIds }),
    }),
};

export type GroupCompanyRegion = "domestic" | "overseas";

export interface GroupCompany {
  id: number;
  locale: "ja" | "zh";
  region: GroupCompanyRegion;
  name: string;
  business: string;
  address: string;
  imageKey: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  href: string | null;
  comingSoon: boolean;
  sortOrder: number;
}

export type GroupCompanyInput = Omit<GroupCompany, "id" | "imageUrl" | "sortOrder">;

export const groupCompaniesApi = {
  list: (locale?: "ja" | "zh", region?: GroupCompanyRegion) => {
    const params = new URLSearchParams();
    if (locale) params.set("locale", locale);
    if (region) params.set("region", region);
    const qs = params.toString();
    return request<GroupCompany[]>(`/api/admin/group-companies${qs ? `?${qs}` : ""}`);
  },
  get: (id: number) => request<GroupCompany>(`/api/admin/group-companies/${id}`),
  create: (input: GroupCompanyInput) =>
    request<GroupCompany>("/api/admin/group-companies", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: GroupCompanyInput) =>
    request<GroupCompany>(`/api/admin/group-companies/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: number) => request<{ ok: true }>(`/api/admin/group-companies/${id}`, { method: "DELETE" }),
  reorder: (locale: "ja" | "zh", region: GroupCompanyRegion, orderedIds: number[]) =>
    request<{ ok: true }>("/api/admin/group-companies/reorder", {
      method: "POST",
      body: JSON.stringify({ locale, region, orderedIds }),
    }),
};

export interface EventOverview {
  eventName: string;
  datetime: string;
  venue: string;
  participants: string;
  content: string;
  organizer: string;
}

export interface EventGalleryImage {
  key: string;
  url: string | null;
}

export interface EventItem {
  id: number;
  locale: "ja" | "zh";
  slug: string;
  title: string;
  date: string;
  dateRange: string;
  badge: string;
  badgeColor: string;
  summary: string;
  coverImageKey: string | null;
  coverImageUrl: string | null;
  coverImageWidth: number | null;
  coverImageHeight: number | null;
  heroImageKey: string | null;
  heroImageUrl: string | null;
  heroImageWidth: number | null;
  heroImageHeight: number | null;
  videoUrl: string;
  overview: EventOverview;
  gallery: EventGalleryImage[];
  published: boolean;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type EventInput = Omit<
  EventItem,
  | "id"
  | "coverImageUrl"
  | "heroImageUrl"
  | "gallery"
  | "createdAt"
  | "updatedAt"
> & { gallery: string[] };

export const eventsApi = {
  list: (locale?: "ja" | "zh") => request<EventItem[]>(`/api/admin/events${locale ? `?locale=${locale}` : ""}`),
  get: (id: number) => request<EventItem>(`/api/admin/events/${id}`),
  create: (input: EventInput) =>
    request<EventItem>("/api/admin/events", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: EventInput) =>
    request<EventItem>(`/api/admin/events/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: number) => request<{ ok: true }>(`/api/admin/events/${id}`, { method: "DELETE" }),
};
