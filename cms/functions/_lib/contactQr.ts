export type ContactQrType = "wechat" | "line";

export function isContactQrType(value: unknown): value is ContactQrType {
  return value === "wechat" || value === "line";
}

export interface ContactQrRow {
  id: number;
  type: string;
  image_key: string | null;
  image_width: number | null;
  image_height: number | null;
  updated_at: string;
}

export function toContactQrApiShape(row: ContactQrRow, origin: string) {
  return {
    type: row.type,
    imageKey: row.image_key,
    imageUrl: row.image_key ? `${origin}/media/${row.image_key}` : null,
    imageWidth: row.image_width,
    imageHeight: row.image_height,
    updatedAt: row.updated_at,
  };
}
