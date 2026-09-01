export const SUPER_ADMIN_USERNAME = "admin";

export function isSuperAdmin(username: string | null | undefined): boolean {
  return username === SUPER_ADMIN_USERNAME;
}

export function getDefaultAdminRoute(username: string | null | undefined): string {
  return isSuperAdmin(username) ? "/news" : "/contact-submissions";
}
