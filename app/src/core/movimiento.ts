// Cuándo la app puede decir "se mueve": solo si la canalización midió el
// movimiento y es una detección (al menos 3 sigma) en un campo que no está
// marcado como parcial. Si no, se presenta como cota superior o no se muestra.

export const SIGMA_DETECCION = 3;

export type EstadoMovimiento = 'detectado' | 'cota' | 'sin-medida';

export function estadoMovimiento(
  fit: { mu: number; mu_err: number } | null | undefined,
  status?: string,
): EstadoMovimiento {
  if (!fit || !Number.isFinite(fit.mu) || !Number.isFinite(fit.mu_err) || fit.mu_err <= 0) return 'sin-medida';
  if (status === 'parcial' || fit.mu / fit.mu_err < SIGMA_DETECCION) return 'cota';
  return 'detectado';
}
