import fs from 'node:fs';
import { predecir } from './predecir.mjs';
const modelo = JSON.parse(fs.readFileSync(new URL('./modelo.json', import.meta.url)));
const par = JSON.parse(fs.readFileSync(new URL('./paridad.json', import.meta.url)));
let mal = 0, maxDif = 0;
for (const e of par.ejemplos) {
  const r = predecir(modelo, e.x);
  if (r.clase !== e.clase_sklearn) mal++;
  par.clases.forEach((c, j) => { maxDif = Math.max(maxDif, Math.abs(r.probabilidad[c] - e.prob[j])); });
}
console.log(`ejemplos: ${par.ejemplos.length}, clases distintas: ${mal}, diferencia maxima de probabilidad: ${maxDif.toExponential(2)}`);
process.exit(mal === 0 && maxDif < 1e-6 ? 0 : 1);
