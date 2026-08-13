export interface NewsPost {
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
  createdAt: string;
  updatedAt: string;
}

export type NewsPostInput = Omit<NewsPost, "id" | "imageUrl" | "createdAt" | "updatedAt">;

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

export const newsApi = {
  list: (locale?: "ja" | "zh") =>
    request<NewsPost[]>(`/api/admin/news${locale ? `?locale=${locale}` : ""}`),
  get: (id: number) => request<NewsPost>(`/api/admin/news/${id}`),
  create: (input: NewsPostInput) =>
    request<NewsPost>("/api/admin/news", { method: "POST", body: JSON.stringify(input) }),
  update: (id: number, input: NewsPostInput) =>
    request<NewsPost>(`/api/admin/news/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id: number) => request<{ ok: true }>(`/api/admin/news/${id}`, { method: "DELETE" }),
};

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
