export interface ObjectPosition {
  x: number;
  y: number;
}

export const DEFAULT_OBJECT_POSITION: ObjectPosition = { x: 50, y: 0 };

export function clampObjectPosition(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export function formatObjectPosition(position: ObjectPosition): string {
  return `${position.x}% ${position.y}%`;
}

/** How many rendered pixels extend beyond the frame when object-fit: cover is used. */
export function getCoverOverflow(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
): { overflowX: number; overflowY: number } {
  const frameAspect = frameWidth / frameHeight;
  const imageAspect = imageWidth / imageHeight;

  if (imageAspect > frameAspect) {
    const renderedWidth = frameHeight * imageAspect;
    return { overflowX: renderedWidth - frameWidth, overflowY: 0 };
  }

  const renderedHeight = frameWidth / imageAspect;
  return { overflowX: 0, overflowY: renderedHeight - frameHeight };
}

export function applyCoverDrag(
  start: ObjectPosition,
  dx: number,
  dy: number,
  overflowX: number,
  overflowY: number,
): ObjectPosition {
  return {
    x:
      overflowX > 0
        ? clampObjectPosition(start.x - (dx / overflowX) * 100)
        : 50,
    y:
      overflowY > 0
        ? clampObjectPosition(start.y - (dy / overflowY) * 100)
        : start.y,
  };
}
