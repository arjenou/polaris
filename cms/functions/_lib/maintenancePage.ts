export interface MaintenancePageRow {
  id: number;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
  updated_at: string;
}

export function toMaintenancePageApiShape(row: MaintenancePageRow, origin: string) {
  return {
    imageKey: row.image_key,
    imageUrl: row.image_key ? `${origin}/media/${row.image_key}` : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    updatedAt: row.updated_at,
  };
}

export function toMaintenancePagePublicShape(row: MaintenancePageRow, origin: string) {
  if (!row.image_key) return null;
  return {
    src: `${origin}/media/${row.image_key}`,
    width: row.image_width ?? 1920,
    height: row.image_height ?? 1080,
  };
}
