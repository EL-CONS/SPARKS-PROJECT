import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np

from ml.reader import load_diffs, load_manifest

repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
data_dir = os.path.join(repo_root, "data-sample", "barnard")

diffs = load_diffs(data_dir)
mf = load_manifest(data_dir)

# Diff 1: Detector 1, Season 0 vs Season 2
d1 = diffs[1]
patch = d1[20:44, 20:44]

# Pico positivo y negativo en el recorte
p_max = np.unravel_index(np.nanargmax(patch), patch.shape)
n_min = np.unravel_index(np.nanargmin(patch), patch.shape)

fig, ax = plt.subplots(figsize=(6, 6))
im = ax.imshow(patch, cmap='coolwarm', origin='lower', extent=[20, 44, 20, 44])
plt.colorbar(im, ax=ax, label='Flujo residual (MJy/sr)')

# Marcar centro nominal de Barnard
ax.plot(32, 32, 'k+', markersize=12, mew=2, label='Centro nominal (32, 32)')

# Marcar lóbulos detectados
ax.plot(20 + p_max[1], 20 + p_max[0], 'o', color='#FFB238', markersize=9, label=f'Lóbulo positivo S2 ({20+p_max[1]}, {20+p_max[0]})')
ax.plot(20 + n_min[1], 20 + n_min[0], 's', color='#62B6E8', markersize=9, label=f'Lóbulo negativo S0 ({20+n_min[1]}, {20+n_min[0]})')

# Dibujar flecha de desplazamiento observado
ax.annotate(
    '',
    xy=(20 + p_max[1], 20 + p_max[0]),
    xytext=(20 + n_min[1], 20 + n_min[0]),
    arrowprops=dict(arrowstyle="->", color="white", lw=2)
)

sep_px = np.hypot(p_max[0] - n_min[0], p_max[1] - n_min[1])
ax.set_title(f'Residuo SPHEREx D1 (S0 vs S2) - Estrella de Barnard\nSeparación de picos: {sep_px:.2f} px (Esperado: ~1.67 px a 6.15"/px)', fontsize=10)
ax.set_xlabel('Píxeles X')
ax.set_ylabel('Píxeles Y')
ax.legend(loc='lower left', fontsize=8)

out_img = os.path.join(repo_root, "ml", "residuo_barnard_det1.png")
plt.tight_layout()
plt.savefig(out_img, dpi=150)
print(f"Figura guardada exitosamente en {out_img}")
