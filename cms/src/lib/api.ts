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
