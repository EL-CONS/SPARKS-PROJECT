// Selectable field of view. The pipeline delivers one cutout per field
// (manifest.field.fov_arcmin on a side); smaller fields are the central part
// of that same cutout, shown larger. Pixels are never resampled or smoothed.

export const FOV_ZOOMS = [1, 2, 4] as const;
export type FovZoom = (typeof FOV_ZOOMS)[number];

export interface FovOption {
  zoom: FovZoom;
  arcmin: number;
}

export function fovOptions(fullArcmin: number): FovOption[] {
  return FOV_ZOOMS.map(zoom => ({ zoom, arcmin: fullArcmin / zoom }));
}

/** The available option closest (in ratio) to the field of view asked for in the URL. */
export function zoomForFov(requestedArcmin: number, fullArcmin: number): FovZoom {
  if (!Number.isFinite(requestedArcmin) || requestedArcmin <= 0 || !Number.isFinite(fullArcmin) || fullArcmin <= 0) return 1;
  let best: FovZoom = 1;
  let bestDist = Infinity;
  for (const o of fovOptions(fullArcmin)) {
    const d = Math.abs(Math.log(requestedArcmin / o.arcmin));
    if (d < bestDist) {
      bestDist = d;
      best = o.zoom;
    }
  }
  return best;
}

/** Value written to ?fov= for an option: arcminutes with two decimals. */
export function fovParam(fullArcmin: number, zoom: FovZoom): number {
  return Number((fullArcmin / zoom).toFixed(2));
}

/**
 * Map a click on a square panel to cube pixel coordinates.
 * fx, fy: position inside the panel as fractions (0 = left / top).
 * Returns x (column) and y (row, 0 = southern edge) in the cube's frame,
 * using the same convention as manifest.target.points.
 */
export function panelToPixel(fx: number, fy: number, zoom: number, n: number): { x: number; y: number } {
  const u = 0.5 + (fx - 0.5) / zoom;
  const v = 0.5 + (fy - 0.5) / zoom;
  const clamp = (p: number) => Math.max(0, Math.min(n - 1, p));
  return { x: clamp(u * n - 0.5), y: clamp(n - 0.5 - v * n) };
}
