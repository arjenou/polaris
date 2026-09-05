export interface ObjectPosition {
  x: number;
  y: number;
}

export const DEFAULT_OBJECT_POSITION: ObjectPosition = { x: 50, y: 0 };

export function formatObjectPosition(position?: ObjectPosition | null): string | undefined {
  if (!position) return undefined;
  return `${position.x}% ${position.y}%`;
}
