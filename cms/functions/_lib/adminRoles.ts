export const SUPER_ADMIN_USERNAME = "admin";

export function isSuperAdmin(username: string): boolean {
  return username === SUPER_ADMIN_USERNAME;
}

/** Non–super-admin accounts may only call contact-submission admin APIs. */
export function isContactSubmissionsAdminPath(pathname: string): boolean {
  return pathname.startsWith("/api/admin/contact-submissions");
}
