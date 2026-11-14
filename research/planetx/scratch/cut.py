import time, urllib.request, numpy as np
from astropy.table import Table
from astropy.io import fits
from astropy.wcs import WCS
from astropy.time import Time
t=Table.read('cov_WISE0855_spherex_qr2.csv',format='csv')
d6=t[t['energy_bandpassname']=='SPHEREx-D6']; d6.sort('t_min')
for row in [d6[0], d6[-1]]:
    url=row['access_url']+"?center=133.795129,-7.245147&size=0.03&gzip=false"
    t0=time.time(); fn='cutouts/'+row['obs_id']+'_D6.fits'
    urllib.request.urlretrieve(url,fn); dt=time.time()-t0
    h=fits.open(fn)
    print('---',row['obs_id'],Time(row['t_min'],format='mjd').iso[:16],f'{dt:.1f}s', [ (x.name, getattr(x,'shape',None) if x.is_image else len(x.data)) for x in h])
    hd=h['IMAGE'].header
    keys=[k for k in ['BUNIT','DETECTOR','MJD-AVG','DATE-AVG','VERSION','PSF_FWHM','CRPIX1A','CRPIX2A','CTYPE1','CTYPE1A','CTYPE3','A_ORDER','PSCALE'] if k in hd]
    print({k:hd[k] for k in keys})
    w=WCS(hd); x,y=w.world_to_pixel_values(133.795129,-7.245147); print('pix of target',x,y)
    fl=h['FLAGS'].data; print('flags uniq', np.unique(fl)[:20])
    im=h['IMAGE'].data; z=h['ZODI'].data; print('img med',np.nanmedian(im),'zodi med',np.nanmedian(z),'max',np.nanmax(im-z))
    ww=h['WCS-WAVE']; print('WCS-WAVE cols', ww.columns.names)
h=fits.open(fn); print(repr(h['FLAGS'].header)[:3000])
