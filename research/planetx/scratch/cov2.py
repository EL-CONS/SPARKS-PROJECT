import io, os, time, urllib.request, numpy as np
from astropy.io.votable import parse
from astropy.table import Table
from astropy.time import Time
T={"WISE0855":(133.795129,-7.245147),"Barnard":(269.4486,4.7672),"EpsIndB":(331.0438,-56.7828),"RWAur":(76.9564,30.4014),"RDra":(248.1675,66.7550)}
out=open('coverage_summary_all.txt','w')
def P(s): print(s,flush=True); out.write(s+'\n'); out.flush()
for name,(ra,dec) in T.items():
  for col in ["spherex_qr2","spherex_qr3"]:
    fn=f"cov_{name}_{col}.csv"
    if not os.path.exists(fn):
        url=f"https://irsa.ipac.caltech.edu/SIA?COLLECTION={col}&POS=circle+{ra}+{dec}+0.0005&RESPONSEFORMAT=VOTABLE"
        t0=time.time(); data=urllib.request.urlopen(url,timeout=280).read()
        t=parse(io.BytesIO(data)).get_first_table().to_table(use_names_over_ids=True)
        P(f"[{name} {col}] SIA {time.time()-t0:.1f}s")
        if len(t)==0: P(f"{name} {col}: 0 imagenes"); continue
        for c in t.colnames:
            if t[c].dtype.kind=='O': t[c]=[str(x) for x in t[c]]
        t.write(fn,format='csv',overwrite=True)
    t=Table.read(fn,format='csv')
    mjd=np.sort(np.array(t['t_min'],float))
    vis=[];cur=[mjd[0]]
    for a,b in zip(mjd[:-1],mjd[1:]):
        if b-a>3: vis.append(cur);cur=[b]
        else: cur.append(b)
    vis.append(cur)
    det={d[-2:]:int((t['energy_bandpassname']==d).sum()) for d in sorted(set(t['energy_bandpassname']))}
    P(f"{name} {col}: {len(t)} imgs, {len(set(t['obs_id']))} obs_ids, por detector {det}, {Time(mjd[0],format='mjd').iso[:10]}..{Time(mjd[-1],format='mjd').iso[:10]}, texp mediana {np.median(t['t_exptime']):.1f}s, tamano mediano {np.median(t['access_estsize'])/1024:.1f} MB")
    for v in vis: P(f"   bloque {Time(v[0],format='mjd').iso[:10]}..{Time(v[-1],format='mjd').iso[:10]}: {len(v)} imgs")
