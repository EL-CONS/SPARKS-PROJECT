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
clean_patch = np.nan_to_num(patch, nan=0.0)
H, W = clean_patch.shape
noise_sigma = mf["scales"]["1"]["noise"]

# 1. Picos discretos directos (máximo positivo y mínimo negativo de píxel)
p_max = np.unravel_index(np.nanargmax(patch), patch.shape)
n_min = np.unravel_index(np.nanargmin(patch), patch.shape)
p_peak_x, p_peak_y = 20 + p_max[1], 20 + p_max[0]
n_peak_x, n_peak_y = 20 + n_min[1], 20 + n_min[0]
sep_peak_px = np.hypot(p_max[0] - n_min[0], p_max[1] - n_min[1])

# 2. Centroides ponderados de la ventana (algoritmo ml/features.py)
p_max_y, p_max_x = p_max
y_min, y_max = max(0, p_max_y - 4), min(H, p_max_y + 5)
x_min, x_max = max(0, p_max_x - 4), min(W, p_max_x + 5)
sub_pos = np.maximum(0.0, clean_patch[y_min:y_max, x_min:x_max] - 1.5 * noise_sigma)
w_pos = sub_pos ** 2
sub_y, sub_x = np.mgrid[y_min:y_max, x_min:x_max]
pos_yc = float(np.sum(sub_y * w_pos) / np.sum(w_pos))
pos_xc = float(np.sum(sub_x * w_pos) / np.sum(w_pos))

n_min_y, n_min_x = n_min
y_min, y_max = max(0, n_min_y - 4), min(H, n_min_y + 5)
x_min, x_max = max(0, n_min_x - 4), min(W, n_min_x + 5)
sub_neg = np.maximum(0.0, -clean_patch[y_min:y_max, x_min:x_max] - 1.5 * noise_sigma)
w_neg = sub_neg ** 2
sub_y, sub_x = np.mgrid[y_min:y_max, x_min:x_max]
neg_yc = float(np.sum(sub_y * w_neg) / np.sum(w_neg))
neg_xc = float(np.sum(sub_x * w_neg) / np.sum(w_neg))

p_cent_x, p_cent_y = 20 + pos_xc, 20 + pos_yc
n_cent_x, n_cent_y = 20 + neg_xc, 20 + neg_yc
sep_cent_px = np.hypot(pos_yc - neg_yc, pos_xc - neg_xc)

fig, ax = plt.subplots(figsize=(7, 7))
im = ax.imshow(patch, cmap='coolwarm', origin='lower', extent=[20, 44, 20, 44])
plt.colorbar(im, ax=ax, label='Flujo residual (MJy/sr)')

# Marcar centro nominal de Barnard
ax.plot(32, 32, 'k+', markersize=14, mew=2.5, label='Centro nominal (32, 32)')

# 1. Picos discretos
ax.plot(p_peak_x, p_peak_y, 'o', color='#FFB238', markersize=9, mew=1.5, mec='black',
        label=f'Pico pos. S2 ({p_peak_x}, {p_peak_y}) [Sep picos: {sep_peak_px:.2f} px]')
ax.plot(n_peak_x, n_peak_y, 's', color='#62B6E8', markersize=9, mew=1.5, mec='black',
        label=f'Pico neg. S0 ({n_peak_x}, {n_peak_y})')
ax.annotate('', xy=(p_peak_x, p_peak_y), xytext=(n_peak_x, n_peak_y),
            arrowprops=dict(arrowstyle="->", color="white", lw=2.5))

# 2. Centroides ponderados ML
ax.plot(p_cent_x, p_cent_y, 'd', color='#FF6B00', markersize=9, mew=1.5, mec='white',
        label=f'Centroide ponderado pos. ({p_cent_x:.1f}, {p_cent_y:.1f}) [Sep: {sep_cent_px:.2f} px]')
ax.plot(n_cent_x, n_cent_y, '^', color='#0055FF', markersize=9, mew=1.5, mec='white',
        label=f'Centroide ponderado neg. ({n_cent_x:.1f}, {n_cent_y:.1f})')
ax.plot([n_cent_x, p_cent_x], [n_cent_y, p_cent_y], 'k--', lw=1.5, alpha=0.8)

title = (
    f'Residuo SPHEREx D1 (S0 vs S2) - Estrella de Barnard\n'
    f'Picos directos: {sep_peak_px:.2f} px (Teórico astrométrico: ~1.67 px a 6.15"/px)\n'
    f'Centroides ponderados ML: {sep_cent_px:.2f} px (sesgo de ventana extendida)'
)
ax.set_title(title, fontsize=9.5)
ax.set_xlabel('Píxeles X')
ax.set_ylabel('Píxeles Y')
ax.legend(loc='lower left', fontsize=7.8, framealpha=0.9)

out_img = os.path.join(repo_root, "ml", "residuo_barnard_det1.png")
plt.tight_layout()
plt.savefig(out_img, dpi=150)
print(f"Figura guardada exitosamente en {out_img}")
