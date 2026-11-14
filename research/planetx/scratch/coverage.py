import sys, io, urllib.request, numpy as np
from astropy.io.votable import parse
from astropy.time import Time
T={"EpsIndB":(331.0438,-56.7828),"RWAur":(76.9564,30.4014),"RDra":(248.1675,66.7550)}
out=open('coverage_summary2.txt','w')
def P(*a):
    s=' '.join(str(x) for x in a); print(s); out.write(s+'\n')
for name,(ra,dec) in T.items():
  for col in ["spherex_qr2","spherex_qr3","spherex_qr2_deep","spherex_qr3_deep"]:
    url=f"https://irsa.ipac.caltech.edu/SIA?COLLECTION={col}&POS=circle+{ra}+{dec}+0.0005&RESPONSEFORMAT=VOTABLE"
    import time
    for k in range(4):
        try: data=urllib.request.urlopen(url,timeout=280).read(); break
        except Exception as e: print('retry',e); time.sleep(10)
    t=parse(io.BytesIO(data)).get_first_table().to_table(use_names_over_ids=True)
    if len(t)==0: P(name,col,"0 images"); continue
    t.write(f"cov_{name}_{col}.csv",format='csv',overwrite=True)
    mjd=np.sort(np.array(t['t_min'],float)); gaps=np.diff(mjd); 
    starts=[mjd[0]]+list(mjd[1:][gaps>3]); 
    # visit = cluster separated by >3 d
    vis=[]; cur=[mjd[0]]
    for g,m in zip(gaps,mjd[1:]):
        if g>3: vis.append(cur); cur=[m]
        else: cur.append(m)
    vis.append(cur)
    det={d:int((t['energy_bandpassname']==d).sum()) for d in sorted(set(t['energy_bandpassname']))}
    P(f"{name} {col}: {len(t)} imgs, {len(set(t['obs_id']))} obs_ids, det {det}, mjd {mjd[0]:.2f}-{mjd[-1]:.2f} ({Time(mjd[0],format='mjd').iso[:10]} .. {Time(mjd[-1],format='mjd').iso[:10]})")
    for v in vis: P(f"   visita {Time(v[0],format='mjd').iso[:10]} .. {Time(v[-1],format='mjd').iso[:10]}: {len(v)} imgs, span {v[-1]-v[0]:.2f} d")
    P("   versiones:", sorted(set(u.split('/')[-1].split('_spx_')[1] for u in t['access_url'])))
