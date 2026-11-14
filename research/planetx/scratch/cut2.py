import glob, numpy as np
from astropy.io import fits
from astropy.wcs import WCS
from scipy.interpolate import RegularGridInterpolator as RGI
for fn in sorted(glob.glob('cutouts/*.fits')):
    h=fits.open(fn); hd=h['IMAGE'].header; w=WCS(hd)
    x,y=w.world_to_pixel_values(133.795129,-7.245147)
    ww=h['WCS-WAVE'].data[0]; X=ww['X'];Y=ww['Y'];V=ww['VALUES']
    # VALUES shape?
    V=np.array(V); print(fn, 'X',np.shape(X),'Y',np.shape(Y),'V',V.shape)
    # Use the alternate WCS 'W' if astropy understands it
    try:
        ws=WCS(hd,fobj=h,key='W'); print(' wcs W:',ws.wcs.ctype)
        print(' lambda at target', ws.pixel_to_world_values(x,y))
    except Exception as e: print(' WCS W err',e)
    im=h['IMAGE'].data-h['ZODI'].data; iy,ix=np.unravel_index(np.nanargmax(im),im.shape)
    print(' peak pix',ix,iy,'peak val',im[iy,ix],'expected',round(float(x),2),round(float(y),2), 'radec peak',w.pixel_to_world_values(ix,iy))
