// Inferencia del bosque aleatorio exportado en modelo.json. Sin dependencias.
// x = [en_gaia, log10_paralaje, mg_gaia, bp_rp, g_mag, log10_mu]; usar -999 si no hay dato.
export function predecir(modelo, x) {
  const k = modelo.clases.length;
  const suma = new Array(k).fill(0);
  for (const nodos of modelo.arboles) {
    let i = 0;
    while (!nodos[i].hoja) i = x[nodos[i].f] <= nodos[i].t ? nodos[i].i : nodos[i].d;
    nodos[i].p.forEach((p, j) => { suma[j] += p; });
  }
  const prob = suma.map((s) => s / modelo.arboles.length);
  const mejor = prob.indexOf(Math.max(...prob));
  return { clase: modelo.clases[mejor], probabilidad: Object.fromEntries(modelo.clases.map((c, j) => [c, prob[j]])) };
}
